/**
 * Apply ordered SQL migrations once per database.
 *
 * Usage:
 *   node server/scripts/migrate.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'db', 'migrations');

function getDatabaseConfig() {
  return process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'education_platform',
        password: process.env.PGPASSWORD,
        port: parseInt(process.env.PGPORT || '5432', 10)
      };
}

async function runMigration() {
  console.log('Starting PostgreSQL migrations...');
  let pool;
  let client;
  try {
    pool = new Pool(getDatabaseConfig());
    client = await pool.connect();
    console.log('Connected to PostgreSQL database.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => /^\d+_[\w.-]+\.sql$/.test(file))
      .sort((left, right) => {
        const leftVersion = Number(left.match(/^\d+/)[0]);
        const rightVersion = Number(right.match(/^\d+/)[0]);
        return leftVersion - rightVersion || left.localeCompare(right);
      });
    if (migrations.length === 0) {
      throw new Error('No migration files were found.');
    }

    for (const version of migrations) {
      const applied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [version]
      );
      if (applied.rowCount > 0) {
        console.log(`Skipping already applied migration ${version}.`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, version), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
        console.log(`Applied migration ${version}.`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('PostgreSQL migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed. Check database connectivity and migration SQL.');
    throw error;
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}

if (require.main === module) {
  runMigration().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = runMigration;
