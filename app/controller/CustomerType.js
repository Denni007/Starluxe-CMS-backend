const { CustomerType } = require("../models");

// Create a new CustomerType for a specific business
exports.create = async (req, res) => {
   try {
      const payload = req.body;
      let items;
      console.log(payload)
      // Validate existence of business_id for single creation
      if (!Array.isArray(payload) && !payload.business_id) {
          return res.status(400).json({ status: "false", message: "business_id is required for creating a Customer Type" });
      }
      // Validate existence of business_id for bulk creation (check first item)
      if (Array.isArray(payload) && payload.length > 0 && !payload[0].business_id) {
           return res.status(400).json({ status: "false", message: "business_id is required in payload for bulk creation" });
      }
  
  
      if (Array.isArray(payload)) {
        // Bulk create=
        items = await CustomerType.bulkCreate(payload, { validate: true });
      } else {
        // Single create

        items = await CustomerType.create(payload);
      }
  
      res.status(201).json({ status: "true", data: items });
    } catch (e) {
      // Check for unique constraint violation on name+business_id combination
      if (e.name === 'SequelizeUniqueConstraintError') {
           return res.status(409).json({ status: "false", message: "A CustomerType with this name already exists for this business." });
      }
      
      console.error("❌ Error creating Customer Type:", e.message);
      res.status(400).json({ status: "false", message: e.message });
    }
};

// Get all CustomerTypes for a specific business
exports.list = async (req, res) => {
  try {
    const { businessId } = req.params;
    console.log(businessId)
    const customerTypes = await CustomerType.findAll({ where: { businessId: parseInt(businessId, 10) } });
    res.json({ status: "true", data: customerTypes });
  } catch (error) {
    res.status(400).json({ status: "false", message: error.message });
  }
};

exports.listByBusiness = async (req, res) => {
  try {
    const item = await CustomerType.findAll({
      where: { business_id: req.params.id },
      order: [["name", "ASC"]],
    });
   
    
    if (!item) {
      return res.status(404).json({ status: "false", message: "CustomerType not found" });
    }
    res.json({ status: "true", data: item });
  } catch (e) {
    console.error("CustomerType get error:", e.message);
    res.status(400).json({ status: "false", message: e.message });
  }
};
// Get a single CustomerType by ID
exports.get = async (req, res) => {
  try {
    const { customerTypeId } = req.params;
    const customerType = await CustomerType.findByPk(customerTypeId);
    if (!customerType) {
      return res.status(404).json({ status: "false", message: "CustomerType not found" });
    }
    res.json({ status: "true", data: customerType });
  } catch (error) {
    res.status(400).json({ status: "false", message: error.message });
  }
};

// Update a CustomerType by ID
exports.update = async (req, res) => {
  try {
    const { customerTypeId } = req.params;
    const [updated] = await CustomerType.update(req.body, {
      where: { id: customerTypeId }
    });
    if (!updated) {
      return res.status(404).json({ status: "false", message: "CustomerType not found" });
    }
    const updatedCustomerType = await CustomerType.findByPk(customerTypeId);
    res.json({ status: "true", data: updatedCustomerType });
  } catch (error) {
    res.status(400).json({ status: "false", message: error.message });
  }
};

// Delete a CustomerType by ID
exports.remove = async (req, res) => {
  try {
    const { customerTypeId } = req.params;
    const deleted = await CustomerType.destroy({
      where: { id: customerTypeId }
    });
    if (!deleted) {
      return res.status(404).json({ status: "false", message: "CustomerType not found" });
    }
    res.status(204).json({ status: "true", message: "CustomerType deleted successfully" });
  } catch (error) {
    res.status(400).json({ status: "false", message: error.message });
  }
};