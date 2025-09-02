import sequelize from "../database/db.js";
import User from "./userModel.js";
import Business from "./businessModel.js";
import Branch from "./branchModel.js";
import Permission from "./permissionModel.js";
import RolePermission from "./RolePermissionModel.js";
import UserBusinessRole from "./UserBusinessRole.js";
import Role from "./roleModel.js"
import Industry from "./industryModel.js";

// Business ↔ Branch
Business.hasMany(Branch, { foreignKey: "business_id", as: "branches" });
Branch.belongsTo(Business, { foreignKey: "business_id", as: "business" });

// Branch ↔ Role
Branch.hasMany(Role, { foreignKey: "branch_id", as: "roles" });
Role.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

// Role ↔ Permission (many-to-many)
Role.belongsToMany(Permission, {
  through: RolePermission, foreignKey: "role_id", otherKey: "permission_id", as: "permissions"
});
Permission.belongsToMany(Role, {
  through: RolePermission, foreignKey: "permission_id", otherKey: "role_id", as: "roles"
});

// User ↔ Business/Branch/Role (UserBusinessRole)
User.belongsToMany(Branch, {
  through: UserBusinessRole, foreignKey: "user_id", otherKey: "branch_id", as: "branches"
});
Branch.belongsToMany(User, {
  through: UserBusinessRole, foreignKey: "branch_id", otherKey: "user_id", as: "users"
});

UserBusinessRole.belongsTo(User, { foreignKey: "user_id", as: "user" });
UserBusinessRole.belongsTo(Business, { foreignKey: "business_id", as: "business" });
UserBusinessRole.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
UserBusinessRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasMany(UserBusinessRole, { foreignKey: "user_id", as: "assignments" });
Branch.hasMany(UserBusinessRole, { foreignKey: "branch_id", as: "assignments" });
Role.hasMany(UserBusinessRole, { foreignKey: "role_id", as: "assignments" });
Business.hasMany(UserBusinessRole, { foreignKey: "business_id", as: "assignments" });


Industry.hasMany(Business, {
  foreignKey: "industry_id",
  as: "businesses",
});
Business.belongsTo(Industry, {
  foreignKey: "industry_id",
  as: "industry",
});

export {
  sequelize,
  User, Business, Branch, Role, Permission, RolePermission, UserBusinessRole, Industry
};
