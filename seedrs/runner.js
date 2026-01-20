const { existingData, existingPermission } = require("./custom_seeder");
const { sequelize } = require("../app/models");

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected...");

        // Sync models if needed? Usually for seeders DB is already synced.
        // await sequelize.sync(); 

        await existingData();
        await existingPermission();

        console.log("Seeding process finished.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

run();
