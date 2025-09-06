// app/models/UserBranchRole.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const UserBranchRole = sequelize.define("UserBranchRole", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:   { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: false },
  role_id:   { type: DataTypes.INTEGER, allowNull: false },
  is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "user_branch_roles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  indexes: [
    { unique: true, fields: ["user_id", "branch_id", "role_id"] },
    { fields: ["user_id"] },
    { fields: ["branch_id"] },
    { fields: ["role_id"] },
  ],
});

module.exports = UserBranchRole;




// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/index");

// const UserBusinessRole = sequelize.define("UserBusinessRole", {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   user_id: { type: DataTypes.INTEGER, allowNull: false },
//   business_id: { type: DataTypes.INTEGER, allowNull: false },
//   branch_id: { type: DataTypes.INTEGER, allowNull: false },
//   role_id: { type: DataTypes.INTEGER, allowNull: false }, // unique role per user per branch
// }, {
//   tableName: "user_business_roles",
//   timestamps: true,
//   createdAt: "created_at",
//   updatedAt: "updated_at",
//   indexes: [
//     { unique: true, fields: ["user_id", "branch_id"] } // enforce single role per branch for user
//   ]
// });

// module.exports = UserBusinessRole;
