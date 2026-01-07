/**
 * Drop all database tables script
 * 
 * Used by db:reboot command to reset the database.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = process.env.DB_DATABASE || './data/catalyst.db';

async function dropTables() {
  console.log('[DB] Dropping all tables...');

  if (!fs.existsSync(DB_PATH)) {
    console.log('[DB] Database file does not exist. Nothing to drop.');
    return;
  }

  try {
    const db = new Database(DB_PATH);
    
    // Get all tables
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as { name: string }[];

    // Disable foreign key checks
    db.pragma('foreign_keys = OFF');

    // Drop each table
    for (const { name } of tables) {
      console.log(`  Dropping table: ${name}`);
      db.exec(`DROP TABLE IF EXISTS "${name}"`);
    }

    // Re-enable foreign key checks
    db.pragma('foreign_keys = ON');
    
    db.close();
    
    console.log('[DB] ✓ All tables dropped successfully.');
  } catch (error) {
    console.error('[DB] Error dropping tables:', error);
    process.exit(1);
  }
}

// Run if called directly
dropTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
