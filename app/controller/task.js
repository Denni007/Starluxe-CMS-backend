const Task = require("../models/task.js");
const User = require("../models/user.js");
const TaskStage = require("../models/TaskStage.js");
const Lead = require("../models/lead.js");
const Reminder = require("../models/reminder.js");
const Call = require("../models/call.js");
const LeadActivityLog = require("../models/LeadActivityLog.js");

const jsonSummary = (messages) => JSON.stringify(Array.isArray(messages) ? messages : [messages]);

const getLogValue = (val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
};

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

    if (obj.call) { 
        obj.call_id = {
            id: obj.call.id,
            subject: obj.call.subject,
            call_type: obj.call.call_type,
        };
    }
    delete obj.call;

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
                },
                {
                    model: Call,
                    as: "call",
                    attributes: ["id", "subject", "call_type"],
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
                },
                {
                    model: Call,
                    as: "call",
                    attributes: ["id", "subject", "call_type"],
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
                },
                { model: Call, as: "call", attributes: ["id", "subject", "call_type"] }
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
                },
                { model: Call, as: "call", attributes: ["id", "subject", "call_type"] }
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
                },
                { model: Call, as: "call", attributes: ["id", "subject", "call_type"] }
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
            task_name, task_stage_id, branch_id, priority, start_date, due_date,
            follow_up_date, assigned_user, lead_id, reminder, call_id
        } = req.body;

        if (!task_name || !branch_id || !priority) {
            return res.status(400).json({ status: "false", message: "task_name, branch_id, and priority are required" });
        }

        if (reminder && (!reminder.reminder_date || !reminder.reminder_time || !reminder.reminder_unit || !reminder.reminder_value)) {
            return res.status(400).json({ status: "false", message: "reminder must contain date, time, unit, and value" });
        }

        const task = await Task.create({
            task_name, task_stage_id: typeof task_stage_id === "number" ? task_stage_id : undefined, branch_id, priority, start_date, due_date,
            follow_up_date, assigned_user, lead_id, call_id,
            created_by: userId, updated_by: userId,
        });

        let reminderRecord = null;

        if (reminder) {
            reminderRecord = await Reminder.create({
                reminder_name: `Reminder for Task: ${task_name}`,
                reminder_date: reminder.reminder_date,
                reminder_time: reminder.reminder_time,
                reminder_unit: reminder.reminder_unit,
                reminder_value: reminder.reminder_value,
                branch_id: branch_id, lead_id: lead_id, task_id: task.id, assigned_user: assigned_user,
                created_by: userId, updated_by: userId,
            });

            await task.update({ reminder_id: reminderRecord.id });
        }

        if (lead_id) {
            const reminderMsg = reminderRecord ? ` with reminder set for ${reminderRecord.reminder_date}.` : '.';
            const message = [`Task **${task.task_name}** created${reminderMsg}`];
            await LeadActivityLog.create({
                lead_id: lead_id,
                user_id: userId,
                branch_id: branch_id,
                field_name: 'Task Created',
                summary: jsonSummary(message),
            });
        }

        const result = await Task.findByPk(task.id, {
            include: [{ model: Reminder, as: "reminders", attributes: ["id"] }]
        });

        const finalPayload = mapTaskPayload(result);

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
        const changeDescriptions = [];
        const oldStageId = task.task_stage_id;
        const oldReminderId = task.reminder_id;

        const fieldsToTrack = [
            "task_name", "task_stage_id", "branch_id", "priority", "start_date",
            "due_date", "follow_up_date", "assigned_user", "lead_id", "call_id"
        ];

        fieldsToTrack.forEach((k) => {
            if (typeof req.body[k] !== "undefined") {
                up[k] = req.body[k];

                const oldValue = task.get(k);
                const newValue = req.body[k];

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
                    changeDescriptions.push({ key: k, text: description, isStage: (k === 'task_stage_id') });
                }
            }
        });

        if (typeof req.body.reminder !== "undefined") {
            const reminderInput = req.body.reminder;

            if (reminderInput !== null && (typeof reminderInput !== 'object' || Array.isArray(reminderInput))) {
                return res.status(400).json({ status: "false", message: "reminder must be a valid object or null" });
            }

            const reminderFieldsToTrack = ["reminder_name", "reminder_date", "reminder_time", "reminder_unit", "reminder_value"];
            const reminderUpdates = { updated_by: userId };
            const subChangeDescriptions = [];

            let reminderRecord = null;
            if (task.reminder_id) {
                reminderRecord = await Reminder.findByPk(task.reminder_id);
            }

            if (reminderInput !== null) {
                let isReminderChanged = false;

                reminderFieldsToTrack.forEach(k => {
                    if (reminderInput[k] !== undefined) {
                        const oldValue = reminderRecord ? reminderRecord.get(k) : null;
                        const newValue = reminderInput[k];

                        const oldLogValue = getLogValue(oldValue);
                        const newLogValue = getLogValue(newValue);

                        if (oldLogValue !== newLogValue) {
                            subChangeDescriptions.push({
                                key: `reminder_${k}`,
                                text: `Updated **reminder ${k.replace('_', ' ')}** from *${oldLogValue || 'NULL'}* to *${newLogValue}*`
                            });
                            reminderUpdates[k] = newValue;
                            isReminderChanged = true;
                        }
                    }
                });

                if (reminderRecord && isReminderChanged) {
                    await reminderRecord.update(reminderUpdates);
                    changeDescriptions.push(...subChangeDescriptions);
                } else if (!reminderRecord && Object.keys(reminderUpdates).length > 1) {
                    changeDescriptions.push({ key: 'reminder', text: `Created new **task reminder**.` });

                    reminderFieldsToTrack.forEach(k => {
                        if (reminderInput[k] !== undefined) {
                            changeDescriptions.push({
                                key: `reminder_${k}`,
                                text: `Set **reminder ${k.replace('_', ' ')}** to *${getLogValue(reminderInput[k])}*`
                            });
                        }
                    });

                    reminderUpdates.branch_id = task.branch_id;
                    reminderUpdates.lead_id = task.lead_id;
                    reminderUpdates.task_id = task.id;
                    reminderUpdates.assigned_user = task.assigned_user;
                    reminderUpdates.created_by = userId;

                    reminderRecord = await Reminder.create(reminderUpdates);
                    up.reminder_id = reminderRecord.id;
                }

            } else if (task.reminder_id) {
                await Reminder.destroy({ where: { task_id: task.id } });
                up.reminder_id = null;
                changeDescriptions.push({ key: 'reminder', text: 'Removed **task reminder**.' });
            }
        }

        up.updated_by = userId;

        if (Object.keys(up).length > 1 || (Object.keys(up).length === 1 && up.updated_by !== userId && changeDescriptions.length > 0)) {
            await task.update(up);
        } else if (changeDescriptions.length === 0) {
            return res.json({ status: "true", data: task });
        }

        if (task.lead_id && changeDescriptions.length > 0) {
            let logFieldName;

            const stageChangeDetected = up.task_stage_id && up.task_stage_id !== oldStageId;

            if (stageChangeDetected && changeDescriptions.length === 1) {
                logFieldName = 'Task Stage Updated';
            } else if (changeDescriptions.length === 1) {
                const singleKey = changeDescriptions[0].key;
                const fieldName = singleKey.replace(/_/g, ' ');
                logFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' Updated';
            } else {
                logFieldName = 'Task Details Updated';
            }

            const summaryTexts = changeDescriptions.map(d => d.text);
            const summaryData = jsonSummary(summaryTexts);

            await LeadActivityLog.create({
                lead_id: task.lead_id,
                user_id: userId,
                branch_id: task.branch_id,
                field_name: logFieldName,
                summary: summaryData,
            });
        }

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
        const userId = req.user?.id || null;
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ status: "false", message: "Task not found" });

        if (task.lead_id) {
            const message = [`Task **${task.task_name}** was permanently deleted.`];
            await LeadActivityLog.create({
                lead_id: task.lead_id,
                user_id: userId,
                branch_id: task.branch_id,
                field_name: 'Task Deleted',
                summary: jsonSummary(message),
            });
        }

        await Reminder.destroy({ where: { task_id: task.id } });

        await task.destroy();
        res.json({ status: "true", message: "Deleted" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};
