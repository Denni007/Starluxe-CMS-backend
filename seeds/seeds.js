// src/seed/seeds.js (debug-hardened)
import bcrypt from "bcrypt";
import {
  sequelize,
  User,
  Business,
  Branch,
  Role,
  Permission,
  UserBusinessRole,
} from "../models/index.js";

const PERMISSION_ACTIONS = ["access", "create", "read", "update", "delete"];
const PERMISSION_MODULES = [
  "Leads",
  "Opportunities",
  "Items",
  "Quotations",
  "Contacts",
  "Tasks",
  "Reminders",
  "Employee",
  "Reports",
  "Settings",
  "Business & Branches",
];

async function ensurePermissionGrid() {
  for (const module of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      await Permission.findOrCreate({
        where: { module, action },
        defaults: { module, action },
      });
    }
  }
}

async function ensurePerm(module, action) {
  try {
    const [perm] = await Permission.findOrCreate({
      where: { module, action },
      defaults: { module, action },
    });
    if (!perm || !perm.id) throw new Error(`ensurePerm returned null id for ${module}:${action}`);
    return perm;
  } catch (err) {
    console.error("❌ ensurePerm error for", { module, action }, err?.parent?.message || err.message);
    throw err;
  }
}

async function ensurePerms(pairs) {
  const out = [];
  for (const p of pairs) out.push(await ensurePerm(p.module, p.action));
  return out;
}

function assertRow(row, hint) {
  if (!row || !row.id) {
    throw new Error(`ASSERT FAIL: ${hint} is null/undefined or missing id`);
  }
}

