// // const bcrypt = require("bcrypt");
// // const {User, Permission, Business, Branch ,Role, Industry} = require("../app/models/index.js")
// // const {PERMISSION_ACTIONS,PERMISSION_MODULES, ROLE} = require("../app/constants/constant.js")

// // // import { User, Permission, Industry, Business, Branch ,Role} from "../models/index.js";
// // // import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../constants/constant.js";

// // // helper delay function
// // // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// //  exports.seedAdmin = async () => {
// //     try {
// //         for (const m of Object.values(PERMISSION_MODULES)) {
// //             for (const a of Object.values(PERMISSION_ACTIONS)) {
// //               await Permission.findOrCreate({
// //                 where: { module: m, action: a },
// //                 defaults: { module: m, action: a },
// //               });
// //             }
// //           }
// //           console.log("✅ Permissions seeded");

// //           const INDUSTRY_LIST = [
// //             "Information Technology",
// //             "Manufacturing",
// //             "Retail",
// //             "Healthcare",
// //             "Finance",
// //             "Logistics",
// //             "Education",
// //             "Real Estate",
// //             "Energy",
// //             "Hospitality",
// //           ];

// //           const email = "test@yopmail.com";
// //           const exists = await User.findOne({ where: { email } });

// //           if (!exists) {
// //             await User.create({
// //               user_name: "sysadmin",
// //               first_name: "System",
// //               last_name: "Admin",
// //               email: "test@yopmail.com",
// //               mobile_number: "9999999999",
// //               gender: "Other",
// //               password: await bcrypt.hash("123456", 10),
// //               is_admin: true,
// //               is_email_verify: true,
// //             });
// //             // await sleep(3000); // wait 3s before next insertion
// //             await User.create({
// //               user_name: "Manager",
// //               first_name: "System",
// //               last_name: "Manager",
// //               email: "test2@yopmail.com",
// //               mobile_number: "9999991999",
// //               gender: "Male",
// //               password: await bcrypt.hash("123456", 10),
// //               is_admin: false,
// //               is_email_verify: true,
// //             });
// //             console.log("done");
// //             // await sleep(3000); // wait 3s before next insertion
// //           }

// //           for (const name of INDUSTRY_LIST) {
// //             await Industry.findOrCreate({
// //               where: { name },
// //               defaults: { name },
// //             });
// //             // await sleep(3000); // wait 3s before next industry
// //           }

// //           const user = 1;
// //           const found = await User.findOne({ where: { id: user } });

// //           if (found) {
// //             await Business.create({
// //               name: "Acme Corp",
// //               industry_id: 1,
// //               contact_number: "1112223333",
// //               created_by: found.id,
// //               updated_by: found.id,
// //             }); 
// //             // await sleep(3000);

// //             await Branch.create({
// //               type: "OFFICE",
// //               name: "HQ",
// //               address_1: "123 Street",
// //               city: "Mumbai",
// //               state: "MH",
// //               country: "IN",
// //               pincode: "400001",
// //               business_id: 1,
// //               created_by: 1,
// //               updated_by: 1,
// //             }); 
// //             // await sleep(3000);
// //             await Role.create({
// //                 name: ROLE.SUPER_ADMIN,
// //                 description: "Super Admin role",
// //                 branch_id: 1,
// //                 permissions: [1, 2, 3],
// //                 created_by: 1,
// //                 updated_by: 1,
// //               }
// //             ); 
// //             console.log("created")
// //           }

// //     } catch (error) {
// //         console.log(error)
// //     }

// //       // seed super admin


// //  }
// //   // ensure all Permission rows exist (cartesian of modules x actions)

// // // module.exports = seedAdmin;
// // seeders/seeds.js
// const sequelize = require("../app/config");
// const bcrypt = require("bcrypt");
// const {
//   User, Permission, Business, Branch, Role, Industry, UserBranchRole, RolePermission
// } = require("../app/models");
// const { PERMISSION_ACTIONS, PERMISSION_MODULES, ROLE } = require("../app/constants/constant");

// exports.seedAdmin = async () => {
//   await sequelize.transaction(async (t) => {
//     // 1) Permissions (cartesian)
//     for (const m of Object.values(PERMISSION_MODULES)) {
//       for (const a of Object.values(PERMISSION_ACTIONS)) {
//         await Permission.findOrCreate({
//           where: { module: m, action: a },
//           defaults: { module: m, action: a },
//           transaction: t,
//         });
//       }
//     }

//     // 2) Industries
//     const INDUSTRY_LIST = [
//       "Information Technology","Manufacturing","Retail","Healthcare","Finance",
//       "Logistics","Education","Real Estate","Energy","Hospitality",
//     ];
//     for (const name of INDUSTRY_LIST) {
//       await Industry.findOrCreate({
//         where: { name },
//         defaults: { name },
//         transaction: t,
//       });
//     }

