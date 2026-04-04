const CostingSetting = require("../models/costingSetting");
const Recipe = require("../models/recipe"); // Import the Recipe model

exports.updateSettings = async (req, res) => {
    try {
        const { lineId } = req.params;
        const {
            resinRate,
            brassRate,
            profitMargin,
            multiplier,
            tierMargins,
            recipeId,
            refMargin, cdMargin, todMargin,
            business_id
        } = req.body;

        // FIX: Extract the user ID from the authenticated request
        // In your project, this is typically set by the isAuth middleware
        const userId = req.user ? req.user.id : null;

        const updateData = {
            lineId,
            business_id,
            resinRate,
            brassRate,
            profitMargin,
            multiplier,
            starMargin: tierMargins?.star,
            goldMargin: tierMargins?.gold,
            silverMargin: tierMargins?.silver,
            recipe_id: recipeId,
            refMargin,
            cdMargin,
            todMargin,
            created_by: userId,
            updated_by: userId
        };

        // upsert will insert created_by if the record is new
        const [setting, created] = await CostingSetting.upsert(updateData);

        return res.status(200).json({
            status: "success",
            message: created ? "Costing settings created" : "Costing settings updated",
            data: setting
        });
    } catch (error) {
        console.error("Costing Update Error:", error);
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
            where: { lineId, business_id },
            // Join with the Recipe model using the recipe_id
            include: [
                {
                    model: Recipe,
                    as: 'recipeDetail', // Ensure this alias matches your model association
                    attributes: ['id', 'name', 'total_usage', 'total_amount', 'final_value', 'items']
                }
            ]
        });

        if (!settings) {
            return res.status(404).json({ status: "false", message: "Settings not found" });
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
            refMargin: settings.refMargin, 
            cdMargin: settings.cdMargin,   
            todMargin: settings.todMargin, 
            business_id: settings.business_id,
            recipeId: settings.recipe_id,
            // Include the full recipe details for the frontend
            recipeDetail: settings.recipeDetail || null,
            updatedBy: settings.updated_by
        };

        return res.status(200).json({ status: "success", data: responseData });
    } catch (error) {
        return res.status(500).json({ status: "false", message: error.message });
    }
};