// app/models/index.js
const sequelize = require("../config");
const User           = require("./user");
const Industry       = require("./industry");
const Business       = require("./business");
const Branch         = require("./branch");
const Role           = require("./role");
const Permission     = require("./permission");
const UserBranchRole = require("./UserBranchRole");
const RolePermission = require("./RolePermission");

// 🔗 Business ↔ Industry
Industry.hasMany(Business, {  foreignKey: "industry_id",  as: "businesses",  onDelete: "RESTRICT",  onUpdate: "CASCADE",});
Business.belongsTo(Industry, {  foreignKey: "industry_id",  as: "industry",  onDelete: "RESTRICT",  onUpdate: "CASCADE",});

// Business ↔ Branch
Business.hasMany(Branch, { foreignKey: "business_id", as: "branches", onDelete: "CASCADE", onUpdate: "CASCADE" });
Branch.belongsTo(Business, { foreignKey: "business_id", as: "business", onDelete: "CASCADE", onUpdate: "CASCADE" });

// Branch ↔ Role
Branch.hasMany(Role, { foreignKey: "branch_id", as: "roles", onDelete: "CASCADE", onUpdate: "CASCADE" });
Role.belongsTo(Branch, { foreignKey: "branch_id", as: "branch", onDelete: "CASCADE", onUpdate: "CASCADE" });

// Business ↔ Permission
Business.hasMany(Permission, { foreignKey: "business_id", as: "permissions", onDelete: "CASCADE" });
Permission.belongsTo(Business, { foreignKey: "business_id", as: "business", onDelete: "CASCADE" });

RolePermission.belongsTo(Permission, { as: "permission", foreignKey: "permission_id" });
Permission.hasMany(RolePermission, { as: "role_permissions", foreignKey: "permission_id" });



// Audit: created_by / updated_by → User.id
Business.belongsTo(User, { as: "creator", foreignKey: "created_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Business.belongsTo(User, { as: "updater", foreignKey: "updated_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Branch.belongsTo(User,   { as: "creator", foreignKey: "created_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Branch.belongsTo(User,   { as: "updater", foreignKey: "updated_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Role.belongsTo(User,     { as: "creator", foreignKey: "created_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });
Role.belongsTo(User,     { as: "updater", foreignKey: "updated_by", onDelete: "RESTRICT", onUpdate: "CASCADE" });

// Role ⇄ Permission (many-to-many)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

// User ↔ Branch ↔ Role via UserBranchRole
User.belongsToMany(Role, {
  through: UserBranchRole,
  foreignKey: "user_id",
  otherKey: "role_id",
  as: "roles",
});
Role.belongsToMany(User, {
  through: UserBranchRole,
  foreignKey: "role_id",
  otherKey: "user_id",
  as: "users",
});
User.hasMany(UserBranchRole,   { foreignKey: "user_id",   as: "memberships", onDelete: "CASCADE" });
Branch.hasMany(UserBranchRole, { foreignKey: "branch_id", as: "memberships", onDelete: "CASCADE" });
Role.hasMany(UserBranchRole,   { foreignKey: "role_id",   as: "memberships", onDelete: "CASCADE" });
UserBranchRole.belongsTo(User,   { foreignKey: "user_id",   as: "user" });
UserBranchRole.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
UserBranchRole.belongsTo(Role,   { foreignKey: "role_id",   as: "role" });

module.exports = {
  sequelize,
  User,
  Business,
  Branch,
  Role,
  Permission,
  UserBranchRole,
  RolePermission,
};







// const sequelize = require("../config/index");
// const User = require("./user");
// const Business = require("./business");
// const Branch = require("./branch");
// const Permission = require("./permission");
// const RolePermission = require("./RolePermission");
// const UserBusinessRole = require("./UserBusiness");
// const Role = require("./role");
// const Industry = require("./industry");

// // -----------------------------
// // Business ↔ Branch
// // -----------------------------
// Business.hasMany(Branch, { foreignKey: "business_id", as: "branches" });
// Branch.belongsTo(Business, { foreignKey: "business_id", as: "business" });

// // -----------------------------
// // Branch ↔ Role
// // -----------------------------
// Branch.hasMany(Role, { foreignKey: "branch_id", as: "roles" });
// Role.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

// // -----------------------------
// // Role ↔ Permission (many-to-many)
// // -----------------------------
// Role.belongsToMany(Permission, {
//   through: RolePermission,
//   foreignKey: "role_id",
//   otherKey: "permission_id",
//   as: "permissions",
// });
// Permission.belongsToMany(Role, {
//   through: RolePermission,
//   foreignKey: "permission_id",
//   otherKey: "role_id",
//   as: "roles",
// });

// // -----------------------------
// // User ↔ Business/Branch/Role (UserBusinessRole)
// // -----------------------------
// User.belongsToMany(Branch, {
//   through: UserBusinessRole,
//   foreignKey: "user_id",
//   otherKey: "branch_id",
//   as: "branches",
// });
// Branch.belongsToMany(User, {
//   through: UserBusinessRole,
//   foreignKey: "branch_id",
//   otherKey: "user_id",
//   as: "users",
// });

// UserBusinessRole.belongsTo(User, { foreignKey: "user_id", as: "user" });
// UserBusinessRole.belongsTo(Business, { foreignKey: "business_id", as: "business" });
// UserBusinessRole.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
// UserBusinessRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });

// User.hasMany(UserBusinessRole, { foreignKey: "user_id", as: "assignments" });
// Branch.hasMany(UserBusinessRole, { foreignKey: "branch_id", as: "assignments" });
// Role.hasMany(UserBusinessRole, { foreignKey: "role_id", as: "assignments" });
// Business.hasMany(UserBusinessRole, { foreignKey: "business_id", as: "assignments" });

// // -----------------------------
// // Industry ↔ Business
// // -----------------------------
// Industry.hasMany(Business, {
//   foreignKey: "industry_id",
//   as: "businesses",
// });
// Business.belongsTo(Industry, {
//   foreignKey: "industry_id",
//   as: "industry",
// });

// // -----------------------------
// // Export all models + sequelize
// // -----------------------------
// module.exports = {
//   sequelize,
//   User,
//   Business,
//   Branch,
//   Role,
//   Permission,
//   RolePermission,
//   UserBusinessRole,
//   Industry,
// };
