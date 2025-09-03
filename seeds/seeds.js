import bcrypt from "bcrypt";
import { User, Permission, Industry, Business, Branch } from "../models/index.js";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../constants/permissions.js";

// helper delay function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function seedAdmin() {
  for (const m of PERMISSION_MODULES) {
    for (const a of PERMISSION_ACTIONS) {
      const found = await Permission.findOne({ where: { module: m, action: a } });

      if (!found) {
        await Permission.create({ module: m, action: a });
        // await sleep(3000); // wait 3s between permission inserts
      }
      console.log("done")
    }
  }
  // seed super admin
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

  const email = "admin@system.local";
  const exists = await User.findOne({ where: { email } });

  if (!exists) {
    await User.create({
      user_name: "sysadmin",
      first_name: "System",
      last_name: "Admin",
      email: "test@gyopmail.com",
      mobile_number: "9999999999",
      gender: "Other",
      password: await bcrypt.hash("123456", 10),
      is_admin: true,
      is_email_verify: true,
    });
    await sleep(3000); // wait 3s before next insertion
  }

  for (const name of INDUSTRY_LIST) {
    await Industry.findOrCreate({
      where: { name },
      defaults: { name },
    });
    // await sleep(3000); // wait 3s before next industry
  }

  const user = 1;
  const found = await User.findOne({ where: { id: user } });

  if (found) {
    await Business.create({
      name: "Acme Corp",
      industry_id: 1,
      contact_number: "1112223333",
      created_by: found.id,
      updated_by: found.id,
    });
    await sleep(3000);

    await Branch.create({
      type: "OFFICE",
      name: "HQ",
      address_1: "123 Street",
      city: "Mumbai",
      state: "MH",
      country: "IN",
      pincode: "400001",
      business_id: 1,
      created_by: 1,
      updated_by: 1,
    });
    // await sleep(3000);
  }

  // ensure all Permission rows exist (cartesian of modules x actions)
 
}