//     // 3) Users
//     const [admin] = await User.findOrCreate({
//       where: { email: "test@yopmail.com" },
//       defaults: {
//         user_name: "sysadmin",
//         first_name: "System",
//         last_name: "Admin",
//         email: "test@yopmail.com",
//         mobile_number: "9999999999",
//         gender: "Other",
//         password: await bcrypt.hash("123456", 10),
//         is_admin: true,
//         is_email_verify: true,
//       },
//       transaction: t,
//     });

//     await User.findOrCreate({
//       where: { email: "test2@yopmail.com" },
//       defaults: {
//         user_name: "Manager",
//         first_name: "System",
//         last_name: "Manager",
//         email: "test2@yopmail.com",
//         mobile_number: "9999991999",
//         gender: "Male",
//         password: await bcrypt.hash("123456", 10),
//         is_admin: false,
//         is_email_verify: true,
//       },
//       transaction: t,
//     });

//     // 4) Business + Branch + Role
//     const [manufacturing] = await Industry.findOrCreate({
//       where: { name: "Manufacturing" },
//       defaults: { name: "Manufacturing" },
//       transaction: t,
//     });

//     const [biz] = await Business.findOrCreate({
//       where: { name: "Acme Corp" },
//       defaults: {
//         name: "Acme Corp",
//         industry_id: manufacturing.id,
//         contact_number: "1112223333",
//         created_by: admin.id,
//         updated_by: admin.id,
//       },
//       transaction: t,
//     });

//     const [hq] = await Branch.findOrCreate({
//       where: { business_id: biz.id, name: "HQ" },
//       defaults: {
//         business_id: biz.id,
//         type: "OFFICE",
//         name: "HQ",
//         address_1: "123 Street",
//         city: "Mumbai",
//         state: "MH",
//         country: "IN",
//         pincode: "400001",
//         created_by: admin.id,
//         updated_by: admin.id,
//       },
//       transaction: t,
//     });

//     const [superAdminRole] = await Role.findOrCreate({
//       where: { name: ROLE.SUPER_ADMIN, branch_id: hq.id },
//       defaults: {
//         name: ROLE.SUPER_ADMIN,
//         description: "Super Admin role",
//         branch_id: hq.id,
//         created_by: admin.id,
//         updated_by: admin.id,
//       },
//       transaction: t,
//     });

//     // 5) Link admin ↔ HQ ↔ Super Admin (UserBranchRole)
//     await UserBranchRole.findOrCreate({
//       where: {
//         user_id: admin.id,
//         branch_id: hq.id,
//         role_id: superAdminRole.id,
//       },
//       defaults: {
//         user_id: admin.id,
//         branch_id: hq.id,
//         role_id: superAdminRole.id,
//         is_primary: true,
//       },
//       transaction: t,
//     });

//     // 6) (Optional) Grant ALL permissions to Super Admin role
//     if (RolePermission) {
//       const perms = await Permission.findAll({ attributes: ["id"], transaction: t });
//       for (const p of perms) {
//         await RolePermission.findOrCreate({
//           where: { role_id: superAdminRole.id, permission_id: p.id },
//           defaults: { role_id: superAdminRole.id, permission_id: p.id },
//           transaction: t,
//         });
//       }
//     }
//   });

//   console.log("✅ Seed complete");
// };

// seeders/seeds.js
// seeders/seeds.js
// seeds/seed.all.js


const sequelize = require("../app/config"); // Sequelize instance
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const {
  User,
  Permission,
  Business,
  Branch,
  Role,
  Industry,
  UserBranchRole,
  RolePermission,
  LeadSource,
  LeadStage,
  Lead,
  TaskStage,
  Task,
  Reminder,
  CallResponseStage,
  Call, // 🔑 Call model imported
  LeadType,
  Products,
  CustomerType,
  ProductCategory, // 🔑 ProductCategory imported
  LeadActivityLog, // 🔑 LeadActivityLog imported
} = require("../app/models");

const { PERMISSION_MODULES,PERMISSION_ACTIONS, ROLE } = require("../app/constants/constant");

// ------------------------------------
// Config
// ------------------------------------
const ALLOWED_ACTIONS = ["create", "update", "delete", "view","access"];
const SALES_MODULES = ["Leads", "Opportunities", "Contacts", "Quotations", "Tasks"]; // tweak as needed

function getAllModules() {
  return Array.isArray(PERMISSION_MODULES)
    ? PERMISSION_MODULES
    : Object.values(PERMISSION_MODULES || {});
}

