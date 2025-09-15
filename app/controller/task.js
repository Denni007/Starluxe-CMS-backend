// app/controller/task.controller.js
const Task = require("../models/task.js");
const User = require("../models/user.js");
const TaskStage = require("../models/TaskStage.js");
const Lead = require("../models/lead.js");
const Reminder = require("../models/reminder.js");

function mapTaskPayload(taskInstance) {
    const obj = taskInstance.toJSON();

    if (obj.assignee) {
        obj.assigned_user = {
            id: obj.assignee.id,
            user_name: obj.assignee.user_name,
            email: obj.assignee.email,
        };
    }
    delete obj.assignee;

    if (obj.stage) {
        obj.task_stage_id = {
            id: obj.stage.id,
            name: obj.stage.name,
        };
    }
    delete obj.stage;

    if (obj.lead) {
        obj.lead_id = {
            id: obj.lead.id,
            lead_name: obj.lead.lead_name,
        };
    }
    delete obj.lead;

    if (obj.reminders && obj.reminders.length > 0) {
        const reminderDetails = obj.reminders[0];
        obj.reminder_id = {
            id: reminderDetails.id,
            reminder_name: reminderDetails.reminder_name,
            reminder_date: reminderDetails.reminder_date,
            reminder_time: reminderDetails.reminder_time,
            reminder_unit: reminderDetails.reminder_unit,
            reminder_value: reminderDetails.reminder_value,
        };
    } else {
        obj.reminder_id = null;
    }
    delete obj.reminders;

    return obj;
}


