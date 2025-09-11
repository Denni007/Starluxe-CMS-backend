// app/controller/task.controller.js
const Task = require("../models/task.js");
const User = require("../models/user.js");
const TaskStage = require("../models/TaskStage.js");
const Lead = require("../models/lead.js");

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
        } = req.body;

        if (!task_name || !branch_id || !priority) {
            return res.status(400).json({
                status: "false",
                message: "task_name, branch_id, and priority are required",
            });
        }

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

        res.status(201).json({ status: "true", data: task });
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

        up.updated_by = userId;

        await task.update(up);
        res.json({ status: "true", data: task });
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