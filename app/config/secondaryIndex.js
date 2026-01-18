const { Sequelize } = require("sequelize");
require("dotenv").config();

const {
    SECONDARY_DB_NAME,
    SECONDARY_DB_USERNAME,
    SECONDARY_DB_PASSWORD,
    SECONDARY_DB_HOST,
    SECONDARY_DB_PORT,
} = process.env;

const sequelize = new Sequelize({
    database: SECONDARY_DB_NAME,
    username: SECONDARY_DB_USERNAME,
    password: SECONDARY_DB_PASSWORD,
    host: SECONDARY_DB_HOST,
    port: SECONDARY_DB_PORT || 4000,
    dialect: "mysql",
    logging: false,
});

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });

        console.log("✅ SECONDARY DB connected successfully");
    } catch (error) {
        console.error("❌ SECONDARY DB connection failed:", error);
    }
})();

module.exports = sequelize;