// ------------------------------------
// Helpers
// ------------------------------------

// Seed full permission grid (module × action)
async function seedGlobalPermissions(t) {
  const modules = getAllModules();
  for (const m of modules) {
    for (const a of ALLOWED_ACTIONS) {
      await Permission.findOrCreate({
        where: { module: m, action: a },
        defaults: { module: m, action: a },
        transaction: t,
      });
    }
  }
}

// Ensure a Business and two Branches
async function ensureBusinessWithBranches({ name, industryId, creatorId, t }) {
  const [biz] = await Business.findOrCreate({
    where: { name },
    defaults: {
      name,
      industry_id: industryId,
      contact_number: "0000000000",
      created_by: creatorId || null,
      updated_by: creatorId || null,
    },
    transaction: t,
  });

  const [hq] = await Branch.findOrCreate({
    where: { business_id: biz.id, name: "HQ" },
    defaults: {
      business_id: biz.id,
      type: "OFFICE",
      name: "HQ",
      address_1: "Address HQ",
      city: "Mumbai",
      state: "MH",
      country: "IN",
      pincode: "400001",
      created_by: creatorId || null,
      updated_by: creatorId || null,
    },
    transaction: t,
  });

  const [west] = await Branch.findOrCreate({
    where: { business_id: biz.id, name: "West" },
    defaults: {
      business_id: biz.id,
      type: "OFFICE",
      name: "West",
      address_1: "Address West",
      city: "Pune",
      state: "MH",
      country: "IN",
      pincode: "411001",
      created_by: creatorId || null,
      updated_by: creatorId || null,
    },
    transaction: t,
  });

  return { biz, hq, west };
}

// Create role only (no permissions)
async function ensureRoleOnly({ branchId, name, description, t }) {
  const [role] = await Role.findOrCreate({
    where: { branch_id: branchId, name },
    defaults: {
      branch_id: branchId,
      name,
      description: description || null,
      created_by: 1,
      updated_by: 1,
    },
    transaction: t,
  });
  return role;
}

// Return explicit arrays of permission IDs by strategy
async function buildPermissionIdArrays(t) {
  const ALL_MODULES = getAllModules();

  const allPerms = await Permission.findAll({
    attributes: ["id", "module", "action"],
    transaction: t,
  });

  const allIds = allPerms.map(p => p.id);

  const managerIds = allPerms
    .filter(p => ALL_MODULES.includes(p.module) && ["access","create", "update", "view"].includes(p.action))
    .map(p => p.id);

  const salesIds = allPerms
    .filter(p => SALES_MODULES.includes(p.module) && ["access","create", "update", "view"].includes(p.action))
    .map(p => p.id);
  // NEW LOGIC FOR SALES PERMISSIONS
  const businessModule = "Business";
  const salesPermissions = await Permission.findAll({
    where: {
      module: { [Op.not]: businessModule },
      action: { [Op.in]: ["access", "create", "update", "view"] }
    },
    attributes: ["id"],
    transaction: t,
  });
  const salesPermissionIds = salesPermissions.map(p => p.id);
  // NEW LOGIC FOR SALES PERMISSIONS

  const viewerIds = allPerms
    .filter(p => ALL_MODULES.includes(p.module) && p.action === "view")
    .map(p => p.id);

  return {
    superadmin: [...new Set(allIds)],
    manager: [...new Set(managerIds)],
    sales: [...new Set(salesPermissionIds)], // Use the newly filtered sales permissions
    viewer: [...new Set(viewerIds)],
  };
}

// Overwrite exactly to the provided permission_ids (same semantics as your /set-ids)
async function setRolePermissionExact(role_id, permission_ids, t) {
  if (!role_id || !Array.isArray(permission_ids) || !permission_ids.length) {
    throw new Error("role_id and non-empty permission_ids[] are required");
  }

  // Validate all permission IDs exist
  // console.log(permission_ids);
  const perms = await Permission.findAll({
    where: { id: { [Op.in]: permission_ids } },
    attributes: ["id"],
    transaction: t,
  });
  if (perms.length !== permission_ids.length) {
    throw new Error("One or more permission_ids are invalid");
  }

  // Diff current vs desired
  const current = await RolePermission.findAll({
    where: { role_id },
    attributes: ["permission_id"],
    transaction: t,
  });
  const currentIds = new Set(current.map(rp => rp.permission_id));
  const desiredIds = new Set(permission_ids);

  const toAdd = [...desiredIds].filter(id => !currentIds.has(id));
  const toRemove = [...currentIds].filter(id => !desiredIds.has(id));

  if (toAdd.length) {
    // console.log(toAdd)
    await RolePermission.bulkCreate(
      toAdd.map(id => ({ role_id, permission_id: id })), {
      validate: true,
      ignoreDuplicates: true,
      transaction: t
    }
    );
  }
  if (toRemove.length) {
    await RolePermission.destroy({
      where: { role_id, permission_id: { [Op.in]: toRemove } },
      transaction: t,
    });
  }
}

