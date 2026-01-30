const Todo = require("../models/todo.js");
const User = require("../models/user.js");
const Branch = require("../models/branch.js");
const Comment = require("../models/comment.js");

const mapTodoPayload = (todo) => {
  const obj = todo.toJSON();

  if (obj.assignee) {
    obj.assignee = {
      id: obj.assignee.id,
      user_name: obj.assignee.user_name,
      email: obj.assignee.email,
    };
  }

  if (obj.creator) {
    obj.creator = {
      id: obj.creator.id,
      user_name: obj.creator.user_name,
      email: obj.creator.email,
    };
  }

  if (obj.updater) {
    obj.updater = {
      id: obj.updater.id,
      user_name: obj.updater.user_name,
      email: obj.updater.email,
    };
  }

  if (obj.approver) {
    obj.approver = {
      id: obj.approver.id,
      user_name: obj.approver.user_name,
      email: obj.approver.email,
    };
  }

  if (obj.branch) {
    obj.branch = {
      id: obj.branch.id,
      name: obj.branch.name,
    };
  }

  return obj;
};

exports.list = async (req, res) => {
  try {
    const items = await Todo.findAll({
      where: { isDelete: false },
      order: [["id", "DESC"]],
      include: [
        { model: User, as: "assignee" },
        { model: User, as: "creator" },
        { model: User, as: "updater" },
        { model: User, as: "approver" },
        { model: Branch, as: "branch" },
        { model: Comment, as: "comments" },
      ],
    });
    const mapped = (items || []).map(mapTodoPayload);
    res.json({ status: "true", data: mapped });
  } catch (e) {
    console.error("Todo list error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Todo.findByPk(req.params.id, {
      include: [
        { model: User, as: "assignee" },
        { model: User, as: "creator" },
        { model: User, as: "updater" },
        { model: User, as: "approver" },
        { model: Branch, as: "branch" },
        { model: Comment, as: "comments", include: [{ model: User, as: "author" }] },
      ],
    });
    if (!item) return res.status(404).json({ status: "false", message: "Not found" });
    const mapped = mapTodoPayload(item);
    res.json({ status: "true", data: mapped });
  } catch (e) {
    console.error("Todo getById error:", e);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.listByBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await Todo.findAll({
            where: { branchId: id, isDelete: false },
            order: [["id", "DESC"]],
            include: [
                { model: User, as: "assignee" },
                { model: User, as: "creator" },
                { model: User, as: "updater" },
                { model: User, as: "approver" },
                { model: Branch, as: "branch" },
                { model: Comment, as: "comments" },
            ],
        });
        const mapped = (items || []).map(mapTodoPayload);
        res.json({ status: "true", data: mapped });
    } catch (e) {
        console.error("Todo listByBranch error:", e);
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { title, description, status, dueDate, reminder, assigneeId, branchId } = req.body;

    if (!title || !branchId) {
      return res.status(400).json({ status: "false", message: "title and branchId are required" });
    }

    const todo = await Todo.create({
      title,
      description,
      status,
      dueDate,
      reminder,
      assigneeId,
      branchId,
      created_by: userId,
      updated_by: userId,
    });

    const result = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: "assignee" },
        { model: User, as: "creator" },
        { model: Branch, as: "branch" },
      ],
    });

    const finalPayload = mapTodoPayload(result);
    res.status(201).json({ status: "true", data: finalPayload });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.patch = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ status: "false", message: "Todo not found" });

    const up = {};
    const fieldsToTrack = [
      "title", "description", "status", "dueDate", "reminder", "approved", "assigneeId", "branchId",
    ];

    fieldsToTrack.forEach((k) => {
      if (typeof req.body[k] !== "undefined") {
        up[k] = req.body[k];
      }
    });

    up.updated_by = userId;

    if (Object.keys(up).length > 1) {
      await todo.update(up);
    }

    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: "assignee" },
        { model: User, as: "creator" },
        { model: User, as: "updater" },
        { model: User, as: "approver" },
        { model: Branch, as: "branch" },
      ],
    });

    const mapped = mapTodoPayload(updatedTodo);
    res.json({ status: "true", data: mapped });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ status: "false", message: "Todo not found" });

    await todo.update({ isDelete: true, updated_by: userId });

    res.json({ status: "true", message: "Deleted" });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};
