const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const StickyNote = sequelize.define("stickynotes", {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("note", "idea", "suggestion"),
      defaultValue: "note",
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mentioned_users: {
      type: DataTypes.JSON, // Corrected from JSONB to JSON
      allowNull: true,
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
  }, {
    tableName: "stickynotes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

module.exports = StickyNote;
