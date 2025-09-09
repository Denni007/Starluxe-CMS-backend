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
const sequelize = require("../app/config");
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
} = require("../app/models");

const {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE,
} = require("../app/constants/constant");

// ---------- helpers --------------------------------------------------------

async function ensureRoleWithPerms({ branchId, name, description, strategy, t }) {
  // 1) Ensure role exists on this branch
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

  // 2) Decide which permissions to grant
  const ALL_MODULES = Object.values(PERMISSION_MODULES);
  const SALES_MODULES = [
    PERMISSION_MODULES.Leads,
    PERMISSION_MODULES.Opportunities,
    PERMISSION_MODULES.Contacts,
    PERMISSION_MODULES.Quotations,
    PERMISSION_MODULES.Tasks,
  ];

  let modules = ALL_MODULES;
  let actions = Object.values(PERMISSION_ACTIONS);

  switch (strategy) {
    case "superadmin":
      modules = ALL_MODULES;
      actions = Object.values(PERMISSION_ACTIONS); // all
      break;
    case "manager":
      modules = ALL_MODULES;
      actions = [
        PERMISSION_ACTIONS.create,
        PERMISSION_ACTIONS.update,
        PERMISSION_ACTIONS.view,
      ]; // no delete
      break;
    case "sales":
      modules = SALES_MODULES;
      actions = [
        PERMISSION_ACTIONS.create,
        PERMISSION_ACTIONS.update,
        PERMISSION_ACTIONS.view,
      ];
      break;
    case "viewer":
      modules = ALL_MODULES;
      actions = [PERMISSION_ACTIONS.view];
      break;
    default:
      modules = ALL_MODULES;
      actions = [PERMISSION_ACTIONS.view];
  }

  // 3) Fetch matching permissions
  const perms = await Permission.findAll({
    where: {
      module: { [Op.in]: modules },
      action: { [Op.in]: actions },
    },
    attributes: ["id"],
    transaction: t,
  });

  // 4) Map role -> permissions (idempotent)
  for (const p of perms) {
    await RolePermission.findOrCreate({
      where: { role_id: role.id, permission_id: p.id },
      defaults: { role_id: role.id, permission_id: p.id },
      transaction: t,
    });
  }

  return role;
}

async function assignUserToBranchRole({ userId, branchId, roleId, isPrimary = false, t }) {
  await UserBranchRole.findOrCreate({
    where: { user_id: userId, branch_id: branchId, role_id: roleId },
    defaults: { user_id: userId, branch_id: branchId, role_id: roleId, is_primary: isPrimary },
    transaction: t,
  });
}

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

// ---------- main seed ------------------------------------------------------

