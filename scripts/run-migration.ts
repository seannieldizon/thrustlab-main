import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function runMigration() {
    try {
        console.log('Running migration: add_activity_scores.sql');

        const migrationSQL = readFileSync(
            join(__dirname, '../drizzle/migrations/add_activity_scores.sql'),
            'utf-8'
        );

        await client.unsafe(migrationSQL);

        console.log('✓ Migration completed successfully!');
        console.log('✓ activity_scores table created');
        console.log('✓ Indexes created');
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
