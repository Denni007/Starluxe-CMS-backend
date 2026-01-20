const sequelize = require('./app/config/index');

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected.");
        await sequelize.query("ALTER TABLE `users` ADD UNIQUE INDEX `users_user_name_unique_test` (`user_name`)");
        console.log("✅ Custom Index added successfully.");

        // Cleanup
        await sequelize.query("DROP INDEX `users_user_name_unique_test` ON users");
        console.log("✅ Custom Index dropped.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed:", err);
        process.exit(1);
    }
})();
