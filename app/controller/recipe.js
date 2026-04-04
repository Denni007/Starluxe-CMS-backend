const Recipe = require("../models/recipe");

exports.getAllByBusiness = async (req, res) => {
    try {
        const { businessId } = req.params;
        const data = await Recipe.findAll({ 
            where: { business_id: businessId },
            order: [["id", "DESC"]]
        });
        res.json({ status: "true", data });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await Recipe.create({ 
            ...req.body, 
            created_by: req.user.id,
            updated_by: req.user.id 
        });
        res.json({ status: "true", message: "Recipe created successfully", data });
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Recipe.update(
            { ...req.body, updated_by: req.user.id }, 
            { where: { id } }
        );
        
        if (updated) {
            res.json({ status: "true", message: "Recipe updated successfully" });
        } else {
            res.status(404).json({ status: "false", message: "Recipe not found" });
        }
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Recipe.destroy({ where: { id } });
        if (deleted) {
            res.json({ status: "true", message: "Recipe deleted successfully" });
        } else {
            res.status(404).json({ status: "false", message: "Recipe not found" });
        }
    } catch (e) {
        res.status(400).json({ status: "false", message: e.message });
    }
};
