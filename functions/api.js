const serverless = require("serverless-http");
const app = require("../app");
const sequelize = require("../app/config");

// Ensure DB connection is established when the lambda is warmed up
// We don't want to sync() in production lambda typically, or at least be careful.
// app.js startup logic was: 
// - authenticate()
// - sync({ alter: true }) ONLY if !production

// For the lambda, we just want to ensure we can connect.
// Initializing sequelize doesn't strictly require an await for the *app* definition,
// but the requests will fail if DB isn't ready.
// Sequelize automatically handles connection management on queries, but let's be safe.

const dbPromise = sequelize.authenticate()
    .then(() => console.log('✅ DB connected in Lambda'))
    .catch(err => console.error('❌ DB Connection failed:', err));

module.exports.handler = async (event, context) => {
    // Ensure we wait for DB connection if it's the first time
    // Note: Better optimization is possible, but this is safe start.
    await dbPromise;

    // Wrap the app
    const handler = serverless(app);
    return handler(event, context);
};