// Link user to role in a branch
async function assignUserToBranchRole({ userId, branchId, roleId, isPrimary = false, t }) {
  await UserBranchRole.findOrCreate({
    where: { user_id: userId, branch_id: branchId, role_id: roleId },
    defaults: { user_id: userId, branch_id: branchId, role_id: roleId },
    transaction: t,
  });
}

// ------------------------------------
// Main seed
// ------------------------------------
exports.seedAdmin = async () => {
  await sequelize.transaction(async (t) => {
    // (A) Global permissions
    await seedGlobalPermissions(t);

    // (B) Industries
    const INDUSTRY_LIST = [
      "Information Technology", "Manufacturing", "Retail", "Healthcare", "Finance",
      "Logistics", "Education", "Real Estate", "Energy", "Hospitality",
    ];
    for (const name of INDUSTRY_LIST) {
      await Industry.findOrCreate({
        where: {
          name
        },
        defaults: {
          name
        },
        transaction: t
      });
    }
    const [it] = await Industry.findOrCreate({
      where: {
        name: "Information Technology"
      },
      transaction: t
    });
    const [mfg] = await Industry.findOrCreate({
      where: {
        name: "Manufacturing"
      },
      transaction: t
    });

    // (C) Users
    const [admin] = await User.findOrCreate({
      where: {
        email: "test@yopmail.com"
      },
      defaults: {
        user_name: "sysadmin",
        first_name: "System",
        last_name: "Admin",
        email: "test@yopmail.com",
        mobile_number: "9999999919",
        gender: "Other",
        password: await bcrypt.hash("123456", 10),
        is_admin: true,
        is_email_verify: true,
        is_active: true,
      },
      transaction: t,
    });

    const [manager] = await User.findOrCreate({
      where: {
        email: "manager@yopmail.com"
      },
      defaults: {
        user_name: "manager1",
        first_name: "Maya",
        last_name: "Manager",
        email: "manager@yopmail.com",
        mobile_number: "9999991994",
        gender: "Female",
        password: await bcrypt.hash("123456", 10),
        is_admin: false,
        is_email_verify: true,
      },
      transaction: t,
    });

    // UNCOMMENTED AND UPDATED SALES USERS
    const [salesA] = await User.findOrCreate({
      where: { email: "sales.a@yopmail.com" },
      defaults: {
        user_name: "salesA", first_name: "Sam", last_name: "Sales",
        email: "sales.a@yopmail.com", mobile_number: "9999911112", gender: "Male",
        password: await bcrypt.hash("123456", 10), is_admin: false, is_email_verify: true,is_active: true,
      },
      transaction: t,
    });

    const [salesB] = await User.findOrCreate({
      where: { email: "sales.b@yopmail.com" },
      defaults: {
        user_name: "salesB", first_name: "Sara", last_name: "Seller",
        email: "sales.b@yopmail.com", mobile_number: "9999922222", gender: "Female",
        password: await bcrypt.hash("123456", 10), is_admin: false, is_email_verify: true,
      },
      transaction: t,
    });

    const [viewer] = await User.findOrCreate({
      where: { email: "viewer@yopmail.com" },
      defaults: {
        user_name: "viewer1", first_name: "Vik", last_name: "Viewer",
        email: "viewer@yopmail.com", mobile_number: "9999933323", gender: "Male",
        password: await bcrypt.hash("123456", 10), is_admin: false, is_email_verify: true,
      },
      transaction: t,
    });

    // (D) Businesses + branches
    const acme = await ensureBusinessWithBranches({
      name: "Arcelo Nutri Food",
      industryId: mfg.id,
      creatorId: admin.id,
      t
    });
    const globex = await ensureBusinessWithBranches({
      name: "Peragine pvc Pvt. Ltd",
      industryId: it.id,
      creatorId: admin.id,
      t
    });
    const initech = await ensureBusinessWithBranches({ name: "Initech",   industryId: it.id,  creatorId: admin.id, t });

    // (E) Roles (create only; no permissions yet)
    const branches = [acme.hq, acme.west, globex.hq, globex.west, initech.hq, initech.west];
    const rolesByBranch = new Map();

    async function ensureRole(branch, roleName, desc) {
      const role = await ensureRoleOnly({
        branchId: branch.id,
        name: roleName,
        description: desc || `${roleName} of ${branch.name}`,
        t,
      });
      rolesByBranch.set(`${branch.id}:${roleName}`, role);
      return role;
    }

    for (const br of branches) {
      // console.log(br.name)
      await ensureRole(br, ROLE.SUPER_ADMIN);
      await ensureRole(br, "Manager");
      // UNCOMMENTED SALES ROLE
      await ensureRole(br, "Sales");
      // UNCOMMENTED VIEWER ROLE
      await ensureRole(br, "Viewer");
    }

    // (F) Build explicit permission arrays by strategy
    const arrays = await buildPermissionIdArrays(t);
    // arrays.superadmin / arrays.manager / arrays.sales / arrays.viewer are all explicit ID arrays

    // (G) Assign Role→Permission EXACTLY to those arrays (dummy data via arrays)
    for (const br of branches) {

      const superAdminRole = rolesByBranch.get(`${br.id}:${ROLE.SUPER_ADMIN}`);
      const managerRole = rolesByBranch.get(`${br.id}:Manager`);
      // UNCOMMENTED SALES ROLE
      const salesRole = rolesByBranch.get(`${br.id}:Sales`);
      // UNCOMMENTED VIEWER ROLE
      const viewerRole = rolesByBranch.get(`${br.id}:Viewer`);

      await setRolePermissionExact(superAdminRole.id, arrays.superadmin, t);
      await setRolePermissionExact(managerRole.id, arrays.manager, t);
      // UNCOMMENTED SALES PERMISSION ASSIGNMENT
      await setRolePermissionExact(salesRole.id, arrays.sales, t);
      // UNCOMMENTED VIEWER PERMISSION ASSIGNMENT
      await setRolePermissionExact(viewerRole.id, arrays.viewer, t);
    }

    // (H) Memberships
    for (const br of [acme.hq, globex.hq,acme.west,globex.west]) {
      // console.log(br)
      const r = rolesByBranch.get(`${br.id}:${ROLE.SUPER_ADMIN}`);
      await assignUserToBranchRole({
        userId: admin.id,
        branchId: br.id,
        roleId: r.id,
        isPrimary: br.id === acme.hq.id,
        t
      });
    }

    for (const br of [acme.hq, globex.west]) {
      const r = rolesByBranch.get(`${br.id}:Manager`);
      await assignUserToBranchRole({
        userId: manager.id,
        branchId: br.id,
        roleId: r.id,
        isPrimary: br.id === acme.hq.id,
        t
      });
    }

    // UNCOMMENTED SALES AND VIEWER MEMBERSHIPS
    {
      const r = rolesByBranch.get(`${globex.west.id}:Sales`);
      await assignUserToBranchRole({ userId: salesA.id, branchId: globex.west.id, roleId: r.id, isPrimary: true, t });
    }
    {
      const r = rolesByBranch.get(`${initech.hq.id}:Sales`);
      await assignUserToBranchRole({ userId: salesB.id, branchId: initech.hq.id, roleId: r.id, isPrimary: true, t });
    }
    {
      const r = rolesByBranch.get(`${initech.west.id}:Viewer`);
      await assignUserToBranchRole({ userId: viewer.id, branchId: initech.west.id, roleId: r.id, isPrimary: true, t });
    }

    // (I) Lead Sources & Stages
    const leadSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Social Media",
      "Partnership",
    ];
    for (const name of leadSources) {
      await LeadSource.findOrCreate({ where: { name }, defaults: { name, description: name }, transaction: t });
    }
    
    const leadStages = [
      {
        "color": "#3498DB",
        "name": "New"
      },
      {
        "color": "#1ABC9C",
        "name": "Open"
      },
      {
        "color": "#9B59B6",
        "name": "InProgress"
      },
      {
        "color": "#F39C12",
        "name": "AttemptedToContact"
      },
      {
        "color": "#16A085",
        "name": "OpenDeal"
      },
      {
        "color": "#27AE60",
        "name": "Converted"
      },
      {
        "color": "#7F8C8D",
        "name": "Unqualified"
      },
      {
        "color": "#2ECC71",
        "name": "Connected"
      },
      {
        "color": "#34495E",
        "name": "Closed"
      },
      {
        "color": "#2980B9",
        "name": "Won"
      },
      {
        "color": "#E74C3C",
        "name": "Lost"
      },
      {
        "color": "#D35400",
        "name": "BadTiming"
      },
      {
        "color": "#8E44AD",
        "name": "Reference"
      }
    ];
  
      for (const [i, stage] of leadStages.entries()) {
      
         await LeadStage.findOrCreate({ where: { name:stage.name }, defaults: { name:stage.name, description: stage.name, order: i + 1,color:stage.color }, transaction: t });
      }
    // const leadStages = [
    //   "NEW",
    //   "ASSIGNED",
    //   "CONTACT IN FUTURE",
    //   "IN PROCESS",
    //   "CONVERTED",
    //   "DEAD",
    //   "REFERENCE"
    // ];
    // for (const name of leadStages) {
    //   await LeadStage.findOrCreate({ where: { name }, defaults: { name, description: name }, transaction: t });
    // }
    const leadType= [{
  "name":"Hot",
  "description":"Hot",
  "color":"#3498DB"
},
{
  "name":"Warm",
  "description":"Warm",
  "color":"#1ABC9C"
},
{
  "name":"Cold",
  "description":"Cold",
  "color":"#9B59B6"
}
    ];
    for (const [i, stage] of leadType.entries()) {
      await LeadType.findOrCreate({ where: { name:stage.name }, defaults: { name:stage.name, description: stage.name,color:stage.color }, transaction: t });
    }
    const customerType = [ 'Distributor','Retailer','Channel Partner','Borwell','End User',]

    
    for (const name of customerType) {
      await CustomerType.findOrCreate({ where: { name }, defaults: { name, description: name }, transaction: t });
    }
    const [webSource] = await LeadSource.findOrCreate({ where: { name: "Website" }, transaction: t });
    const [referralSource] = await LeadSource.findOrCreate({ where: { name: "Referral" }, transaction: t });
    const [newStage] = await LeadStage.findOrCreate({ where: { name: "New" }, transaction: t });
    const [inProcessStage] = await LeadStage.findOrCreate({ where: { name: "InProgress" }, transaction: t });
    const [Hot] = await LeadType.findOrCreate({ where: { name: "Hot" }, transaction: t });
    const [Warm] = await LeadType.findOrCreate({ where: { name: "Warm" }, transaction: t });
    const [Distributor] = await CustomerType.findOrCreate({ where: { name: "Distributor" }, transaction: t });
    const [Retailer] = await CustomerType.findOrCreate({ where: { name: "Retailer" }, transaction: t });
    const [PVC] = await CustomerType.findOrCreate({ where: { name: "UPVC PIPE" }, transaction: t });

    // (J) Tasks Stages
    const taskStages = [
      "Not Started",
      "Started",
      "Completed",
      "Deferred",
      "Cancelled"
    ];
    for (const name of taskStages) {
      await TaskStage.findOrCreate({ where: { name }, defaults: { name, description: name }, transaction: t });
    }

    const [notStartedStage] = await TaskStage.findOrCreate({ where: { name: "Not Started" }, transaction: t });
    const [completedStage] = await TaskStage.findOrCreate({ where: { name: "Completed" }, transaction: t });

const [pvcCategory] = await ProductCategory.findOrCreate({
      where: { name: "PVC" },
      defaults: {
        business_id: acme.biz.id,
        description: "PVC pipes and related products",
      },
      transaction: t,
    });

    const [peanutButterCategory] = await ProductCategory.findOrCreate({
      where: { name: "Peanut Butter" },
      defaults: {
        business_id: globex.biz.id,
        description: "Peanut butter and peanut-based products",
      },
      transaction: t,
    });

   

    const [pvcPipeProduct] = await Products.findOrCreate({
      where: { name: "PVC Pipe 4 Inch" },
      defaults: {
        business_id: acme.biz.id,
        category_id: pvcCategory.id,
        price: 12.5,
        description: "4-inch PVC pipe for plumbing",
      },
      transaction: t,
    });

    const [peanutButterProduct] = await Products.findOrCreate({
      where: { name: "Crunchy Peanut Butter" },
      defaults: {
        business_id: globex.biz.id,
        category_id: peanutButterCategory.id,
        price: 8.99,
        description: "Natural crunchy peanut butter jar 500g",
      },
      transaction: t,
    });

    // (K) Leads and Tasks
    const { hq: acmeHq, west: acmeWest } = acme;
    const { hq: globexHq } = globex;
// Create some leads (destructure the returned instance)
const [lead1] = await Lead.findOrCreate({
  where: { lead_name: "John new" },
  defaults: {
    lead_name: "John new",
    lead_stage_id: newStage.id,
    lead_source_id: webSource.id,
    branch_id: acmeHq.id,
    contact_number: ["+919876543210"],
    email: ["john.doe@example.com"],
    lead_type_id: Hot.id,
    customer_type_id:Retailer.id,
    tags: ["high-value", "new-channel"],
    description: "Interested in new software.",
    assigned_user: manager.id,
    business_name: "Acme Software",
    dates: { enquiry: "2025-09-11T10:00:00Z" },
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const [lead2] = await Lead.findOrCreate({
  where: { lead_name: "Jane Smith" },
  defaults: {
    lead_name: "Jane Smith",
    lead_stage_id: inProcessStage.id,
    lead_source_id: referralSource.id,
    branch_id: globexHq.id,
    contact_number: ["+15551234567"],
    email: ["jane.smith@example.com"],
    lead_type_id: Warm.id,
    customer_type_id: Distributor.id,
    tags: ["high-value", "new-channel"],
    description: "Looking for a partnership opportunity.",
    assigned_user: manager.id,
    business_name: "Globex Ventures",
    dates: { enquiry: "2025-09-10T12:00:00Z" },
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const [lead3] = await Lead.findOrCreate({
  where: { lead_name: "Test Lead" },
  defaults: {
    lead_name: "Test Lead",
    lead_stage_id: newStage.id,
    lead_source_id: webSource.id,
    branch_id: acmeWest.id,
    contact_number: ["+15559876543"],
    email: ["test.lead@example.com"],
    lead_type_id:Warm.id,
    customer_type_id: Distributor.id,
    tags: ["high-value", "new-channel"],
    description: "Lead for West branch.",
    assigned_user: admin.id,
    business_name: "Test Biz",
    dates: { enquiry: "2025-09-12T09:00:00Z" },
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

// Create some calls (needed for task/reminder linking)
const [call1] = await Call.findOrCreate({
    where: { subject: "Initial Contact Call" },
    defaults: {
        subject: "Initial Contact Call",
        branch_id: acmeHq.id,
        start_time: "2025-10-01T10:00:00Z",
        call_type: "Log",
        duration: 600,
        lead_id: lead1.id,
        assigned_user: manager.id,
        created_by: admin.id,
        updated_by: admin.id,
    },
    transaction: t,
});

const [call2] = await Call.findOrCreate({
    where: { subject: "Follow-up Strategy Session" },
    defaults: {
        subject: "Follow-up Strategy Session",
        branch_id: acmeHq.id,
        start_time: "2025-10-20T14:00:00Z",
        call_type: "Schedule",
        lead_id: lead1.id,
        assigned_user: salesA.id,
        created_by: admin.id,
        updated_by: admin.id,
    },
    transaction: t,
});

const [call3] = await Call.findOrCreate({
    where: { subject: "Globex Partnership Intro" },
    defaults: {
        subject: "Globex Partnership Intro",
        branch_id: globexHq.id,
        start_time: "2025-10-05T11:30:00Z",
        call_type: "Log",
        duration: 900,
        lead_id: lead2.id,
        assigned_user: manager.id,
        created_by: admin.id,
        updated_by: admin.id,
    },
    transaction: t,
});


// Create some tasks (destructure results)
const [task1] = await Task.findOrCreate({
  where: { task_name: "Call John Doe" },
  defaults: {
    task_name: "Call John Doe",
    task_stage_id: notStartedStage.id,
    branch_id: acmeHq.id,
    priority: "High",
    assigned_user: manager.id,
    lead_id: lead1.id,
    call_id: call2.id, // 🔑 Link task to a scheduled call
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const [task2] = await Task.findOrCreate({
  where: { task_name: "Schedule meeting with Jane Smith" },
  defaults: {
    task_name: "Schedule meeting with Jane Smith",
    task_stage_id: completedStage.id,
    branch_id: globexHq.id,
    priority: "Medium",
    assigned_user: manager.id,
    lead_id: lead2.id,
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const [task3] = await Task.findOrCreate({
  where: { task_name: "Follow up with Test Lead" },
  defaults: {
    task_name: "Follow up with Test Lead",
    task_stage_id: notStartedStage.id,
    branch_id: acmeWest.id,
    priority: "Low",
    assigned_user: null,
    lead_id: lead3.id,
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const callResponseStages = ["Outgoing", "Incoming", "Missed", "No Response"];
for (const name of callResponseStages) {
  await CallResponseStage.findOrCreate({
    where: { name },
    defaults: { name, description: name },
    transaction: t,
  });
}

// (M) Reminders
const [task1Reminder] = await Reminder.findOrCreate({
  where: { task_id: task1.id },
  defaults: {
    reminder_name: "Follow-up Call Reminder",
    reminder_date: "2025-09-13",
    reminder_time: "10:00:00",
    reminder_unit: "minute",
    reminder_value: 30,
    branch_id: acmeHq.id,
    lead_id: lead1.id,
    task_id: task1.id,
    call_id: call2.id, // 🔑 Link reminder to the same call
    assigned_user: manager.id,
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});

const [lead2Reminder] = await Reminder.findOrCreate({
  where: { lead_id: lead2.id },
  defaults: {
    reminder_name: "Partnership Discussion Reminder",
    reminder_date: "2025-09-14",
    reminder_time: "14:30:00",
    reminder_unit: "hour",
    reminder_value: 2,
    branch_id: globexHq.id,
    lead_id: lead2.id,
    task_id: null,
    assigned_user: manager.id,
    created_by: admin.id,
    updated_by: admin.id,
  },
  transaction: t,
});
// ⬅️ START NEW LOGIC BLOCK HERE

    // Helper to log summary as JSON array string
    // NOTE: This helper should be defined before use in the seeder file.
    const jsonSummary = (messages) => JSON.stringify(Array.isArray(messages) ? messages : [messages]);

    // Ensure Product Categories and Products are created before logging
    // Find business instances from section (D)
    const acmeBizId = acme.biz.id;
    
    const [pipeCat] = await ProductCategory.findOrCreate({
        where: { name: "Piping Solutions", business_id: acmeBizId },
        defaults: { name: "Piping Solutions", business_id: acmeBizId, description: "PVC and metal pipe solutions" },
        transaction: t
    });
    const [valveCat] = await ProductCategory.findOrCreate({
        where: { name: "Fittings & Valves", business_id: acmeBizId },
        defaults: { name: "Fittings & Valves", business_id: acmeBizId, description: "Elbows, reducers, and ball valves" },
        transaction: t
    });
    
    const [pvcPipe] = await Products.findOrCreate({
        where: { name: "Standard PVC Pipe (10ft)", business_id: acmeBizId },
        defaults: {
            name: "Standard PVC Pipe (10ft)",
            business_id: acmeBizId,
            category_id: pipeCat.id,
            price: 125.50,
            description: "10-foot schedule 40 PVC pipe."
        },
        transaction: t
    });
    const [ballValve] = await Products.findOrCreate({
        where: { name: "Brass Ball Valve (1 inch)", business_id: acmeBizId },
        defaults: {
            name: "Brass Ball Valve (1 inch)",
            business_id: acmeBizId,
            category_id: valveCat.id,
            price: 350.00,
            description: "High-pressure rated 1-inch brass valve."
        },
        transaction: t
    });

    // (P) Lead Activity Logs
    
    // Log 1: Creation (Since the lead was created earlier, we log a mock creation event)
    await LeadActivityLog.findOrCreate({
        where: { lead_id: lead1.id, field_name: 'Creation' },
        defaults: {
            lead_id: lead1.id,
            user_id: admin.id,
            branch_id: acmeHq.id,
            field_name: 'Creation',
            summary: jsonSummary([`Lead **${lead1.lead_name}** created`]), // Array wrapper added for consistency
        },
        transaction: t
    });

    // Log 2: Update - Single Field Change (e.g., Stage Change)
    await LeadActivityLog.findOrCreate({
        where: { lead_id: lead1.id, field_name: 'Lead Stage Updated' },
        defaults: {
            lead_id: lead1.id,
            user_id: manager.id,
            branch_id: acmeHq.id,
            field_name: 'Lead Stage Updated',
            // 🔑 CORRECTED: Using .name property of LeadStage model
            summary: jsonSummary([`Updated **lead stage id** from *${newStage.name}* to *${inProcessStage.name}*`]),
        },
        transaction: t
    });
    
    // Log 3: Update - Multiple Fields Change (e.g., Assigned User and Product ID change)
    const managerFullName = `${manager.first_name} ${manager.last_name}`;
    const salesAFullName = `${salesA.first_name} ${salesA.last_name}`;

    const summaryArray = [
        // 🔑 CORRECTED: Using full names for User objects
        `Updated **assigned user** from *${managerFullName}* to *${salesAFullName}*`,
        // 🔑 CORRECTED: Using full name for Product object
        `Added **product id** as *${pvcPipe.name}*`
    ];

    await LeadActivityLog.findOrCreate({
        where: { lead_id: lead1.id, field_name: 'Multiple Fields Updated' },
        defaults: {
            lead_id: lead1.id,
            user_id: admin.id,
            branch_id: acmeHq.id,
            field_name: 'Multiple Fields Updated',
            summary: jsonSummary(summaryArray),
        },
        transaction: t
    });

// ⬅️ END NEW LOGIC BLOCK HERE
}); // Closes the sequelize.transaction(async (t) => {

console.log(
"✅ Seed complete: industries, users, businesses, branches, global permissions, roles, explicit Role→Permission arrays, memberships, lead sources, lead stages, leads, tasks, product categories, and products"
);
};

// If you’re using sequelize-cli, you can also export as up():
module.exports.up = exports.seedAdmin;