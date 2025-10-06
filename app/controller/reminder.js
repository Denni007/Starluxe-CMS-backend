// app/controller/reminder.controller.js
const Reminder = require("../models/reminder.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const Task = require("../models/task.js");
const LeadActivityLog = require("../models/LeadActivityLog.js");

const getLogValue = (val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
};

const jsonSummary = (messages) => JSON.stringify(Array.isArray(messages) ? messages : [messages]);

function mapReminderPayload(reminderInstance) { /* ... (remains unchanged) ... */
    const obj = reminderInstance.toJSON();

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

    if (obj.assignee) {
        obj.assigned_user = {
            id: obj.assignee.id,
            user_name: obj.assignee.user_name,
            email: obj.assignee.email,
        };
    }
    delete obj.assignee;

    return obj;
}


exports.list = async (req, res) => {
    try {
        const items = await Reminder.findAll({
            order: [["id", "DESC"]],
            include: [

                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                { model: Task, as: "task", attributes: ["id", "task_name"] },
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
            ],
        });

        if (!items) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = (items || []).map(mapReminderPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Reminder list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.getById = async (req, res) => {
    try {
        const item = await Reminder.findByPk(req.params.id, {
            include: [

                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                { model: Task, as: "task", attributes: ["id", "task_name"] },
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
            ],
        });

        if (!item) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = mapReminderPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Reminder getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.listByBranch = async (req, res) => {
    try {
        const branchId = Number(req.params.id);

        if (isNaN(branchId)) {
            return res.status(400).json({ status: "false", message: "Invalid Branch ID provided." });
        }

        const items = await Reminder.findAll({
            where: { branch_id: branchId },
            order: [["id", "DESC"]],
            include: [
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                { model: Task, as: "task", attributes: ["id", "task_name"] },
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
            ],
        });

        if (!items) return res.status(404).json({ status: "false", message: "No reminders found for this branch." });

        const mapped = (items || []).map(mapReminderPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Reminder listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.create = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        const {
            reminder_name, reminder_date, reminder_time, reminder_unit, reminder_value,
            branch_id, lead_id, task_id, assigned_user,
        } = req.body;

        if (!reminder_name || !reminder_date || !reminder_time || !reminder_unit || !reminder_value || !branch_id) {
            return res.status(400).json({
                status: "false",
                message: "reminder_name, reminder_date, reminder_time, reminder_unit, reminder_value, and branch_id are required",
            });
        }

        const reminder = await Reminder.create({
            reminder_name, reminder_date, reminder_time, reminder_unit, reminder_value,
            branch_id, lead_id, task_id, assigned_user,
            created_by: userId, updated_by: userId,
        });

        // 🔑 LOGGING 6: Log Reminder Creation if associated with a Lead
        if (lead_id) {
            const message = [`Reminder **${reminder.reminder_name}** set for *${reminder_date} ${reminder_time}*.`];
            await LeadActivityLog.create({
                lead_id: lead_id,
                user_id: userId,
                branch_id: branch_id,
                field_name: 'Reminder Created',
                summary: jsonSummary(message),
            });
        }

        res.status(201).json({ status: "true", data: reminder });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.patch = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        // Fetch the existing reminder record
        const reminder = await Reminder.findByPk(req.params.id);
        if (!reminder) return res.status(404).json({ status: "false", message: "Reminder not found" });

        const up = {};
        const changeDescriptions = []; // Array to store { key, text } of all changes

        // 🔑 All fields that can be updated in the Reminder model
        const fieldsToCheck = [
            "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value",
            "branch_id", "lead_id", "task_id", "assigned_user",
        ];

        // --- 1. Build the 'up' object and generate summary descriptions ---
        fieldsToCheck.forEach(k => {
            if (typeof req.body[k] !== "undefined") {

                // Set the value for update
                up[k] = req.body[k];

                // Check for value change
                const oldValue = reminder.get(k);
                const newValue = req.body[k];

                // Note: getLogValue and jsonSummary are assumed to be defined in this file's scope
                const oldLogValue = getLogValue(oldValue);
                const newLogValue = getLogValue(newValue);

                if (oldLogValue !== newLogValue) {
                    let description = '';
                    const fieldName = k.replace(/_/g, ' ');

                    if (oldLogValue === null || oldLogValue === 'null') {
                        description = `Added **${fieldName}** as *${newLogValue}*`;
                    } else if (newLogValue === null || newLogValue === 'null') {
                        description = `Removed **${fieldName}** (was *${oldLogValue}*)`;
                    } else {
                        description = `Updated **${fieldName}** from *${oldLogValue}* to *${newLogValue}*`;
                    }

                    // Store key and text for dynamic naming later
                    changeDescriptions.push({ key: k, text: description });
                }
            }
        });

        up.updated_by = userId;

        // --- 2. Perform the update ---
        // Only update if there are actual changes detected, otherwise skip DB call
        if (Object.keys(up).length > 1 || (Object.keys(up).length === 1 && up.updated_by !== userId)) {
            await reminder.update(up);
        }

        // --- 3. Log consolidated activity ---
        if (changeDescriptions.length > 0) {

            let logFieldName;

            if (changeDescriptions.length === 1) {
                // Case 1: Dynamic naming based on the single field changed
                const singleKey = changeDescriptions[0].key;
                const fieldName = singleKey.replace(/_/g, ' ');
                // Format: Reminder Name Updated
                logFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' Updated';
            } else {
                // Case 2: Multiple fields were updated
                logFieldName = 'Reminder Details Updated';
            }

            // Extract only the text messages for the summary JSON array
            const summaryTexts = changeDescriptions.map(d => d.text);
            const summaryData = jsonSummary(summaryTexts);

            // 🔑 LOGGING: Create the single, structured log entry
            if (reminder.lead_id) {
                await LeadActivityLog.create({
                    lead_id: reminder.lead_id,
                    user_id: userId,
                    branch_id: reminder.branch_id,
                    field_name: logFieldName,
                    summary: summaryData,
                });
            }
        }

        res.json({ status: "true", data: reminder });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.remove = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const reminder = await Reminder.findByPk(req.params.id);
        if (!reminder) return res.status(404).json({ status: "false", message: "Reminder not found" });

        // 🔑 LOGGING 8: Log Reminder Deletion if lead_id exists
        if (reminder.lead_id) {
            const message = [`Reminder **${reminder.reminder_name}** was deleted.`];
            await LeadActivityLog.create({
                lead_id: reminder.lead_id,
                user_id: userId,
                branch_id: reminder.branch_id,
                field_name: 'Reminder Deleted',
                summary: jsonSummary(message),
            });
        }

        await reminder.destroy();
        res.json({ status: "true", message: "Deleted" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};