const CostingSetting = require("../models/costingSetting");

exports.updateSettings = async (req, res) => {
    try {
        const { lineId } = req.params;
        const { resinRate, brassRate, profitMargin, multiplier, tierMargins } = req.body;
        
        // Use the ID from the authenticated user (isAuth middleware)
        const userId = req.user?.id || null;

        const updateData = {
            lineId,
            resinRate,
            brassRate,
            profitMargin,
            multiplier,
            starMargin: tierMargins?.star,
            goldMargin: tierMargins?.gold,
            silverMargin: tierMargins?.silver,
            created_by: userId, // Required for New Records
            updated_by: userId  // Required for Updates
        };

        const [setting, created] = await CostingSetting.upsert(updateData);

        return res.status(200).json({
            status: "true",
            message: created ? "Settings created successfully" : "Settings updated successfully",
            data: setting
        });
    } catch (error) {
        return res.status(400).json({
            status: "false",
            message: error.message
        });
    }
};

// ... existing updateSettings code ...

exports.getSettings = async (req, res) => {
    try {
        const { lineId } = req.params;

        const settings = await CostingSetting.findOne({
            where: { lineId: lineId }
        });

        if (!settings) {
            return res.status(404).json({
                status: "false",
                message: "Costing settings not found for this line"
            });
        }

        // Reconstruct the tierMargins object to match your API spec 
        // since we stored them as flat columns in the DB
        const responseData = {
            ...settings.toJSON(),
            tierMargins: {
                star: settings.starMargin,
                gold: settings.goldMargin,
                silver: settings.silverMargin
            }
        };

        return res.status(200).json({
            status: "true",
            message: "Settings retrieved successfully",
            data: responseData
        });
    } catch (error) {
        return res.status(500).json({
            status: "false",
            message: error.message
        });
    }
};
