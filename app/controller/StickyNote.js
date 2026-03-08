const { Op } = require("sequelize");
const db = require("../models");
const StickyNote = db.StickyNote;

/**
 * POST /stickynotes
 * Add a new sticky note
 */
const addStickyNote = async (req, res) => {
  try {
    const { content, type, color, branch_id, mentioned_users } = req.body;

    if (!content || !type || !color) {
      return res.status(400).json({ status: "false", message: "Content, type, and color are required." });
    }

    const stickyNote = await StickyNote.create({
      content,
      type,
      color,
      branch_id,
      mentioned_users,
      created_by: req.user.id,
      updated_by: req.user.id,
    });
    res.status(201).json({ status: "true", data: stickyNote });
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
};

/**
 * GET /stickynotes
 * Get all sticky notes for the user (created by them or mentioning them)
 */
const getStickyNotes = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const userId = parseInt(req.user.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ status: "false", message: "Invalid user authentication." });
    }

    const where = {
      is_archived: false,
      [Op.or]: [
        { created_by: userId },
        db.sequelize.literal(`JSON_CONTAINS(mentioned_users, CAST(${userId} AS JSON))`),
      ],
    };

    if (branch_id) {
      where.branch_id = branch_id;
    }

    const stickyNotes = await StickyNote.findAll({ where });
    res.status(200).json({ status: "true", data: stickyNotes });
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
};

/**
 * PUT /stickynotes/:id
 * Update a sticky note
 */
const updateStickyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, color, branch_id, mentioned_users } = req.body;

    const note = await StickyNote.findOne({ where: { id, created_by: req.user.id } });

    if (!note) {
      return res.status(404).json({ status: "false", message: "Sticky note not found or you don't have permission to update it." });
    }

    const [updated] = await StickyNote.update(
      { content, type, color, branch_id, mentioned_users, updated_by: req.user.id },
      { where: { id } }
    );

    if (updated) {
      const updatedStickyNote = await StickyNote.findOne({ where: { id } });
      return res.status(200).json({ status: "true", data: updatedStickyNote });
    }

    res.status(404).json({ message: "Sticky note not found" });

  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
};

/**
 * DELETE /stickynotes/:id
 * Delete a sticky note
 */
const deleteStickyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StickyNote.destroy({ where: { id, created_by: req.user.id } });

    if (deleted) {
      res.status(200).json({ status: "true", message: "Sticky note deleted successfully." });
    } else {
      res.status(404).json({ status: "false", message: "Sticky note not found or you don't have permission to delete it." });
    }
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
};

/**
 * PUT /stickynotes/archive/:id
 * Archive a sticky note
 */
const archiveStickyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await StickyNote.findOne({ where: { id } });

    if (!note) {
      return res.status(404).json({ status: "false", message: "Sticky note not found." });
    }

    const isMentioned = note.mentioned_users && note.mentioned_users.includes(userId);
    if (note.created_by !== userId && !isMentioned) {
      return res.status(403).json({ status: "false", message: "You don't have permission to archive this note." });
    }

    const [updated] = await StickyNote.update({ is_archived: true, updated_by: userId }, { where: { id } });

    if (updated) {
      res.status(200).json({ status: "true", message: "Sticky note archived successfully." });
    } else {
      res.status(404).json({ status: "false", message: "Sticky note not found." });
    }
  } catch (error) {
    res.status(500).json({ status: "false", message: error.message });
  }
};

module.exports = {
  addStickyNote,
  getStickyNotes,
  updateStickyNote,
  deleteStickyNote,
  archiveStickyNote,
};
