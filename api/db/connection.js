// ============================================
// NEON DATABASE CONNECTION
// Optimiert für Vercel Serverless Functions
// ============================================

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('./schema');

// ============================================
// DATABASE CONNECTION
// ============================================

let db = null;

/**
 * Get or create database connection
 * Uses connection pooling for Vercel Serverless Functions
 */
function getDb() {
    if (db) {
        return db;
    }

    // Get connection string from environment variable
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            'DATABASE_URL environment variable is not set. ' +
            'Please add it to your Vercel project settings or .env file.'
        );
    }

    try {
        // Create Neon SQL client (HTTP-based, perfect for serverless)
        const sql = neon(connectionString);

        // Create Drizzle ORM instance
        db = drizzle(sql, { schema });

        console.log('✅ Neon database connection established');
        return db;
    } catch (error) {
        console.error('❌ Failed to connect to Neon database:', error);
        throw error;
    }
}

/**
 * Execute a raw SQL query
 * Useful for migrations and custom queries
 */
async function executeRawQuery(query, params = []) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL not set');
    }

    const sql = neon(connectionString);
    return await sql(query, params);
}

/**
 * Health check for database connection
 */
async function checkHealth() {
    try {
        const db = getDb();
        // Simple query to check connection
        await executeRawQuery('SELECT 1');
        return { status: 'healthy', database: 'neon-postgres' };
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    getDb,
    executeRawQuery,
    checkHealth
};
