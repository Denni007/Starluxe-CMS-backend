const RawMaterial = require("../models/rawMaterial");
const Recipe = require("../models/recipe");
const { Op } = require("sequelize");

exports.getAllByBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;
        const data = await RawMaterial.findAll({ where: { business_id: businessId } });
        res.json({ status: "true", data });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await RawMaterial.create({ ...req.body, created_by: req.user.id });
        res.json({ status: "true", message: "Raw Material created", data });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { rate_per_kg } = req.body;
        const userId = req.user.id;

        // 1. Update Raw Material
        await RawMaterial.update(
            { ...req.body, updated_by: userId },
            { where: { id } }
        );

        // 2. Get recipes
        const recipes = await Recipe.findAll();

        const updatePromises = recipes.map(async (recipe) => {
            if (!Array.isArray(recipe.items)) return;

            let itemsChanged = false;

            const updatedItems = recipe.items.map(item => {
                if (Number(item.raw_material_id) === Number(id)) {
                    itemsChanged = true;

                    const rate = rate_per_kg ?? item.rate_per_kg ?? 0;
                    const usage = parseFloat(item.usage || 0);

                    return {
                        ...item,
                        rate_per_kg: rate,
                        total: parseFloat((rate * usage).toFixed(2))
                    };
                }
                return item;
            });

            if (!itemsChanged) return;

            // totals
            const totalUsage = updatedItems.reduce(
                (sum, i) => sum + parseFloat(i.usage || 0),
                0
            );

            const totalAmount = updatedItems.reduce(
                (sum, i) => sum + parseFloat(i.total || 0),
                0
            );

            // ✅ correct business logic
            const finalValue =
                totalUsage > 0
                    ? totalAmount / totalUsage
                    : 0;

            return recipe.update({
                items: updatedItems,
                total_usage: parseFloat(totalUsage.toFixed(2)),
                total_amount: parseFloat(totalAmount.toFixed(2)),
                final_value: parseFloat(finalValue.toFixed(2)),
                updated_by: userId
            });
        });

        await Promise.all(updatePromises);

        res.json({
            status: "true",
            message: "Raw Material updated and recipes recalculated"
        });

    } catch (e) {
        console.error("Sync Error:", e);
        res.status(400).json({
            status: "false",
            message: e.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        await RawMaterial.destroy({ where: { id: req.params.id } });
        res.json({ status: "true", message: "Deleted successfully" });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};