exports.list = async (req, res) => {
    try {
        const items = await Task.findAll({
            order: [["id", "DESC"]],
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["id", "user_name", "email"],
                },
                {
                    model: TaskStage,
                    as: "stage",
                    attributes: ["id", "name"],
                },
                {
                    model: Lead,
                    as: "lead",
                    attributes: ["id", "lead_name"],
                },
                {
                    model: Reminder,
                    as: "reminders",
                    attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"],
                }
            ],
        });

        if (!items) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = (items || []).map(mapTaskPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Task list error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.getById = async (req, res) => {
    try {
        const item = await Task.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["id", "user_name", "email"],
                },
                {
                    model: TaskStage,
                    as: "stage",
                    attributes: ["id", "name"],
                },
                {
                    model: Lead,
                    as: "lead",
                    attributes: ["id", "lead_name"],
                },
                {
                    model: Reminder,
                    as: "reminders",
                    attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"],
                }
            ],
        });

        if (!item) return res.status(404).json({ status: "false", message: "Not found" });

        const mapped = mapTaskPayload(item);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Task getById error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.listByBranch = async (req, res) => {
    try {
        const { id } = req.params;

        const items = await Task.findAll({
            where: { branch_id: id },
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
                { model: TaskStage, as: "stage", attributes: ["id", "name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                {
                    model: Reminder,
                    as: "reminders",
                    attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"],
                }
            ],
        });

        const mapped = (items || []).map(mapTaskPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Task listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.listByUser = async (req, res) => {
    try {
        const { id } = req.params;

        const items = await Task.findAll({
            where: { assigned_user: id },
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
                { model: TaskStage, as: "stage", attributes: ["id", "name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                {
                    model: Reminder,
                    as: "reminders",
                    attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"],
                }
            ],
        });

        const mapped = (items || []).map(mapTaskPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Task listByUser error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.listByLead = async (req, res) => {
    try {
        const { id } = req.params;

        const items = await Task.findAll({
            where: { lead_id: id },
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
                { model: TaskStage, as: "stage", attributes: ["id", "name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                {
                    model: Reminder,
                    as: "reminders",
                    attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"],
                }
            ],
        });

        const mapped = (items || []).map(mapTaskPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Task listByLead error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.create = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        const {
            task_name,
            task_stage_id,
            branch_id,
            priority,
            start_date,
            due_date,
            follow_up_date,
            assigned_user,
            lead_id,
            reminder,
        } = req.body;

        if (!task_name || !branch_id || !priority) {
            return res.status(400).json({
                status: "false",
                message: "task_name, branch_id, and priority are required",
            });
        }

        if (reminder) {
            if (typeof reminder !== 'object' || Array.isArray(reminder)) {
                return res.status(400).json({ status: "false", message: "reminder must be a valid object" });
            }
            if (!reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value) {
                return res.status(400).json({ status: "false", message: "reminder must contain reminder_date, reminder_time, reminder_unit, and reminder_value" });
            }
        }

        // Create the task first
        const task = await Task.create({
            task_name,
            task_stage_id: typeof task_stage_id === "number" ? task_stage_id : undefined,
            branch_id,
            priority,
            start_date,
            due_date,
            follow_up_date,
            assigned_user,
            lead_id,
            created_by: userId,
            updated_by: userId,
        });

        // If a reminder object is provided, create a reminder record
        if (reminder) {
            const reminderRecord = await Reminder.create({
                reminder_name: `Reminder for Task: ${task_name}`,
                reminder_date: reminder.reminder_date,
                reminder_time: reminder.reminder_time,
                reminder_unit: reminder.reminder_unit,
                reminder_value: reminder.reminder_value,
                branch_id: branch_id,
                lead_id: lead_id,
                task_id: task.id,
                assigned_user: assigned_user,
                created_by: userId,
                updated_by: userId,
            });
            
            // Update the task with the reminder_id
            await task.update({ reminder_id: reminderRecord.id });
        }

        // Re-fetch the task to get the updated data, including the new reminder_id
        const result = await Task.findByPk(task.id);
        
        // Map the result to the desired payload format
        const finalPayload = {
            id: result.id,
            task_name: result.task_name,
            task_stage_id: result.task_stage_id,
            branch_id: result.branch_id,
            priority: result.priority,
            start_date: result.start_date,
            due_date: result.due_date,
            follow_up_date: result.follow_up_date,
            assigned_user: result.assigned_user,
            lead_id: result.lead_id,
            reminder_id: result.reminder_id,
        };

        res.status(201).json({ status: "true", data: finalPayload });

    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.patch = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ status: "false", message: "Task not found" });

        const up = {};
        [
            "task_name",
            "task_stage_id",
            "branch_id",
            "priority",
            "start_date",
            "due_date",
            "follow_up_date",
            "assigned_user",
            "lead_id",
        ].forEach((k) => {
            if (typeof req.body[k] !== "undefined") up[k] = req.body[k];
        });

        // Add reminder logic to patch
        if (typeof req.body.reminder !== "undefined") {
            if (req.body.reminder !== null && (typeof req.body.reminder !== 'object' || Array.isArray(req.body.reminder))) {
                return res.status(400).json({ status: "false", message: "reminder must be a valid object or null" });
            }

            if (req.body.reminder !== null) {
                const reminderData = req.body.reminder;

                // Find an existing reminder for this task
                let reminderRecord = await Reminder.findOne({ where: { task_id: task.id } });

                if (reminderRecord) {
                    // If a reminder exists, update it
                    await reminderRecord.update({
                        reminder_name: reminderData.reminder_name ? reminderData.reminder_name : `Reminder for Task: ${req.body.task_name || task.task_name}`,
                        reminder_date: reminderData.reminder_date,
                        reminder_time: reminderData.reminder_time,
                        reminder_unit: reminderData.reminder_unit,
                        reminder_value: reminderData.reminder_value,
                        updated_by: userId,
                    });
                } else {
                    // If no reminder exists, create a new one
                    await Reminder.create({
                        reminder_name: `Reminder for Task: ${req.body.task_name || task.task_name}`,
                        reminder_date: reminderData.reminder_date,
                        reminder_time: reminderData.reminder_time,
                        reminder_unit: reminderData.reminder_unit,
                        reminder_value: reminderData.reminder_value,
                        branch_id: task.branch_id,
                        lead_id: task.lead_id,
                        task_id: task.id,
                        assigned_user: task.assigned_user,
                        created_by: userId,
                        updated_by: userId,
                    });
                }
            } else {
                // If reminder is explicitly set to null, destroy the existing one.
                await Reminder.destroy({ where: { task_id: task.id } });
            }
        }

        up.updated_by = userId;

        await task.update(up);

        // Re-fetch the task to include the updated reminder data
        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: "assignee", attributes: ["id", "user_name", "email"] },
                { model: TaskStage, as: "stage", attributes: ["id", "name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
                { model: Reminder, as: "reminders", attributes: ["id", "reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"] },
            ]
        });

        const mapped = mapTaskPayload(updatedTask);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};


exports.remove = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ status: "false", message: "Task not found" });

        await task.destroy();
        res.json({ status: "true", message: "Deleted" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};
