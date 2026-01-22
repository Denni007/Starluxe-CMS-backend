const app = require('./app');
const functionApi = require('./functions/api');

console.log('✅ app.js loaded successfully');
console.log('✅ functions/api.js loaded successfully');

if (app.running) {
    console.error('❌ app.js started listening on import! This is bad for serverless.');
    process.exit(1);
} else {
    console.log('✅ app.js did NOT start listening on import (Correct).');
}

// Check if function handler is exported
if (typeof functionApi.handler !== 'function') {
    console.error('❌ functions/api.js does not export a handler function.');
    process.exit(1);
}
console.log('✅ functions/api.js exports a handler function.');

console.log('🎉 Verification Passed.');
process.exit(0);
