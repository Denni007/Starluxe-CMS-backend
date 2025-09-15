// app/controller/reminder.controller.js
const Reminder = require("../models/reminder.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const Task = require("../models/task.js");

function mapReminderPayload(reminderInstance) {
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


exports.create = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        const {
            reminder_name,
            reminder_date,
            reminder_time,
            reminder_unit,
            reminder_value,
            branch_id,
            lead_id,
            task_id,
            assigned_user,
        } = req.body;

        if (!reminder_name || !reminder_date || !reminder_time || !reminder_unit || !reminder_value || !branch_id) {
            return res.status(400).json({
                status: "false",
                message: "reminder_name, reminder_date, reminder_time, reminder_unit, reminder_value, and branch_id are required",
            });
        }

        const reminder = await Reminder.create({
            reminder_name,
            reminder_date,
            reminder_time,
            reminder_unit,
            reminder_value,
            branch_id,
            lead_id,
            task_id,
            assigned_user,
            created_by: userId,
            updated_by: userId,
        });

        res.status(201).json({ status: "true", data: reminder });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.patch = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const reminder = await Reminder.findByPk(req.params.id);
        if (!reminder) return res.status(404).json({ status: "false", message: "Reminder not found" });

        const up = {};
        [
            "reminder_name",
            "reminder_date",
            "reminder_time",
            "reminder_unit",
            "reminder_value",
            "branch_id",
            "lead_id",
            "task_id",
            "assigned_user",
        ].forEach((k) => {
            if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
        });

        up.updated_by = userId;

        await reminder.update(up);
        res.json({ status: "true", data: reminder });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.remove = async (req, res) => {
    try {
        const reminder = await Reminder.findByPk(req.params.id);
        if (!reminder) return res.status(404).json({ status: "false", message: "Reminder not found" });

        await reminder.destroy();
        res.json({ status: "true", message: "Deleted" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};