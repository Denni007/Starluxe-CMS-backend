// app/controller/LeadActivityLogController.js
const LeadActivityLog = require("../models/LeadActivityLog.js");
const User = require("../models/user.js");
const Lead = require("../models/lead.js");

// Helper function to parse the summary string into an array of messages
const parseLogSummary = (log) => {
    const jsonLog = log.toJSON ? log.toJSON() : log;
    
    let parsedArray = [jsonLog.summary || '']; 

    if (jsonLog.summary && typeof jsonLog.summary === 'string') {
        try {
            const tempArray = JSON.parse(jsonLog.summary);
            
            if (Array.isArray(tempArray)) {
                parsedArray = tempArray;
            }
        } catch (error) {
        }
    }
    
    jsonLog.summary = parsedArray; 
    delete jsonLog.change_messages; 
    return jsonLog;
};

// GET /api/activities/log/:id - Retrieve a single activity log by its ID
exports.getLogById = async (req, res) => {
    try {
        const logId = Number(req.params.id);

        if (isNaN(logId)) {
            return res.status(400).json({ status: "false", message: "Invalid Log ID provided." });
        }

        const log = await LeadActivityLog.findByPk(logId, {
            include: [
                {
                    model: User,
                    as: "changer", 
                    attributes: ["id", "user_name", "first_name", "last_name"],
                },
                {
                    model: Lead,
                    as: "lead", 
                    attributes: ["id", "lead_name"],
                },
            ],
        });

        if (!log) {
            return res.status(404).json({ status: "false", message: "Activity log not found." });
        }

        // ⬅️ APPLY PARSING: Parse the summary field for the array of changes
        const mappedLog = parseLogSummary(log);

        res.json({ status: "true", data: mappedLog });
    } catch (e) {
        console.error("getLogById error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};


// GET /api/activities/lead/:id - Retrieve logs for a single lead
exports.getLeadActivities = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ status: "false", message: "Invalid Lead ID provided." });
        }

        const logs = await LeadActivityLog.findAll({
            where: { lead_id: id },
            include: [
                {
                    model: User,
                    as: "changer", 
                    attributes: ["id", "user_name", "first_name", "last_name"],
                },
                // Optional: Include Lead model if needed for context
                // { model: Lead, as: "lead", attributes: ["lead_name"] },
            ],
            order: [["created_at", "DESC"]],
        });

        if (!logs || logs.length === 0) {
            return res.status(404).json({ status: "false", message: "No activity logs found for this lead." });
        }

        // ⬅️ APPLY PARSING: Map and parse the summary field for all logs
        const mappedLogs = logs.map(parseLogSummary);
        
        res.json({ status: "true", data: mappedLogs });
    } catch (e) {
        console.error("getLeadActivities error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};


exports.listAllActivities = async (req, res) => {
    try {
        // Implement simple pagination/filtering here if needed for large datasets
        const limit = Number(req.query.limit) || 50;
        const offset = Number(req.query.offset) || 0;

        const logs = await LeadActivityLog.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [
                {
                    model: User,
                    as: "changer",
                    attributes: ["id", "user_name", "first_name", "last_name"],
                },
                {
                    model: Lead,
                    as: "lead", // Assuming 'lead' association is set up (see Associations section)
                    attributes: ["id", "lead_name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // ⬅️ APPLY PARSING: Map and parse the summary field for all logs
        const mappedLogs = logs.rows.map(parseLogSummary);
        
        res.json({ status: "true", data: mappedLogs, total: logs.count });
    } catch (e) {
        console.error("listAllActivities error:", e);
        res.status(500).json({ status: "false", message: "Internal Server Error" });
    }
};