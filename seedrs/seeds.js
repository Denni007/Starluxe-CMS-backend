// const bcrypt = require("bcrypt");
// const {User, Permission, Business, Branch ,Role, Industry} = require("../app/models/index.js")
// const {PERMISSION_ACTIONS,PERMISSION_MODULES, ROLE} = require("../app/constants/constant.js")

// // import { User, Permission, Industry, Business, Branch ,Role} from "../models/index.js";
// // import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../constants/constant.js";

// // helper delay function
// // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//  exports.seedAdmin = async () => {
//     try {
//         for (const m of Object.values(PERMISSION_MODULES)) {
//             for (const a of Object.values(PERMISSION_ACTIONS)) {
//               await Permission.findOrCreate({
//                 where: { module: m, action: a },
//                 defaults: { module: m, action: a },
//               });
//             }
//           }
//           console.log("✅ Permissions seeded");
          
//           const INDUSTRY_LIST = [
//             "Information Technology",
//             "Manufacturing",
//             "Retail",
//             "Healthcare",
//             "Finance",
//             "Logistics",
//             "Education",
//             "Real Estate",
//             "Energy",
//             "Hospitality",
//           ];
        
//           const email = "test@yopmail.com";
//           const exists = await User.findOne({ where: { email } });
        
//           if (!exists) {
//             await User.create({
//               user_name: "sysadmin",
//               first_name: "System",
//               last_name: "Admin",
//               email: "test@yopmail.com",
//               mobile_number: "9999999999",
//               gender: "Other",
//               password: await bcrypt.hash("123456", 10),
//               is_admin: true,
//               is_email_verify: true,
//             });
//             // await sleep(3000); // wait 3s before next insertion
//             await User.create({
//               user_name: "Manager",
//               first_name: "System",
//               last_name: "Manager",
//               email: "test2@yopmail.com",
//               mobile_number: "9999991999",
//               gender: "Male",
//               password: await bcrypt.hash("123456", 10),
//               is_admin: false,
//               is_email_verify: true,
//             });
//             console.log("done");
//             // await sleep(3000); // wait 3s before next insertion
//           }
        
//           for (const name of INDUSTRY_LIST) {
//             await Industry.findOrCreate({
//               where: { name },
//               defaults: { name },
//             });
//             // await sleep(3000); // wait 3s before next industry
//           }
        
//           const user = 1;
//           const found = await User.findOne({ where: { id: user } });
        
//           if (found) {
//             await Business.create({
//               name: "Acme Corp",
//               industry_id: 1,
//               contact_number: "1112223333",
//               created_by: found.id,
//               updated_by: found.id,
//             }); 
//             // await sleep(3000);
        
//             await Branch.create({
//               type: "OFFICE",
//               name: "HQ",
//               address_1: "123 Street",
//               city: "Mumbai",
//               state: "MH",
//               country: "IN",
//               pincode: "400001",
//               business_id: 1,
//               created_by: 1,
//               updated_by: 1,
//             }); 
//             // await sleep(3000);
//             await Role.create({
//                 name: ROLE.SUPER_ADMIN,
//                 description: "Super Admin role",
//                 branch_id: 1,
//                 permissions: [1, 2, 3],
//                 created_by: 1,
//                 updated_by: 1,
//               }
//             ); 
//             console.log("created")
//           }
        
//     } catch (error) {
//         console.log(error)
//     }
   
//       // seed super admin
   
   
//  }
//   // ensure all Permission rows exist (cartesian of modules x actions)
  
// // module.exports = seedAdmin;
// seeders/seeds.js
const sequelize = require("../app/config");
const bcrypt = require("bcrypt");
const {
  User, Permission, Business, Branch, Role, Industry, UserBranchRole, RolePermission
} = require("../app/models");
const { PERMISSION_ACTIONS, PERMISSION_MODULES, ROLE } = require("../app/constants/constant");

exports.seedAdmin = async () => {
  await sequelize.transaction(async (t) => {
    // 1) Permissions (cartesian)
    for (const m of Object.values(PERMISSION_MODULES)) {
      for (const a of Object.values(PERMISSION_ACTIONS)) {
        await Permission.findOrCreate({
          where: { module: m, action: a },
          defaults: { module: m, action: a },
          transaction: t,
        });
      }
    }

    // 2) Industries
    const INDUSTRY_LIST = [
      "Information Technology","Manufacturing","Retail","Healthcare","Finance",
      "Logistics","Education","Real Estate","Energy","Hospitality",
    ];
    for (const name of INDUSTRY_LIST) {
      await Industry.findOrCreate({
        where: { name },
        defaults: { name },
        transaction: t,
      });
    }

    // 3) Users
    const [admin] = await User.findOrCreate({
      where: { email: "test@yopmail.com" },
      defaults: {
        user_name: "sysadmin",
        first_name: "System",
        last_name: "Admin",
        email: "test@yopmail.com",
        mobile_number: "9999999999",
        gender: "Other",
        password: await bcrypt.hash("123456", 10),
        is_admin: true,
        is_email_verify: true,
      },
      transaction: t,
    });

    await User.findOrCreate({
      where: { email: "test2@yopmail.com" },
      defaults: {
        user_name: "Manager",
        first_name: "System",
        last_name: "Manager",
        email: "test2@yopmail.com",
        mobile_number: "9999991999",
        gender: "Male",
        password: await bcrypt.hash("123456", 10),
        is_admin: false,
        is_email_verify: true,
      },
      transaction: t,
    });

    // 4) Business + Branch + Role
    const [manufacturing] = await Industry.findOrCreate({
      where: { name: "Manufacturing" },
      defaults: { name: "Manufacturing" },
      transaction: t,
    });

    const [biz] = await Business.findOrCreate({
      where: { name: "Acme Corp" },
      defaults: {
        name: "Acme Corp",
        industry_id: manufacturing.id,
        contact_number: "1112223333",
        created_by: admin.id,
        updated_by: admin.id,
      },
      transaction: t,
    });

    const [hq] = await Branch.findOrCreate({
      where: { business_id: biz.id, name: "HQ" },
      defaults: {
        business_id: biz.id,
        type: "OFFICE",
        name: "HQ",
        address_1: "123 Street",
        city: "Mumbai",
        state: "MH",
        country: "IN",
        pincode: "400001",
        created_by: admin.id,
        updated_by: admin.id,
      },
      transaction: t,
    });

    const [superAdminRole] = await Role.findOrCreate({
      where: { name: ROLE.SUPER_ADMIN, branch_id: hq.id },
      defaults: {
        name: ROLE.SUPER_ADMIN,
        description: "Super Admin role",
        branch_id: hq.id,
        created_by: admin.id,
        updated_by: admin.id,
      },
      transaction: t,
    });

    // 5) Link admin ↔ HQ ↔ Super Admin (UserBranchRole)
    await UserBranchRole.findOrCreate({
      where: {
        user_id: admin.id,
        branch_id: hq.id,
        role_id: superAdminRole.id,
      },
      defaults: {
        user_id: admin.id,
        branch_id: hq.id,
        role_id: superAdminRole.id,
        is_primary: true,
      },
      transaction: t,
    });

    // 6) (Optional) Grant ALL permissions to Super Admin role
    if (RolePermission) {
      const perms = await Permission.findAll({ attributes: ["id"], transaction: t });
      for (const p of perms) {
        await RolePermission.findOrCreate({
          where: { role_id: superAdminRole.id, permission_id: p.id },
          defaults: { role_id: superAdminRole.id, permission_id: p.id },
          transaction: t,
        });
      }
    }
  });

  console.log("✅ Seed complete");
};