exports.seedAdmin = async () => {
  await sequelize.transaction(async (t) => {
    // (A) seed full permission grid
    for (const m of Object.values(PERMISSION_MODULES)) {
      for (const a of Object.values(PERMISSION_ACTIONS)) {
        await Permission.findOrCreate({
          where: { module: m, action: a },
          defaults: { module: m, action: a },
          transaction: t,
        });
      }
    }

    // (B) industries
    const INDUSTRY_LIST = [
      "Information Technology",
      "Manufacturing",
      "Retail",
      "Healthcare",
      "Finance",
      "Logistics",
      "Education",
      "Real Estate",
      "Energy",
      "Hospitality",
    ];
    for (const name of INDUSTRY_LIST) {
      await Industry.findOrCreate({
        where: { name },
        defaults: { name },
        transaction: t,
      });
    }

    const [it] = await Industry.findOrCreate({
      where: { name: "Information Technology" },
      defaults: { name: "Information Technology" },
      transaction: t,
    });
    const [mfg] = await Industry.findOrCreate({
      where: { name: "Manufacturing" },
      defaults: { name: "Manufacturing" },
      transaction: t,
    });

    // (C) users (5 total)
    const [admin] = await User.findOrCreate({
      where: { email: "test@yopmail.com" },
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
      },
      transaction: t,
    });

    const [manager] = await User.findOrCreate({
      where: { email: "manager@yopmail.com" },
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

    const [salesA] = await User.findOrCreate({
      where: { email: "sales.a@yopmail.com" },
      defaults: {
        user_name: "salesA",
        first_name: "Sam",
        last_name: "Sales",
        email: "sales.a@yopmail.com",
        mobile_number: "9999911112",
        gender: "Male",
        password: await bcrypt.hash("123456", 10),
        is_admin: false,
        is_email_verify: true,
      },
      transaction: t,
    });

    const [salesB] = await User.findOrCreate({
      where: { email: "sales.b@yopmail.com" },
      defaults: {
        user_name: "salesB",
        first_name: "Sara",
        last_name: "Seller",
        email: "sales.b@yopmail.com",
        mobile_number: "9999922222",
        gender: "Female",
        password: await bcrypt.hash("123456", 10),
        is_admin: false,
        is_email_verify: true,
      },
      transaction: t,
    });

    const [viewer] = await User.findOrCreate({
      where: { email: "viewer@yopmail.com" },
      defaults: {
        user_name: "viewer1",
        first_name: "Vik",
        last_name: "Viewer",
        email: "viewer@yopmail.com",
        mobile_number: "9999933323",
        gender: "Male",
        password: await bcrypt.hash("123456", 10),
        is_admin: false,
        is_email_verify: true,
      },
      transaction: t,
    });

    // (D) businesses + branches (Acme, Globex, Initech)
    const acme = await ensureBusinessWithBranches({
      name: "Acme Corp",
      industryId: mfg.id,
      creatorId: admin.id,
      t,
    });

    const globex = await ensureBusinessWithBranches({
      name: "Globex Ltd",
      industryId: it.id,
      creatorId: admin.id,
      t,
    });

    const initech = await ensureBusinessWithBranches({
      name: "Initech",
      industryId: it.id,
      creatorId: admin.id,
      t,
    });

    // (E) roles + permissions per branch
    const branchSets = [acme.hq, acme.west, globex.hq, globex.west, initech.hq, initech.west];

    const roleCache = {}; // key: `${branchId}:${roleName}` => role
    async function ensureRole(branch, roleName, strategy) {
      const key = `${branch.id}:${roleName}`;
      if (!roleCache[key]) {
        roleCache[key] = await ensureRoleWithPerms({
          branchId: branch.id,
          name: roleName,
          description: `${roleName} of ${branch.name}`,
          strategy,
          t,
        });
      }
      return roleCache[key];
    }

    for (const br of branchSets) {
      await ensureRole(br, ROLE.SUPER_ADMIN, "superadmin");
      await ensureRole(br, "Manager", "manager");
      await ensureRole(br, "Sales", "sales");
      await ensureRole(br, "Viewer", "viewer");
    }

    // (F) memberships (UserBranchRole)
    // sysadmin = Super Admin on all HQ branches
    for (const br of [acme.hq, globex.hq, initech.hq]) {
      const r = await ensureRole(br, ROLE.SUPER_ADMIN, "superadmin");
      await assignUserToBranchRole({ userId: admin.id, branchId: br.id, roleId: r.id, isPrimary: br.id === acme.hq.id, t });
    }

    // manager = Manager on Acme HQ and Globex HQ
    for (const br of [acme.hq, globex.hq]) {
      const r = await ensureRole(br, "Manager", "manager");
      await assignUserToBranchRole({ userId: manager.id, branchId: br.id, roleId: r.id, isPrimary: br.id === acme.hq.id, t });
    }

    // salesA = Sales on Globex West
    {
      const r = await ensureRole(globex.west, "Sales", "sales");
      await assignUserToBranchRole({ userId: salesA.id, branchId: globex.west.id, roleId: r.id, isPrimary: true, t });
    }

    // salesB = Sales on Initech HQ
    {
      const r = await ensureRole(initech.hq, "Sales", "sales");
      await assignUserToBranchRole({ userId: salesB.id, branchId: initech.hq.id, roleId: r.id, isPrimary: true, t });
    }

    // viewer = Viewer on Initech West
    {
      const r = await ensureRole(initech.west, "Viewer", "viewer");
      await assignUserToBranchRole({ userId: viewer.id, branchId: initech.west.id, roleId: r.id, isPrimary: true, t });
    }
  });

  console.log("✅ Seed complete: users, businesses, branches, roles & permissions");
};
