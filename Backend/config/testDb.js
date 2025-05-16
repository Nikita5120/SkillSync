const db = require('./database');
const logger = require('../utils/logger');

async function testDatabaseConnection() {
    try {
        await db.initialize();
        logger.info('Database connection and initialization successful!');
        process.exit(0);
    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
}

testDatabaseConnection(); 