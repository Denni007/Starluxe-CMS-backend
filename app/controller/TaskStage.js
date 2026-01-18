const TaskStage = require("../models/TaskStage.js");

exports.list = async (req, res) => {
  try {
    const items = await TaskStage.findAll({
      order: [["name", "ASC"]],
    });
    res.json({ status: "true", data: items });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await TaskStage.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "false", message: "TaskStage not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    let items;

    if (Array.isArray(payload)) {
      items = await TaskStage.bulkCreate(payload, { validate: true });
    } else {
      items = await TaskStage.create(payload);
    }

    res.status(200).json({ status: "true", data: items });
  } catch (e) {
    console.error("❌ Error creating industries:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, order, color } = req.body;
    const item = await TaskStage.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "TaskStage not found" });
    }

    item.name = name || item.name;
    item.description = description || item.description;
    item.color = color || item.color;
    item.order = order || item.order;
    await item.save();

    res.json({ status: "true", data: item });
  } catch (e) {
    res.status(400).json({ status: "false", message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await TaskStage.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ status: "false", message: "TaskStage not found" });
    }

    try {
      await item.destroy();
      res.json({ status: "true", message: "TaskStage deleted successfully" });
    } catch (dbError) {

      if (dbError.name === 'SequelizeForeignKeyConstraintError' ||
        (dbError.original && (dbError.original.code === 'ER_ROW_IS_REFERENCED' || dbError.original.errno === 1451))) {

        const message = "Cannot delete this Task Stage because it is currently linked to one or more Task. Please update or delete the linked Tasks first.";

        return res.status(409).json({
          status: "false",
          message: message,
          error_type: "ForeignKeyConstraintError"
        });
      }
      throw dbError;
    }

  } catch (e) {
    console.error("TaskStage remove error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};