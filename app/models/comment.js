const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    todoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: "comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = Comment;