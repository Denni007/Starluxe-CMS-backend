// app/controller/LeadActivityLogController.js
const LeadActivityLog = require("../models/LeadActivityLog.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");
const LeadStage = require("../models/LeadStage.js");
const LeadSource = require("../models/LeadSource.js");
const CustomerType = require("../models/CustomerType.js");
const LeadType = require("../models/LeadType.js");
const Products = require("../models/product.js");
const Branch = require("../models/branch.js");

function parseLogSummary(log) {
    const jsonLog = log && typeof log.toJSON === "function" ? log.toJSON() : (log || {});
    let summaryArr = [];

    const raw = jsonLog.summary;
    if (!raw && raw !== "") {
        summaryArr = [];
    } else if (Array.isArray(raw)) {
        summaryArr = raw.slice();
    } else if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            summaryArr = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch (_) {
            summaryArr = [raw];
        }
    } else {
        summaryArr = [String(raw)];
    }

    return { ...jsonLog, summary: summaryArr };
}

async function resolveSummaryNames(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return [];

    const ids = {
        users: new Set(),
        stages: new Set(),
        sources: new Set(),
        branches: new Set(),
        customerTypes: new Set(),
        leadTypes: new Set(),
        products: new Set(),
    };

    const fieldToSet = {
        "assigned user": ids.users,
        "user id": ids.users,
        "lead stage id": ids.stages,
        "lead source id": ids.sources,
        "branch id": ids.branches,
        "customer type id": ids.customerTypes,
        "lead type id": ids.leadTypes,
        "product id": ids.products,
    };

    const parsedLogs = logs.map(parseLogSummary);

    for (const plog of parsedLogs) {
        for (const message of (plog.summary || [])) {
            const fieldMatch = message.match(/\*\*(.+?)\*\*/);
            if (!fieldMatch) continue;
            const fieldName = fieldMatch[1].trim().toLowerCase();

            const idMatches = [...message.matchAll(/\*(\d+)\*/g)].map(m => Number(m[1]));
            if (!idMatches.length) continue;

            const setForField = fieldToSet[fieldName];
            if (!setForField) continue;

            for (const id of idMatches) {
                if (!Number.isNaN(id)) setForField.add(id);
            }
        }
    }

    const [
        users, stages, sources, branches,
        customerTypes, leadTypes, products
    ] = await Promise.all([
        ids.users.size ? User.findAll({ where: { id: Array.from(ids.users) }, attributes: ['id', 'first_name', 'last_name', 'user_name', 'email'] }) : Promise.resolve([]),
        ids.stages.size ? LeadStage.findAll({ where: { id: Array.from(ids.stages) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        ids.sources.size ? LeadSource.findAll({ where: { id: Array.from(ids.sources) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        ids.branches.size ? Branch.findAll({ where: { id: Array.from(ids.branches) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        ids.customerTypes.size ? CustomerType.findAll({ where: { id: Array.from(ids.customerTypes) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        ids.leadTypes.size ? LeadType.findAll({ where: { id: Array.from(ids.leadTypes) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
        ids.products.size ? Products.findAll({ where: { id: Array.from(ids.products) }, attributes: ['id', 'name'] }) : Promise.resolve([]),
    ]);

    const lookup = {
        'assigned user': new Map(users.map(u => [u.id, ((u.first_name || "").trim() + (u.last_name ? " " + u.last_name.trim() : "")).trim() || u.user_name || u.email || `User#${u.id}`])),
        'user id': new Map(users.map(u => [u.id, ((u.first_name || "").trim() + (u.last_name ? " " + u.last_name.trim() : "")).trim() || u.user_name || u.email || `User#${u.id}`])),
        'lead stage id': new Map(stages.map(s => [s.id, s.name])),
        'lead source id': new Map(sources.map(s => [s.id, s.name])),
        'branch id': new Map(branches.map(b => [b.id, b.name])),
        'customer type id': new Map(customerTypes.map(c => [c.id, c.name])),
        'lead type id': new Map(leadTypes.map(l => [l.id, l.name])),
        'product id': new Map(products.map(p => [p.id, p.name])), 
    };

    const transformed = parsedLogs.map(plog => {
        const out = { ...plog };

        out.summary = (plog.summary || []).map(message => {
            const fieldMatch = message.match(/\*\*(.+?)\*\*/);
            if (!fieldMatch) return message;

            const fieldName = fieldMatch[1].trim().toLowerCase();
            const mapForField = lookup[fieldName];
            if (!mapForField) return message;

            const newMessage = message.replace(/\*(\d+)\*/g, (m, idStr) => {
                const id = Number(idStr);
                const name = mapForField.get(id);
                return name ? `*${name}*` : `*${id}*`;
            });

            return newMessage;
        });

        return out;
    });

    return transformed;
}


// GET /api/activities/log/:id - Retrieve a single activity log by its ID
exports.getLogById = async (req, res) => {
    try {
        const logId = Number(req.params.id);
        if (isNaN(logId)) return res.status(400).json({ status: "false", message: "Invalid Log ID provided." });

        const log = await LeadActivityLog.findByPk(logId, {
            include: [
                { model: User, as: "changer", attributes: ["id", "user_name", "first_name", "last_name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
            ],
        });

        if (!log) return res.status(404).json({ status: "false", message: "Activity log not found." });

        const mappedLogs = await resolveSummaryNames([log]);
        res.json({ status: "true", data: mappedLogs[0] });
    } catch (e) {
        console.error("getLogById error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};


// GET /api/activities/lead/:id - Retrieve logs for a single lead
exports.getLeadActivities = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ status: "false", message: "Invalid Lead ID provided." });

        const logs = await LeadActivityLog.findAll({
            where: { lead_id: id },
            include: [
                { model: User, as: "changer", attributes: ["id", "user_name", "first_name", "last_name"] },
            ],
            order: [["created_at", "DESC"]],
        });

        if (!logs || logs.length === 0) return res.status(404).json({ status: "false", message: "No activity logs found for this lead." });

        const mappedLogs = await resolveSummaryNames(logs);
        res.json({ status: "true", data: mappedLogs });
    } catch (e) {
        console.error("getLeadActivities error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};


exports.listAllActivities = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;

        const logs = await LeadActivityLog.findAndCountAll({
            limit,
            offset,
            include: [
                { model: User, as: "changer", attributes: ["id", "user_name", "first_name", "last_name"] },
                { model: Lead, as: "lead", attributes: ["id", "lead_name"] },
            ],
            order: [["created_at", "DESC"]],
        });

        const mappedLogs = await resolveSummaryNames(logs.rows);
        res.json({ status: "true", data: mappedLogs, total: logs.count });
    } catch (e) {
        console.error("listAllActivities error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};
