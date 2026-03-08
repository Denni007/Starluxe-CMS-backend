// app/models/ChatMessage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const ChatMessage = sequelize.define("ChatMessage", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    group_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: "chat_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = ChatMessage;
