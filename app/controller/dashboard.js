const { Op, fn, col } = require("sequelize");
const { Lead, Task, Call, User, LeadActivityLog } = require("../models");

/* ======================================================
   HELPERS
====================================================== */

const buildDateFilter = (from, to) => {
    if (!from && !to) return {};
    return {
        created_at: {
            ...(from && { [Op.gte]: new Date(from) }),
            ...(to && { [Op.lte]: new Date(to) }),
        },
    };
};

/* ======================================================
   BUSINESS DASHBOARD
====================================================== */

/**
 * GET /api/dashboard/:business_id/:branch_id/business/summary
 */
exports.businessSummaryByBranch = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;

        const where = {
            branch_id,
            ...buildDateFilter(from, to),
        };

        const [totalLeads, totalTasks] = await Promise.all([
            Lead.count({ where }),
            Task.count({ where }),
        ]);

        const leadsByUser = await Lead.findAll({
            attributes: [
                "assigned_user",
                [fn("COUNT", col("Lead.id")), "lead_count"],
            ],
            where,
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["id", "first_name", "last_name"],
                },
            ],
            group: ["assigned_user", "assignee.id"],
        });

        const tasksByUser = await Task.findAll({
            attributes: [
                "assigned_user",
                [fn("COUNT", col("Task.id")), "task_count"],
            ],
            where,
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["id", "first_name", "last_name"],
                },
            ],
            group: ["assigned_user", "assignee.id"],
        });

        res.json({
            status: true,
            data: { totalLeads, totalTasks, leadsByUser, tasksByUser },
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/business/leads-by-source
 */
exports.leadsBySource = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;

        const data = await Lead.findAll({
            attributes: [
                "lead_source_id",
                [fn("COUNT", col("Lead.id")), "count"],
            ],
            where: {
                branch_id,
                ...buildDateFilter(from, to),
            },
            group: ["lead_source_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/business/leads-by-source-status
 */
exports.leadsBySourceStatus = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;

        const data = await Lead.findAll({
            attributes: [
                "lead_source_id",
                "lead_stage_id",
                [fn("COUNT", col("Lead.id")), "count"],
            ],
            where: {
                branch_id,
                ...buildDateFilter(from, to),
            },
            group: ["lead_source_id", "lead_stage_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/business/branch-comparison
 */
exports.branchComparison = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;

        const data = await Lead.findAll({
            attributes: [
                "lead_stage_id",
                [fn("COUNT", col("Lead.id")), "count"],
            ],
            where: {
                branch_id,
                ...buildDateFilter(from, to),
            },
            group: ["lead_stage_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/business/conversion-metrics
 */
exports.conversionMetrics = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;

        const data = await Lead.findAll({
            attributes: [
                "lead_stage_id",
                [fn("COUNT", col("Lead.id")), "total_leads"],
                [fn("SUM", col("amount")), "total_revenue"],
            ],
            where: {
                branch_id,
                ...buildDateFilter(from, to),
            },
            group: ["lead_stage_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/* ======================================================
   USER DASHBOARD
====================================================== */

/**
 * GET /api/dashboard/:business_id/:branch_id/user/summary
 */
exports.userSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;
        const isAdmin = req.user.isAdmin === true;

        const where = {
            branch_id,
            ...(isAdmin ? {} : { assigned_user: req.user.id }),
            ...buildDateFilter(from, to),
        };

        const [leads, tasks, calls, activities] = await Promise.all([
            Lead.count({ where }),
            Task.count({ where }),
            Call.count({ where }),
            LeadActivityLog.count({
                where: {
                    ...(isAdmin ? {} : { user_id: req.user.id }),
                    ...buildDateFilter(from, to),
                },
            }),
        ]);

        res.json({
            status: true,
            data: { leads, tasks, calls, activities },
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/user/leads-by-stage
 */
exports.userLeadsByStage = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;
        const isAdmin = req.user.isAdmin === true;

        const data = await Lead.findAll({
            attributes: [
                "lead_stage_id",
                [fn("COUNT", col("Lead.id")), "count"],
            ],
            where: {
                branch_id,
                ...(isAdmin ? {} : { assigned_user: req.user.id }),
                ...buildDateFilter(from, to),
            },
            group: ["lead_stage_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/user/calls
 */
exports.userCalls = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;
        const isAdmin = req.user.isAdmin === true;

        const data = await Call.findAll({
            attributes: [
                "call_direction_id",
                [fn("COUNT", col("Call.id")), "count"],
            ],
            where: {
                branch_id,
                ...(isAdmin ? {} : { assigned_user: req.user.id }),
                ...buildDateFilter(from, to),
            },
            group: ["call_direction_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};

/**
 * GET /api/dashboard/:business_id/:branch_id/user/talk-time
 */
exports.userTalkTime = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { branch_id } = req.context;
        const isAdmin = req.user.isAdmin === true;

        const data = await Call.findAll({
            attributes: [
                "call_direction_id",
                [fn("SUM", col("duration")), "total_seconds"],
            ],
            where: {
                branch_id,
                ...(isAdmin ? {} : { assigned_user: req.user.id }),
                ...buildDateFilter(from, to),
            },
            group: ["call_direction_id"],
        });

        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
};
