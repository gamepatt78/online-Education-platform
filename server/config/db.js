/**
 * PostgreSQL Database Connection Module (Pool)
 * Supports PostgreSQL with graceful fallback to the local JSON store
 * for seamless zero-downtime execution in any environment.
 */
require('dotenv').config();
const { Pool } = require('pg');

let pool = null;
let isConnected = false;

if (process.env.NODE_ENV !== 'test') {
  try {
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          user: process.env.PGUSER || 'postgres',
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'education_platform',
          password: process.env.PGPASSWORD,
          port: parseInt(process.env.PGPORT || '5432', 10),
        };

    pool = new Pool({
      ...config,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000,
      max: 20
    });

    // Verify connection asynchronously without crashing the server if Postgres isn't locally running
    pool.connect((err, client, release) => {
      if (err) {
        console.log('ℹ️ [PostgreSQL 18] Host not active locally yet (using local resilient database layer).');
        isConnected = false;
      } else {
        isConnected = true;
        console.log('✅ [PostgreSQL 18] Successfully connected to PostgreSQL Database Pool.');
        release();
      }
    });

    pool.on('error', () => {
      isConnected = false;
    });
  } catch (e) {
    console.log('ℹ️ [PostgreSQL 18] Standby mode:', e.message);
  }
}

module.exports = {
  pool,
  isPostgresConnected: () => isConnected,
  query: async (text, params) => {
    if (pool && isConnected) {
      return pool.query(text, params);
    }
    throw new Error('PostgreSQL connection is not active.');
  }
};
