const Call = require("../models/call.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const Task = require("../models/task.js");
const Reminder = require("../models/reminder.js");
const Branch = require("../models/branch.js");
const CallResponseStage = require("../models/CallResponseStage.js");
const sequelize = require("../config");
const { Op } = require("sequelize"); // Import Op for complex queries
const LeadActivityLog = require("../models/LeadActivityLog.js"); // 🔑 New Import

// Helper to log summary as JSON array string
const jsonSummary = (messages) => JSON.stringify(Array.isArray(messages) ? messages : [messages]);

const standardizeDate = (dateValue) => {
    if (!dateValue) return null;
    const dateStr = dateValue instanceof Date ? dateValue.toISOString() : String(dateValue);
    // Replace .XXX and ensure the string ends with Z (e.g., '2025-10-15T14:01:00Z')
    return dateStr.replace(/\.\d{3}Z$/, 'Z').replace(/\.\d{1,2}Z$/, 'Z');
};

// Helper function to safely get a string/JSON value for logging (Assumed defined in scope)
const getLogValue = (val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
};

// Shared include array (remains unchanged)
const callIncludes = [
    { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
    { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
    { model: Task, as: "task", attributes: ["id", "task_name"] },
    { model: Reminder, as: "reminder", attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"] },
    { model: CallResponseStage, as: "callResponseStage", attributes: ["id", "name", "description"] }
];

function mapCallPayload(callInstance) { /* ... (remains unchanged) ... */
    const obj = callInstance.toJSON();

    if (obj.assignee) {
        obj.assigned_user = { id: obj.assignee.id, user_name: obj.assignee.user_name, email: obj.assignee.email };
    }
    delete obj.assignee;

    if (obj.lead) {
        obj.lead_id = { id: obj.lead.id, lead_name: obj.lead.lead_name };
    }
    delete obj.lead;

    if (obj.task) {
        obj.task_id = { id: obj.task.id, task_name: obj.task.task_name };
    }
    delete obj.task;

    if (obj.callResponseStage) {
        obj.call_response_id = { id: obj.callResponseStage.id, name: obj.callResponseStage.name, description: obj.callResponseStage.description };
    }
    delete obj.callResponseStage;

    if (obj.reminder) {
        obj.reminder_id = { id: obj.reminder.id, reminder_name: obj.reminder.reminder_name, reminder_date: obj.reminder.reminder_date, reminder_time: obj.reminder.reminder_time, reminder_unit: obj.reminder.reminder_unit, reminder_value: obj.reminder.reminder_value };
    }
    delete obj.reminder;

    return obj;
}


// --- NEW DEDICATED CREATE APIS ---

exports.createLogCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user } = req.body;

        if (!subject || !branch_id || !start_time) {
            return res.status(400).json({ status: "false", message: "subject, branch_id, and start_time are required" });
        }

        const call = await Call.create({
            subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user,
            call_type: 'Log',
            created_by: userId, updated_by: userId,
        });

        // 🔑 LOGGING 1: Log Call Creation if associated with a Lead
        if (lead_id) {
            const message = [`Logged Call **${call.subject}** created and linked to Lead.`];
            await LeadActivityLog.create({
                lead_id: lead_id,
                user_id: userId,
                branch_id: branch_id,
                field_name: 'Call Logged',
                summary: jsonSummary(message),
            });
        }

        const result = await Call.findByPk(call.id, { include: callIncludes });
        const mapped = mapCallPayload(result);
        res.status(201).json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call createLogCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.createScheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user, reminder } = req.body;

        // Base validation: Call essentials are still mandatory
        if (!subject || !branch_id || !start_time) {
            return res.status(400).json({ status: "false", message: "subject, branch_id, start_time are required for scheduled calls" });
        }

        // 🔑 REMINDER VALIDATION: Check for full details ONLY if reminder object is provided
        if (reminder && (!reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value)) {
            return res.status(400).json({ status: "false", message: "If reminder is provided, full reminder details (date, time, unit, value) are required." });
        }

        const result = await sequelize.transaction(async (t) => {

            const call = await Call.create({
                subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user,
                call_type: 'Schedule',
                created_by: userId, updated_by: userId,
            }, { transaction: t });

            let reminderRecord = null;
            let reminderMessage = "";

            if (reminder) {
                // Reminder object is present, create the record
                reminderRecord = await Reminder.create({
                    reminder_name: `Call Reminder: ${subject}`,
                    reminder_date: reminder.reminder_date,
                    reminder_time: reminder.reminder_time,
                    reminder_unit: reminder.reminder_unit,
                    reminder_value: reminder.reminder_value,
                    branch_id: branch_id,
                    lead_id: lead_id,
                    task_id: task_id,
                    assigned_user: assigned_user,
                    created_by: userId, updated_by: userId,
                    call_id: call.id,
                }, { transaction: t });

                // Link the reminder ID back to the Call
                await call.update({ reminder_id: reminderRecord.id }, { transaction: t });

                reminderMessage = ` with a reminder set for ${reminder.reminder_date} at ${reminder.reminder_time}.`;
            } else {
                reminderMessage = " (No reminder set).";
            }

            // 🔑 LOGGING 2: Log Scheduled Call Creation if associated with a Lead
            if (lead_id) {
                const message = [`Scheduled Call **${call.subject}** created for *${start_time}*${reminderMessage}`];
                await LeadActivityLog.create({
                    lead_id: lead_id,
                    user_id: userId,
                    branch_id: branch_id,
                    field_name: 'Call Scheduled',
                    summary: jsonSummary(message),
                }, { transaction: t });
            }

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.status(200).json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call createScheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// --- DEDICATED UPDATE APIS ---

exports.patchLogCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        // Fetch the existing call record
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        if (call.call_type !== 'Log') {
            return res.status(400).json({ status: "false", message: "This endpoint is only for Logged calls." });
        }

        const up = {};
        const changeDescriptions = [];

        // Fields to track on the Call model for Logged calls
        const fieldsToTrack = [
            "subject", "call_response_id", "direction", "start_time", "end_time", "duration",
            "summary", "lead_id", "task_id", "contact_number", "assigned_user", "branch_id"
        ];

        // 🔑 Helper to standardize date strings (must be available in scope)
        const standardizeDate = (dateValue) => {
            if (!dateValue) return null;
            const dateStr = dateValue instanceof Date ? dateValue.toISOString() : String(dateValue);
            return dateStr.replace(/\.\d{3}Z$/, 'Z').replace(/\.\d{1,2}Z$/, 'Z');
        };

        // Use transaction for atomic operation
        const result = await sequelize.transaction(async (t) => {

            // 1. Process all fields for changes
            fieldsToTrack.forEach((k) => {
                if (typeof req.body[k] !== "undefined") {
                    const oldValue = call.get(k);
                    const newValue = req.body[k];

                    let oldLogValue;
                    let newLogValue = getLogValue(newValue);

                    // Handle date/time fields specifically
                    if (k === 'start_time' || k === 'end_time') {
                        const oldStandard = standardizeDate(oldValue);
                        const newStandard = standardizeDate(newValue);

                        // Check if the substantive value changed
                        if (oldStandard === newStandard) {
                            return; // Skip logging and update if dates are the same
                        }

                        oldLogValue = oldStandard;
                        newLogValue = newStandard;
                    } else {
                        oldLogValue = getLogValue(oldValue);
                    }

                    // Check if non-date values changed
                    if (oldLogValue !== newLogValue) {
                        const fieldName = k.replace(/_/g, ' ');
                        changeDescriptions.push({
                            key: k,
                            text: `Updated **${fieldName}** from *${oldLogValue || 'NULL'}* to *${newLogValue}*`
                        });
                        up[k] = req.body[k];
                    }
                }
            });

            // 2. Final Call Update & Logging
            up.updated_by = userId;

            const totalChanges = changeDescriptions.length;

            if (totalChanges > 0) {
                // Perform the update
                await call.update(up, { transaction: t });
            } else {
                // No substantive changes. Prevent update/logging.
                return Call.findByPk(call.id, { include: callIncludes, transaction: t });
            }


            // 🔑 LOGGING 3: Log Update to Logged Call
            if (call.lead_id && totalChanges > 0) {
                // Determine dynamic field name
                const logFieldName = totalChanges > 1 ? 'Call Log Details Updated' : changeDescriptions[0].key.replace(/_/g, ' ').toUpperCase() + ' Updated';

                await LeadActivityLog.create({
                    lead_id: call.lead_id,
                    user_id: userId,
                    branch_id: call.branch_id,
                    field_name: logFieldName,
                    summary: jsonSummary(changeDescriptions.map(d => d.text)),
                }, { transaction: t });
            }


            // Re-fetch the updated item
            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchLogCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patchScheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        // Fetch the call and eagerly load the reminder data for comparison
        const call = await Call.findByPk(req.params.id, {
            include: [{ model: Reminder, as: 'reminder' }]
        });
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        if (call.call_type !== 'Schedule') {
            return res.status(400).json({ status: "false", message: "This endpoint is only for Scheduled calls." });
        }

        const up = {};
        const reminderData = req.body.reminder;
        const changeDescriptions = [];

        // --- Fields to track on the Call model ---
        const callFieldsToTrack = [
            "subject", "direction", "start_time", "summary", "lead_id", "task_id", "contact_number", "assigned_user", "branch_id"
        ];

        let isReminderChanged = false;

        // Use transaction for atomic operation
        const result = await sequelize.transaction(async (t) => {

            // 1. Process Call Record Details (Granular field logging)
            callFieldsToTrack.forEach((k) => {
                if (typeof req.body[k] !== "undefined") {
                    const oldValue = call.get(k);
                    const newValue = req.body[k];

                    let oldLogValue = getLogValue(oldValue);
                    let newLogValue = getLogValue(newValue);

                    // 🔑 FIX: Standardized Date Comparison for Log Prevention
                    if (k === 'start_time' || k === 'end_time') {
                        const oldStandard = standardizeDate(oldValue);
                        const newStandard = standardizeDate(newValue);

                        // If the standardized strings are the same, skip logging/update.
                        if (oldStandard === newStandard) {
                            return;
                        }

                        // Use the standardized strings for the log message for cleaner output
                        oldLogValue = oldStandard;
                        newLogValue = newStandard;
                    }

                    if (oldLogValue !== newLogValue) {
                        const fieldName = k.replace(/_/g, ' ');
                        changeDescriptions.push({
                            key: k,
                            text: `Updated **${fieldName}** from *${oldLogValue || 'NULL'}* to *${newLogValue}*`
                        });
                        up[k] = req.body[k];
                    }
                }
            });

            // 2. Process Reminder Details (Granular logging)
            if (call.reminder_id && call.reminder && reminderData) {
                const reminderUpdates = { updated_by: userId };
                const reminderFields = ["reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"];
                const currentReminder = call.reminder.toJSON();

                reminderFields.forEach(k => {
                    if (reminderData[k] !== undefined) {
                        const oldValue = currentReminder[k];
                        const newValue = reminderData[k];

                        const oldLogValue = getLogValue(oldValue);
                        const newLogValue = getLogValue(newValue);

                        // Check for actual value change
                        if (oldLogValue !== newLogValue) {
                            changeDescriptions.push({
                                key: `${k}`,
                                text: `Updated ** ${k.replace('_', ' ')}** from *${oldLogValue || 'NULL'}* to *${newLogValue}*`
                            });
                            reminderUpdates[k] = newValue;
                            isReminderChanged = true;
                        }
                    }
                });

                if (isReminderChanged) {
                    await Reminder.update(reminderUpdates, { where: { id: call.reminder_id }, transaction: t });
                }
            }


            // 3. Final Call Update & Logging
            up.updated_by = userId;

            const totalChanges = changeDescriptions.length;

            // Check for substantive changes: Total tracked changes > 0
            if (totalChanges > 0) {
                await call.update(up, { transaction: t });
            } else {
                // No substantive changes. Return the fetched item immediately.
                return Call.findByPk(call.id, { include: callIncludes, transaction: t });
            }


            // 🔑 LOGGING 4: Log Schedule Update
            if (call.lead_id && totalChanges > 0) {
                const logFieldName = totalChanges > 1 ? 'Call Details Updated' : changeDescriptions[0].key.replace(/_/g, ' ').toUpperCase() + ' Updated';

                await LeadActivityLog.create({
                    lead_id: call.lead_id,
                    user_id: userId,
                    branch_id: call.branch_id,
                    field_name: logFieldName,
                    summary: jsonSummary(changeDescriptions.map(d => d.text)),
                }, { transaction: t });
            }

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchScheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patchRescheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        // Fetch the call (no need for reminder include here, as we only need the ID/time)
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        const { start_time, reminder } = req.body;

        // 🔑 FIX: Standardize the existing start_time before capturing it for logging and comparison.
        // This ensures comparison ignores microsecond noise.
        const oldStartTimeStandard = standardizeDate(call.start_time);
        const newStartTimeStandard = standardizeDate(start_time);

        // Validation for required fields
        if (!start_time || !reminder || !reminder.reminder_name || !reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value || !call.reminder_id) {
            return res.status(400).json({ status: "false", message: "New start_time and full reminder details are required for rescheduling a call with a linked reminder." });
        }

        // Check if the start time is actually changing. If not, this is not a reschedule event.
        if (oldStartTimeStandard === newStartTimeStandard) {
            return res.status(400).json({ status: "false", message: "The new start_time must be different from the current scheduled time to perform a reschedule." });
        }

        const result = await sequelize.transaction(async (t) => {

            // 1. Update Call record: change type and time
            await call.update({
                call_type: 'Reschedule', // 🔑 Set type to Reschedule
                start_time: start_time,
                updated_by: userId,
            }, { transaction: t });

            // 2. Update Reminder record
            await Reminder.update({
                reminder_name: reminder.reminder_name,
                reminder_date: reminder.reminder_date,
                reminder_time: reminder.reminder_time,
                reminder_unit: reminder.reminder_unit,
                reminder_value: reminder.reminder_value,
                updated_by: userId,
            }, { where: { id: call.reminder_id }, transaction: t });

            // 🔑 LOGGING 5: Log Call Reschedule
            if (call.lead_id) {
                // Use the standardized strings for cleaner logging
                const message = [`Call **${call.subject}** rescheduled from *${oldStartTimeStandard}* to *${newStartTimeStandard}*.`];

                await LeadActivityLog.create({
                    lead_id: call.lead_id,
                    user_id: userId,
                    branch_id: call.branch_id,
                    field_name: 'Call Rescheduled',
                    summary: jsonSummary(message),
                }, { transaction: t });
            }

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchRescheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patchCancelCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        if (call.call_type === 'Log' || call.call_type === 'Cancelled') {
            return res.status(400).json({ status: "false", message: "Cannot cancel a logged or already cancelled call." });
        }

        const result = await sequelize.transaction(async (t) => {

            await call.update({
                call_type: 'Cancelled',
                end_time: new Date(),
                reminder_id: null,
                updated_by: userId,
            }, { transaction: t });

            if (call.reminder_id) {
                await Reminder.destroy({ where: { id: call.reminder_id } });
            }

            // 🔑 LOGGING 6: Log Call Cancellation
            if (call.lead_id) {
                const message = [`Call **${call.subject}** was cancelled.`];
                await LeadActivityLog.create({
                    lead_id: call.lead_id,
                    user_id: userId,
                    branch_id: call.branch_id,
                    field_name: 'Call Cancelled',
                    summary: jsonSummary(message),
                }, { transaction: t });
            }

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });


        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchCancelCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        // 🔑 LOGGING 7: Log Call Deletion
        if (call.lead_id) {
            const message = [`Call **${call.subject}** was permanently deleted.`];
            await LeadActivityLog.create({
                lead_id: call.lead_id,
                user_id: req.user?.id || null,
                branch_id: call.branch_id,
                field_name: 'Call Deleted',
                summary: jsonSummary(message),
            });
        }

        // Also delete the associated reminder if it exists
        if (call.reminder_id) {
            await Reminder.destroy({ where: { id: call.reminder_id } });
        }

        await call.destroy();
        res.json({ status: "true", message: "Deleted" });
    } catch (e) {
        console.error("Call remove error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


// List all calls, optionally filtering by branch_id (replacing the old exports.list)
exports.list = async (req, res) => {
    try {
        const branchId = Number(req.query.branch_id);
        const where = branchId ? { branch_id: branchId } : {};

        const items = await Call.findAll({
            where, // Apply branch filter if present
            order: [["id", "DESC"]],
            include: callIncludes,
        });

        if (!items) return res.status(404).json({ status: "false", message: "Not qqqfound" });

        const mapped = (items || []).map(mapCallPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


// Get a single call by id (The original exports.getById remains the same)
exports.getById = async (req, res) => {
    try {
        const item = await Call.findByPk(req.params.id, { include: callIncludes });

        if (!item) return res.status(404).json({ status: "false", message: "Nowwwwt found" });

        const mapped = mapCallPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// --- NEW FILTERED LIST APIS (Based on image and branch_id requirement) ---

// Helper to filter by type and branch
const filterCallsByBranchAndType = async (res, branchId, callType) => {
    try {
        const where = { call_type: callType };
        if (branchId) {
            where.branch_id = branchId;
        }

        const items = await Call.findAll({
            where,
            order: [["id", "DESC"]],
            include: callIncludes,
        });

        const mapped = (items || []).map(mapCallPayload);
        return res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error(`Call list by type (${callType}) error:`, e);
        return res.status(400).json({ status: "false", message: e.message });
    }
};

// List Of All Call Type By Branch (General branch list, same as exports.list with enforced param)
exports.listByBranch = async (req, res) => {
    const branchId = Number(req.params.id);
    if (!branchId) {
        return res.status(400).json({ status: "false", message: "Branch ID is required." });
    }
    return exports.list({ query: { branch_id: branchId } }, res); // Re-use general list logic
};

// GET List By Call Log
exports.listByCallLog = async (req, res) => {
    const branchId = Number(req.params.id);
    return filterCallsByBranchAndType(res, branchId, 'Log');
};

// GET List By Schedule Call
exports.listByScheduleCall = async (req, res) => {
    const branchId = Number(req.params.id);
    return filterCallsByBranchAndType(res, branchId, 'Schedule');
};

// GET List By Reschedule Call
exports.listByRescheduleCall = async (req, res) => {
    const branchId = Number(req.params.id);
    return filterCallsByBranchAndType(res, branchId, 'Reschedule');
};

// GET List By Cancelled Call
exports.listByCancelledCall = async (req, res) => {
    const branchId = Number(req.params.id);
    return filterCallsByBranchAndType(res, branchId, 'Cancelled');
};

// --------------------------------------------------------------------------------------
// Existing CRUD operations (create, patch, remove) remain below, unchanged.
// --------------------------------------------------------------------------------------

// Create a new call, with optional reminder for scheduled calls
exports.create = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        const {
            subject,
            branch_id,
            call_response_id,
            direction,
            start_time,
            end_time,
            duration,
            summary,
            call_type,
            lead_id,
            task_id,
            contact_number,
            assigned_user,
            reminder,
        } = req.body;

        if (!subject || !branch_id || !start_time || !call_type) {
            return res.status(400).json({
                status: "false",
                message: "subject, branch_id, start_time, and call_type are required",
            });
        }

        // Create the call record first
        const call = await Call.create({
            subject,
            branch_id,
            call_response_id,
            direction,
            start_time,
            end_time,
            duration,
            summary,
            call_type,
            lead_id,
            task_id,
            contact_number,
            assigned_user,
            created_by: userId,
            updated_by: userId,
        });
        console.log("Created call:", call);

        let reminderRecord = null;
        if (call_type === 'Schedule' || call_type === 'Reschedule') {
            if (!reminder || !reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value) {
                return res.status(400).json({ status: "false", message: "Reminder details are required for scheduled calls" });
            }

            // Create a new reminder for the scheduled/rescheduled call
            reminderRecord = await Reminder.create({
                reminder_name: `Call Reminder: ${subject}`,
                reminder_date: reminder.reminder_date,
                reminder_time: reminder.reminder_time,
                reminder_unit: reminder.reminder_unit,
                reminder_value: reminder.reminder_value,
                branch_id: branch_id,
                lead_id: lead_id,
                task_id: task_id,
                assigned_user: assigned_user,
                created_by: userId,
                updated_by: userId,
            });

            // Link the reminder to the call
            await call.update({ reminder_id: reminderRecord.id });
        }

        const result = await Call.findByPk(call.id, { include: callIncludes });
        const mapped = mapCallPayload(result);
        res.status(201).json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call create error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// Update an existing call
exports.patch = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        const up = {};
        [
            "subject",
            "branch_id",
            "call_response_id",
            "direction",
            "start_time",
            "end_time",
            "duration",
            "summary",
            "call_type",
            "lead_id",
            "task_id",
            "contact_number",
            "assigned_user",
        ].forEach((k) => {
            if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
        });

        // Handle reminder logic for updates
        if (req.body.call_type === 'Reschedule' || (req.body.call_type === 'Schedule' && req.body.reminder)) {
            if (!req.body.reminder || !req.body.reminder.reminder_date || !req.body.reminder.reminder_time || !req.body.reminder.reminder_unit || !req.body.reminder.reminder_value) {
                return res.status(400).json({ status: "false", message: "Reminder details are required for scheduled/rescheduled calls" });
            }

            let reminderRecord = await Reminder.findOne({ where: { call_id: call.id } });
            const reminderData = req.body.reminder;

            if (reminderRecord) {
                await reminderRecord.update({
                    reminder_name: `Call Reminder: ${req.body.subject || call.subject}`,
                    reminder_date: reminderData.reminder_date,
                    reminder_time: reminderData.reminder_time,
                    reminder_unit: reminderData.reminder_unit,
                    reminder_value: reminderData.reminder_value,
                    updated_by: userId,
                });
            } else {
                reminderRecord = await Reminder.create({
                    reminder_name: `Call Reminder: ${req.body.subject || call.subject}`,
                    reminder_date: reminderData.reminder_date,
                    reminder_time: reminderData.reminder_time,
                    reminder_unit: reminderData.reminder_unit,
                    reminder_value: reminderData.reminder_value,
                    branch_id: up.branch_id || call.branch_id,
                    lead_id: up.lead_id || call.lead_id,
                    task_id: up.task_id || call.task_id,
                    assigned_user: up.assigned_user || call.assigned_user,
                    created_by: userId,
                    updated_by: userId,
                });
                up.reminder_id = reminderRecord.id;
            }
        }

        // If call is cancelled, delete the reminder
        if (req.body.call_type === 'Cancelled' && call.reminder_id) {
            await Reminder.destroy({ where: { id: call.reminder_id } });
            up.reminder_id = null;
        }

        up.updated_by = userId;
        await call.update(up);

        const updatedCall = await Call.findByPk(call.id, { include: callIncludes });
        const mapped = mapCallPayload(updatedCall);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call patch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.remove = async (req, res) => {
    try {
        const userId = req.user?.id || null; 
        const call = await Call.findByPk(req.params.id);

        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        // --- 1. PROCEED WITH ATOMIC DELETION AND LOGGING ---
        await sequelize.transaction(async (t) => {

          
            await Task.update(
                { call_id: null },
                { where: { call_id: call.id }, transaction: t }
            );

            // Log Call Deletion
            if (call.lead_id) {
                 const message = [`Call **${call.subject}** was permanently deleted. Linked Item were unlinked.`];
                 await LeadActivityLog.create({
                     lead_id: call.lead_id,
                     user_id: userId,
                     branch_id: call.branch_id,
                     field_name: 'Call Deleted',
                     summary: jsonSummary(message),
                 }, { transaction: t });
            }

            // Also delete the associated reminder (using transaction `t`)
            if (call.reminder_id) {
                await Reminder.destroy({ where: { id: call.reminder_id }, transaction: t });
            }

            // Destroy the call record
            await call.destroy({ transaction: t });
        });

        res.json({ status: "true", message: "Deleted and linked Tasks unlinked successfully." });

    } catch (e) {
        console.error("Call remove error:", e);
        // The catch block handles any external dependencies (e.g., Reports, Quotations) 
        // that still have RESTRICT set, using the professional error handling previously implemented.
        if (e.message.includes("Cannot delete this Call because")) {
             return res.status(409).json({ status: "false", message: e.message, error_type: "ForeignKeyConstraintError" });
        }
        res.status(400).json({ status: "false", message: e.message });
    }
};

// List calls by user (Unchanged)
exports.listByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await Call.findAll({
            where: { assigned_user: id },
            order: [["id", "DESC"]],
            include: callIncludes,
        });

        const mapped = (items || []).map(mapCallPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call listByUser error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};