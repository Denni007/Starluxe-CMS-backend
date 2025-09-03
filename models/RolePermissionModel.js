// import { DataTypes } from "sequelize";
// import sequelize from "../database/db.js";

// const RolePermission = sequelize.define("RolePermission", {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   role_id: { type: DataTypes.INTEGER, allowNull: false },
//   permission_id: { type: DataTypes.INTEGER, allowNull: false },
// }, {
//   tableName: "role_permissions",
//   timestamps: false,
//   indexes: [
//     { unique: true, fields: ["role_id", "permission_id"] }
//   ]
// });

// export default RolePermission;


import { DataTypes } from "sequelize";
import sequelize from "../database/db.js";
import Role from "./roleModel.js";
import Permission from "./permissionModel.js";

const RolePermission = sequelize.define("RolePermission", {
  role_id: {
    type: DataTypes.INTEGER,
    references: { model: Role, key: "id" },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    references: { model: Permission, key: "id" },
  },
});

export default RolePermission;