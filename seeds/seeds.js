import bcrypt from "bcrypt";
import { User, Permission ,Industry, Business} from "../models/index.js";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../constants/permissions.js";

export default async function seedAdmin() {
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
      email:"test@gyopmail.com",
      mobile_number: "9999999999",
      gender: "Other",
      password: await bcrypt.hash("123456", 10),
      is_admin: true,
      is_email_verify: true,
    });
  }
    for (const name of INDUSTRY_LIST) {
      await Industry.findOrCreate({
        where: { name },
        defaults: { name },
      });
    }
  // ensure all Permission rows exist (cartesian of modules x actions)
  for (const m of PERMISSION_MODULES) {
    for (const a of PERMISSION_ACTIONS) {
      const found = await Permission.findOne({ where: { module: m, action: a } });
      if (!found) await Permission.create({ module: m, action: a });
    }
  }
}