const bcrypt = require("bcrypt");
const {
    User,
    Business,
    Branch,
    Role,
    Permission,
    RolePermission,
    UserBranchRole,
    Industry
} = require("../app/models");
const { PERMISSION_MODULES, PERMISSION_ACTIONS } = require("../app/constants/constant");

const existingData = async () => {
    try {
        console.log("Starting custom seeder...");

        // 1. User: Vipul Ghelani
        // Mapping: username -> user_name, mobileno -> mobile_number
        let existingUser = await User.findOne({
            where: { user_name: "Vipul Ghelani" },
        });

        if (!existingUser) {
            console.log("Creating user: Vipul Ghelani");
            // Note: Added dummy fields for required constraints if any (gender, etc - checked model, gender is required ENUM)
            existingUser = await User.create({
                user_name: "Vipul Ghelani",
                first_name: "Vipul",
                last_name: "Ghelani",
                email: "vipul@example.com",
                mobile_number: "9988776655",
                password: await bcrypt.hash("123456", 10),
                gender: "Male", // Default
                is_active: true,
                is_email_verify: true,
                is_admin: true // Assuming Super Admin role implies system admin access or high privilege
            });
        } else {
            console.log("User already exists: Vipul Ghelani");
        }

        // 1.5 Ensure Industry exists
        let existingIndustry = await Industry.findOne({ where: { id: 1 } });
        if (!existingIndustry) {
            console.log("Creating default Industry");
            // Using create with specific ID if possible, or just create and let it auto-increment.
            // If we want id:1 specifically, we might need to specify it if the DB allows (mysql usually does).
            existingIndustry = await Industry.create({
                id: 1,
                name: "Manufacturing"
            });
        }

        // 2. Company -> Business: Shree Krishna Industry
        // Mapping: companyname -> name, gstnumber -> gstin
        let existingCompany = await Business.findOne({
            where: { name: "Shree Krishna Industry" },
        });

        if (!existingCompany) {
            console.log("Creating Business: Shree Krishna Industry");
            existingCompany = await Business.create({
                name: "Shree Krishna Industry",
                gstin: "GSTSI1234567890",
                email: "krishna@example.com",
                contact_number: "1234567890",
                // address fields don't exist on Business, they go to Branch
                industry_id: existingIndustry.id,
                created_by: existingUser.id,
                updated_by: existingUser.id,
            });
        } else {
            console.log("Business already exists: Shree Krishna Industry");
        }

        // 3. Branch: Head Office (Needed to hold address and link roles)
        // Using address info from snippet: "123 first floor", "Mota varachha", Surat, Gujarat, 395006
        let existingBranch = await Branch.findOne({
            where: { business_id: existingCompany.id, name: "Head Office" }
        });

        if (!existingBranch) {
            console.log("Creating Branch: Head Office");
            existingBranch = await Branch.create({
                business_id: existingCompany.id,
                name: "Head Office",
                type: "OFFICE", // Default
                address_1: "123 first floor, Mota varachha",
                city: "Surat",
                state: "Gujarat",
                pincode: 395006,
                country: "India",
                created_by: existingUser.id,
                updated_by: existingUser.id
            });
        }

        // 4. Role: Super Admin
        let superAdminRole = await Role.findOne({
            where: { branch_id: existingBranch.id, name: "Super Admin" }
        });

        if (!superAdminRole) {
            console.log("Creating Role: Super Admin");
            superAdminRole = await Role.create({
                name: "Super Admin",
                description: "Super Admin for Shree Krishna Industry",
                branch_id: existingBranch.id,
                created_by: existingUser.id,
                updated_by: existingUser.id
            });
        }

        // 5. User <-> Company Link: UserBranchRole
        // Snippet used CompanyUser. In this system, we link User to Branch with a Role.
        const userRoleLink = await UserBranchRole.findOne({
            where: {
                user_id: existingUser.id,
                branch_id: existingBranch.id,
                role_id: superAdminRole.id
            }
        });

        if (!userRoleLink) {
            console.log("Linking User to Branch as Super Admin");
            await UserBranchRole.create({
                user_id: existingUser.id,
                branch_id: existingBranch.id,
                role_id: superAdminRole.id
            });
        }

        // Note: C_userBalance, C_companyBalance, companyBalance, AccountGroup omitted as models do not exist.

        console.log("Existing Data Seeding Completed.");
    } catch (error) {
        console.error("Error in existingData:", error);
    }
};

const existingPermission = async () => {
    try {
        console.log("Starting existingPermission seeder...");
        // Strategy: Ensure all Module x Action permissions exist globally (or per system if designed that way).
        // Then assign ALL permissions to the "Super Admin" role created above for "Shree Krishna Industry".

        const ALLOWED_ACTIONS = ["create", "update", "delete", "view", "access"];
        const modules = Object.values(PERMISSION_MODULES); // Assuming this is an object/array

        // 1. Ensure Permissions exist
        for (const m of modules) {
            for (const a of ALLOWED_ACTIONS) {
                await Permission.findOrCreate({
                    where: { module: m, action: a },
                    defaults: { module: m, action: a }
                });
            }
        }

        // 2. Find the Company/Branch we just worked with
        const company = await Business.findOne({ where: { name: "Shree Krishna Industry" } });
        if (!company) {
            console.log("Company not found for permissions, skipping.");
            return;
        }

        // Assuming logic applies to all branches or just the one we created
        let branches = await Branch.findAll({ where: { business_id: company.id } });

        // Reload branch to ensure we have it if it was created in previous step but not found? 
        // Wait, findAll should find it.

        for (const branch of branches) {
            // Find Super Admin role
            const role = await Role.findOne({ where: { branch_id: branch.id, name: "Super Admin" } });
            if (!role) continue;

            // Assign ALL permissions to this role
            const allPermissions = await Permission.findAll();

            console.log(`Assigning ${allPermissions.length} permissions to role ${role.name} in branch ${branch.name}`);

            for (const perm of allPermissions) {
                await RolePermission.findOrCreate({
                    where: { role_id: role.id, permission_id: perm.id },
                    defaults: { role_id: role.id, permission_id: perm.id }
                });
            }
        }

        console.log("Permission Seeding Completed.");

    } catch (error) {
        console.error("Error in existingPermission:", error);
    }
};

module.exports = { existingData, existingPermission };
