const Call = require("../models/call.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const Task = require("../models/task.js");
const Reminder = require("../models/reminder.js");
const Branch = require("../models/branch.js");
const CallResponseStage = require("../models/CallResponseStage.js");
const sequelize = require("../config");
const { Op } = require("sequelize"); // Import Op for complex queries

// This function maps the Sequelize model instance to a clean JSON payload,
// restructuring associated data into nested objects.
function mapCallPayload(callInstance) {
    const obj = callInstance.toJSON();

    if (obj.assignee) {
        obj.assigned_user = {
            id: obj.assignee.id,
            user_name: obj.assignee.user_name,
            email: obj.assignee.email,
        };
    }
    delete obj.assignee;

    if (obj.lead) {
        obj.lead_id = {
            id: obj.lead.id,
            lead_name: obj.lead.lead_name,
        };
    }
    delete obj.lead;

    if (obj.task) {
        obj.task_id = {
            id: obj.task.id,
            task_name: obj.task.task_name,
        };
    }
    delete obj.task;

    if (obj.callResponseStage) {
        obj.call_response_id = {
            id: obj.callResponseStage.id,
            name: obj.callResponseStage.name,
            description: obj.callResponseStage.description,
        };
    }
    delete obj.callResponseStage;

    if (obj.reminder) {
        obj.reminder_id = {
            id: obj.reminder.id,
            reminder_name: obj.reminder.reminder_name,
            reminder_date: obj.reminder.reminder_date,
            reminder_time: obj.reminder.reminder_time,
            reminder_unit: obj.reminder.reminder_unit,
            reminder_value: obj.reminder.reminder_value,
        };
    }
    delete obj.reminder;

    return obj;
}


// Shared include array for all find queries to ensure consistency
const callIncludes = [
    { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
    { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
    { model: Task, as: "task", attributes: ["id", "task_name"] },
    { model: Reminder, as: "reminder", attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"] },
    { model: CallResponseStage, as: "callResponseStage", attributes: ["id", "name", "description"] }
];

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

        const result = await Call.findByPk(call.id, { include: callIncludes });
        const mapped = mapCallPayload(result);
        res.status(201).json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call createLogCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// POST Create Schedule Call (Type: 'Schedule' + Reminder)
exports.createScheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user, reminder } = req.body;

        if (!subject || !branch_id || !start_time || !reminder || !reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value) {
            return res.status(400).json({ status: "false", message: "subject, branch_id, start_time, and full reminder details are required for scheduled calls" });
        }

        // Use a transaction for atomic operation (Call + Reminder)
        const result = await sequelize.transaction(async (t) => {

            // 1. Create Call (with call_type: 'Schedule')
            const call = await Call.create({
                subject, branch_id, call_response_id, direction, start_time, end_time, duration, summary, lead_id, task_id, contact_number, assigned_user,
                call_type: 'Schedule',
                created_by: userId, updated_by: userId,
            }, { transaction: t });

            // 2. Create Reminder
            const reminderRecord = await Reminder.create({
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
                // Link reminder to call (assuming Reminder model has call_id FK)
                call_id: call.id, 
            }, { transaction: t });

            // 3. Link the reminder ID back to the Call
            await call.update({ reminder_id: reminderRecord.id }, { transaction: t });

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.status(200).json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call createScheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// --- DEDICATED UPDATE APIS ---

// PATCH Update Log Call By ID (Allows update of a past/logged call)
exports.patchLogCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        // Enforce: only allows updates to Logged calls
        if (call.call_type !== 'Log') {
             return res.status(400).json({ status: "false", message: "This endpoint is only for Logged calls." });
        }

        const up = {};
        [
            "subject", "call_response_id", "direction", "start_time", "end_time", "duration",
            "summary", "lead_id", "task_id", "contact_number", "assigned_user", "branch_id"
        ].forEach((k) => {
            if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
        });

        up.updated_by = userId;
        await call.update(up);

        const updatedCall = await Call.findByPk(call.id, { include: callIncludes });
        res.json({ status: "true", data: mapCallPayload(updatedCall) });
    } catch (e) {
        console.error("Call patchLogCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// PATCH Update Schedule Call By ID (Allows modification of a standard schedule)
exports.patchScheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        // 🔑 NOTE: Fetch the call with the reminder include for safe access
        const call = await Call.findByPk(req.params.id, { include: [{ model: Reminder, as: 'reminder' }] }); 
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        // Enforce: only allows updates to Scheduled calls
        if (call.call_type !== 'Schedule') {
             return res.status(400).json({ status: "false", message: "This endpoint is only for Scheduled calls." });
        }

        const up = {};
        const reminderData = req.body.reminder; 

        [
            "subject", "direction", "start_time", "end_time", "duration",
            "summary", "lead_id", "task_id", "contact_number", "assigned_user", "branch_id"
        ].forEach((k) => {
            if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
        });

        up.updated_by = userId;
        await call.update(up);

        // 🔑 FIX: Update associated reminder only if reminderData is provided
        if (call.reminder_id && reminderData) {
            const reminderUpdates = {
                updated_by: userId,
            };
            if (reminderData.reminder_date !== undefined) reminderUpdates.reminder_date = reminderData.reminder_date;
            if (reminderData.reminder_time !== undefined) reminderUpdates.reminder_time = reminderData.reminder_time;
            if (reminderData.reminder_unit !== undefined) reminderUpdates.reminder_unit = reminderData.reminder_unit;
            if (reminderData.reminder_value !== undefined) reminderUpdates.reminder_value = reminderData.reminder_value;
            // Update reminder name if subject changed
            if (up.subject || call.subject) {
                 reminderUpdates.reminder_name = `Call Reminder: ${up.subject || call.subject}`;
            }

            await Reminder.update(reminderUpdates, { where: { id: call.reminder_id } });
        }

        // Fetch again with full includes for final response mapping
        const updatedCall = await Call.findByPk(call.id, { include: callIncludes });
        res.json({ status: "true", data: mapCallPayload(updatedCall) });
    } catch (e) {
        console.error("Call patchScheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// PATCH Update Reschedule Call By ID (Changes type to 'Reschedule' and updates time/reminder)
exports.patchRescheduleCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        const { start_time, reminder } = req.body;

        // Validation for rescheduling
        if (!start_time) {
            return res.status(400).json({ status: "false", message: "New start_time is required for rescheduling." });
        }
        if (!reminder || !reminder.reminder_date || !reminder.reminder_time) {
            return res.status(400).json({ status: "false", message: "Reminder details (date, time) are required for rescheduling." });
        }
        if (!call.reminder_id) {
             return res.status(400).json({ status: "false", message: "Cannot reschedule a call that has no linked reminder." });
        }

        // Use a transaction for atomic update
        const result = await sequelize.transaction(async (t) => {

            // 1. Update Call record: change type and time
            await call.update({
                call_type: 'Reschedule', // 🔑 Set type to Reschedule
                start_time: start_time,
                updated_by: userId,
            }, { transaction: t });

            // 2. Update Reminder record
            await Reminder.update({
                reminder_date: reminder.reminder_date,
                reminder_time: reminder.reminder_time,
                updated_by: userId,
                // Optionally update reminder name if subject changed in a separate field in body
            }, { where: { id: call.reminder_id }, transaction: t });

            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });

        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchRescheduleCall error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// PATCH Update Cancel Call By ID (Changes type to 'Cancelled' and deletes reminder)
exports.patchCancelCall = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

        // Enforce: only scheduled or rescheduled calls can be cancelled
        if (call.call_type === 'Log' || call.call_type === 'Cancelled') {
             return res.status(400).json({ status: "false", message: "Cannot cancel a logged or already cancelled call." });
        }
        
        // Use a transaction for atomic update
        const result = await sequelize.transaction(async (t) => {
            
            // 1. Update Call record: change type
            await call.update({
                call_type: 'Cancelled', // 🔑 Set type to Cancelled
                end_time: new Date(),
                reminder_id: null, // Unlink reminder from call
                updated_by: userId,
            }, { transaction: t });

            // 2. Delete Reminder record
            if (call.reminder_id) {
                await Reminder.destroy({ where: { id: call.reminder_id } });
            }
            
            return Call.findByPk(call.id, { include: callIncludes, transaction: t });
        });


        res.json({ status: "true", data: mapCallPayload(result) });
    } catch (e) {
        console.error("Call patchCancelCall error:", e);
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

// Delete a call
exports.remove = async (req, res) => {
    try {
        const call = await Call.findByPk(req.params.id);
        if (!call) return res.status(404).json({ status: "false", message: "Call not found" });

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