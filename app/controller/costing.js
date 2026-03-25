const CostingSetting = require("../models/costingSetting");

exports.updateSettings = async (req, res) => {
    try {
        const { lineId } = req.params;
        const { resinRate, brassRate, profitMargin, multiplier, tierMargins, business_id } = req.body;
        const userId = req.user?.id || null;

        const updateData = {
            lineId,
            business_id, // Now part of the unique identifier
            resinRate,
            brassRate,
            profitMargin,
            multiplier,
            starMargin: tierMargins?.star,
            goldMargin: tierMargins?.gold,
            silverMargin: tierMargins?.silver,
            created_by: userId,
            updated_by: userId
        };

        // upsert checks the composite primary key (lineId + business_id)
        const [setting, created] = await CostingSetting.upsert(updateData);

        return res.status(200).json({
            status: "true",
            message: created ? "Settings created successfully" : "Settings updated successfully",
            data: setting
        });
    } catch (error) {
        return res.status(400).json({ status: "false", message: error.message });
    }
};

// GET /costing/settings/:lineId?business_id=2
exports.getSettings = async (req, res) => {
    try {
        const { lineId } = req.params;
        const { business_id } = req.query;

        if (!business_id) {
            return res.status(400).json({ status: "false", message: "business_id is required" });
        }

        const settings = await CostingSetting.findOne({
            where: { lineId, business_id }
        });

        if (!settings) {
            return res.status(404).json({ status: "false", message: "Settings not found for this line and business" });
        }

        const responseData = {
            resinRate: settings.resinRate,
            brassRate: settings.brassRate,
            profitMargin: settings.profitMargin,
            multiplier: settings.multiplier,
            tierMargins: {
                star: settings.starMargin,
                gold: settings.goldMargin,
                silver: settings.silverMargin
            },
            business_id: settings.business_id,
            updatedBy: settings.updated_by
        };

        return res.status(200).json({ status: "success", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: "false", message: error.message });
    }
};