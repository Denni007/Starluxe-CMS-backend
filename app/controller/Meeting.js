const { Op } = require("sequelize");
const db = require("../models");
const Meeting = db.Meeting;

// Validation function to check date format based on recurrence
const validateDate = (recurrence, date) => {
    const formatMap = {
        once: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
        daily: /^\d{2}:\d{2}$/,
        weekly: /^[1-7]-\d{2}:\d{2}$/,
        monthly: /^\d{2}-\d{2}:\d{2}$/,
        quarterly: /^[1-3]-\d{2}-\d{2}:\d{2}$/,
        'half-yearly': /^[1-6]-\d{2}-\d{2}:\d{2}$/,
        yearly: /^\d{2}-\d{2}-\d{2}:\d{2}$/,
    };
    return formatMap[recurrence]?.test(date) ?? false;
};

/**
 * POST /meetings
 * Add a new meeting
 */
const addMeeting = async (req, res) => {
    try {
        const { recurrence, date, title, message, attendees, branch_id } = req.body;

        if (!recurrence || !date || !title || !message) {
            return res.status(400).json({ status: "false", message: "Recurrence, date, title, and message are required." });
        }

        if (!validateDate(recurrence, date)) {
            return res.status(400).json({ status: "false", message: "Invalid date format for the selected recurrence." });
        }

        const meeting = await Meeting.create({
            recurrence,
            date,
            title,
            message,
            attendees,
            branch_id,
            created_by: req.user.id,
            updated_by: req.user.id,
        });
        res.status(201).json({ status: "true", data: meeting });
    } catch (error) {
        res.status(500).json({ status: "false", message: error.message });
    }
};

/**
 * GET /meetings
 * Get all meetings relevant to the user (created by them or attending)
 */
const getMeetings = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const userId = parseInt(req.user.id, 10);

        const where = {
            [Op.or]: [
                { created_by: userId },
                db.sequelize.literal(`JSON_CONTAINS(attendees, CAST(${userId} AS JSON))`)
            ]
        };

        if (branch_id) {
            where.branch_id = branch_id;
        }

        const meetings = await Meeting.findAll({ where });
        res.status(200).json({ status: "true", data: meetings });
    } catch (error) {
        res.status(500).json({ status: "false", message: error.message });
    }
};

/**
 * PUT /meetings/:id
 * Update a meeting
 */
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { recurrence, date, title, message, attendees, branch_id } = req.body;

        const meeting = await Meeting.findOne({ where: { id, created_by: req.user.id } });
        if (!meeting) {
            return res.status(404).json({ status: "false", message: "Meeting not found or you don't have permission to update it." });
        }

        if (recurrence && date && !validateDate(recurrence, date)) {
            return res.status(400).json({ status: "false", message: "Invalid date format for the selected recurrence." });
        }

        const [updated] = await Meeting.update(
            { recurrence, date, title, message, attendees, branch_id, updated_by: req.user.id },
            { where: { id } }
        );

        if (updated) {
            const updatedMeeting = await Meeting.findOne({ where: { id } });
            res.status(200).json({ status: "true", data: updatedMeeting });
        } else {
            res.status(404).json({ status: "false", message: "Meeting not found." });
        }
    } catch (error) {
        res.status(500).json({ status: "false", message: error.message });
    }
};

/**
 * DELETE /meetings/:id
 * Delete a meeting
 */
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Meeting.destroy({ where: { id, created_by: req.user.id } });

        if (deleted) {
            res.status(200).json({ status: "true", message: "Meeting deleted successfully." });
        } else {
            res.status(404).json({ status: "false", message: "Meeting not found or you don't have permission to delete it." });
        }
    } catch (error) {
        res.status(500).json({ status: "false", message: error.message });
    }
};

module.exports = {
    addMeeting,
    getMeetings,
    updateMeeting,
    deleteMeeting,
};