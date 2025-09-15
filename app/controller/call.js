// app/controller/call.controller.js
const Call = require("../models/call.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const Task = require("../models/task.js");
const Reminder = require("../models/reminder.js");
const Branch = require("../models/branch.js");
const CallResponseStage = require("../models/CallResponseStage.js");


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


// List all calls
exports.list = async (req, res) => {
    try {
        const items = await Call.findAll({
            order: [["id", "DESC"]],
            include: callIncludes,
        });

        if (!items) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = (items || []).map(mapCallPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


// Get a single call by id
exports.getById = async (req, res) => {
    try {
        const item = await Call.findByPk(req.params.id, { include: callIncludes });

        if (!item) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = mapCallPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

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

// List calls by branch
exports.listByBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await Call.findAll({
            where: { branch_id: id },
            order: [["id", "DESC"]],
            include: callIncludes,
        });

        const mapped = (items || []).map(mapCallPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Call listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

// List calls by user
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