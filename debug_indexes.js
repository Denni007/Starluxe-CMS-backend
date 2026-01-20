const sequelize = require('./app/config/index');

(async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW INDEX FROM users");
        console.log("Existing Indexes on 'users':", results.length);
        console.log(results.map(i => i.Key_name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
