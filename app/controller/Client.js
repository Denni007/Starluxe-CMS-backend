// app/controller/Client.js
const db = require("../models");
const Client = db.Client;

// Add a new client
exports.addClient = async (req, res) => {
    try {
        const { name, email, phone, address, anniversary_date, special_dates, business_name, business_type, business_website, business_description, branch_id } = req.body;
        const client = await Client.create({
            name,
            email,
            phone,
            address,
            anniversary_date,
            special_dates,
            business_name,
            business_type,
            business_website,
            business_description,
            branch_id,
            created_by: req.user.id,
            updated_by: req.user.id,
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all clients
exports.getClients = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const where = {};
        if (branch_id) {
            where.branch_id = branch_id;
        }
        const clients = await Client.findAll({ where });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a client
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, anniversary_date, special_dates, business_name, business_type, business_website, business_description, branch_id } = req.body;
        const [updated] = await Client.update(
            { name, email, phone, address, anniversary_date, special_dates, business_name, business_type, business_website, business_description, branch_id, updated_by: req.user.id },
            { where: { id } }
        );
        if (updated) {
            const updatedClient = await Client.findOne({ where: { id } });
            res.status(200).json(updatedClient);
        } else {
            res.status(404).json({ message: "Client not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a client
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Client.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Client not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