export default async function runSeeds() {
  try {
    console.log("🌱 Seeding started");

    // Optional: rebuild schema for clean slate
    if (process.env.SEED_FORCE === "1") {
      console.log("🧨 SEED_FORCE=1 → dropping & recreating all tables...");
      await sequelize.sync({ force: true });
    } else if (process.env.SEED_SYNC === "1") {
      console.log("🛠  SEED_SYNC=1 → syncing models (dev)...");
      await sequelize.sync({ alter: true });
    }

    console.log("→ Ensuring permission grid...");
    await ensurePermissionGrid();
    const permCount = await Permission.count();
    console.log(`  Permission rows: ${permCount}`);

    console.log("→ Inserting users...");
    await User.bulkCreate(
      [
        {
          user_name: "sysadmin",
          first_name: "System",
          last_name: "Admin",
          email: "admin@system.local",
          mobile_number: "9999999999",
          gender: "Other",
          password: await bcrypt.hash("admin123", 10),
          is_admin: true,
          is_email_verify: true,
        },
        {
          user_name: "asmith",
          first_name: "Alice",
          last_name: "Smith",
          email: "alice@example.com",
          mobile_number: "1111111111",
          gender: "Female",
          password: await bcrypt.hash("password1", 10),
        },
        {
          user_name: "bjones",
          first_name: "Bob",
          last_name: "Jones",
          email: "bob@example.com",
          mobile_number: "2222222222",
          gender: "Male",
          password: await bcrypt.hash("password2", 10),
        },
        {
          user_name: "cwhite",
          first_name: "Carol",
          last_name: "White",
          email: "carol@example.com",
          mobile_number: "3333333333",
          gender: "Female",
          password: await bcrypt.hash("password3", 10),
        },
        {
          user_name: "dgreen",
          first_name: "David",
          last_name: "Green",
          email: "david@example.com",
          mobile_number: "4444444444",
          gender: "Male",
          password: await bcrypt.hash("password4", 10),
        },
        {
          user_name: "eroberts",
          first_name: "Eva",
          last_name: "Roberts",
          email: "eva@example.com",
          mobile_number: "5555555555",
          gender: "Female",
          password: await bcrypt.hash("password5", 10),
        },
      ],
      { validate: true, ignoreDuplicates: true }
    );

    const admin = await User.findOne({ where: { email: "admin@system.local" } });
    const alice = await User.findOne({ where: { email: "alice@example.com" } });
    const bob   = await User.findOne({ where: { email: "bob@example.com" } });
    const carol = await User.findOne({ where: { email: "carol@example.com" } });
    const david = await User.findOne({ where: { email: "david@example.com" } });
    const eva   = await User.findOne({ where: { email: "eva@example.com" } });

    [admin, alice, bob, carol, david, eva].forEach((u, i) => assertRow(u, `user[${i}]`));

    console.log("→ Inserting businesses...");
    await Business.bulkCreate(
      [
        {
          name: "Acme Corp",
          pan_number: "PAN123",
          gstin: "GSTIN123",
          contact_number: "9990001111",
          industry_id: 1,
          created_by: admin.id,
          updated_by: admin.id,
        },
        {
          name: "Globex Ltd",
          pan_number: "PAN456",
          gstin: "GSTIN456",
          contact_number: "9990002222",
          industry_id: 2,
          created_by: admin.id,
          updated_by: admin.id,
        },
      ],
      { validate: true, ignoreDuplicates: true }
    );

    const acme   = await Business.findOne({ where: { name: "Acme Corp" } });
    const globex = await Business.findOne({ where: { name: "Globex Ltd" } });
    assertRow(acme, "Acme Corp");
    assertRow(globex, "Globex Ltd");

    console.log("→ Inserting branches...");
    await Branch.bulkCreate(
      [
        {
          business_id: acme.id,
          name: "HQ Mumbai",
          type: "OFFICE",
          address_1: "123 Marine Drive",
          city: "Mumbai",
          state: "MH",
          country: "IN",
          pincode: "400001",
          created_by: admin.id,
          updated_by: admin.id,
        },
        {
          business_id: acme.id,
          name: "Warehouse Pune",
          type: "WAREHOUSE",
          address_1: "456 Industrial Area",
          city: "Pune",
          state: "MH",
          country: "IN",
          pincode: "411001",
          created_by: admin.id,
          updated_by: admin.id,
        },
        {
          business_id: globex.id,
          name: "HQ Delhi",
          type: "OFFICE",
          address_1: "789 Connaught Place",
          city: "Delhi",
          state: "DL",
          country: "IN",
          pincode: "110001",
          created_by: admin.id,
          updated_by: admin.id,
        },
      ],
      { validate: true, ignoreDuplicates: true }
    );

    const hqMumbai = await Branch.findOne({ where: { name: "HQ Mumbai" } });
    const whPune   = await Branch.findOne({ where: { name: "Warehouse Pune" } });
    const hqDelhi  = await Branch.findOne({ where: { name: "HQ Delhi" } });
    assertRow(hqMumbai, "HQ Mumbai");
    assertRow(whPune,   "Warehouse Pune");
    assertRow(hqDelhi,  "HQ Delhi");

    console.log("→ Inserting roles...");
    await Role.bulkCreate(
      [
        {
          name: "Sales Exec",
          description: "Can manage leads",
          branch_id: hqMumbai.id,
          created_by: admin.id,
          updated_by: admin.id,
        },
        {
          name: "Manager",
          description: "Manages team and reports",
          branch_id: whPune.id,
          created_by: admin.id,
          updated_by: admin.id,
        },
        {
          name: "Support Staff",
          description: "Handles tasks and reminders",
          branch_id: hqDelhi.id,
          created_by: admin.id,
          updated_by: admin.id,
        },
      ],
      { validate: true, ignoreDuplicates: true }
    );

    const salesExec = await Role.findOne({ where: { name: "Sales Exec", branch_id: hqMumbai.id } });
    const manager   = await Role.findOne({ where: { name: "Manager", branch_id: whPune.id } });
    const support   = await Role.findOne({ where: { name: "Support Staff", branch_id: hqDelhi.id } });
    assertRow(salesExec, "role Sales Exec");
    assertRow(manager,   "role Manager");
    assertRow(support,   "role Support Staff");

    console.log("→ Attaching permissions to roles...");
    const salesExecPerms = await ensurePerms([
      { module: "Leads", action: "access" },
      { module: "Leads", action: "create" },
      { module: "Leads", action: "read" },
      { module: "Leads", action: "update" },
      { module: "Leads", action: "delete" },
    ]);
    await salesExec.setPermissions(salesExecPerms);

    const managerPerms = await ensurePerms([
      { module: "Reports", action: "access" },
      { module: "Reports", action: "read" },
      { module: "Employee", action: "access" },
      { module: "Employee", action: "read" },
      { module: "Employee", action: "update" },
    ]);
    await manager.setPermissions(managerPerms);

    const supportPerms = await ensurePerms([
      { module: "Tasks", action: "access" },
      { module: "Tasks", action: "create" },
      { module: "Tasks", action: "read" },
      { module: "Tasks", action: "update" },
      { module: "Reminders", action: "access" },
      { module: "Reminders", action: "create" },
      { module: "Reminders", action: "read" },
      { module: "Reminders", action: "update" },
    ]);
    await support.setPermissions(supportPerms);

    console.log("→ Creating assignments...");
    await UserBusinessRole.bulkCreate(
      [
        { user_id: alice.id, business_id: acme.id,   branch_id: hqMumbai.id, role_id: salesExec.id },
        { user_id: bob.id,   business_id: acme.id,   branch_id: whPune.id,   role_id: manager.id   },
        { user_id: carol.id, business_id: globex.id, branch_id: hqDelhi.id,  role_id: support.id   },
        { user_id: david.id, business_id: acme.id,   branch_id: hqMumbai.id, role_id: salesExec.id },
        { user_id: eva.id,   business_id: globex.id, branch_id: hqDelhi.id,  role_id: support.id   },
      ],
      { validate: true }
    );

    console.log("✅ Seeding complete");
  } catch (err) {
    console.error("❌ Seed error:", err?.parent?.message || err.message);
    throw err;
  }
}

// Run standalone
if (import.meta && import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log("✅ DB connected");
      await runSeeds();
      process.exit(0);
    } catch (err) {
      console.error("❌ Fatal:", err?.parent?.message || err.message);
      process.exit(1);
    }
  })();
}
