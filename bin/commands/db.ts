/**
 * Catalyst CLI - Database Commands
 * 
 * Database operations for migrations, seeding, and inspection.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

const SRC_PATH = path.join(process.cwd(), 'src');

/**
 * Register all db:* and migrate:* commands
 */
export function registerDbCommands(program: Command): void {
  // migrate:status
  program
    .command('migrate:status')
    .description('Show the status of each migration')
    .action(() => {
      migrateStatus();
    });

  // migrate:run
  program
    .command('migrate')
    .description('Run all pending migrations')
    .action(() => {
      runMigrations();
    });

  // migrate:rollback
  program
    .command('migrate:rollback')
    .description('Rollback the last batch of migrations')
    .option('--step <number>', 'Number of migrations to rollback', '1')
    .action((options) => {
      rollbackMigrations(parseInt(options.step, 10));
    });

  // db:show
  program
    .command('db:show')
    .description('Display table structure in the database')
    .option('--table <name>', 'Specific table to show')
    .action((options) => {
      showDatabase(options.table);
    });

  // db:seed
  program
    .command('db:seed')
    .description('Seed the database with records')
    .option('--class <name>', 'Specific seeder class to run')
    .action((options) => {
      runSeeders(options.class);
    });

  // model:prune
  program
    .command('model:prune')
    .description('Prune models that are no longer needed')
    .option('--model <name>', 'Specific model to prune')
    .option('--dry-run', 'Show what would be pruned without actually pruning')
    .action((options) => {
      pruneModels(options.model, options.dryRun);
    });
}

/**
 * Show migration status
 */
function migrateStatus(): void {
  const migrationsPath = path.join(SRC_PATH, 'database/migrations');
  
  if (!fs.existsSync(migrationsPath)) {
    console.log(chalk.yellow('No migrations directory found.'));
    return;
  }

  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.ts'))
    .sort();

  if (files.length === 0) {
    console.log(chalk.yellow('No migrations found.'));
    return;
  }

  console.log(chalk.bold('\nMigration Status\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.bold('  Status   │ Migration'));
  console.log(chalk.gray('─'.repeat(60)));

  // TODO: Check against actual database table
  // For now, show all as pending
  files.forEach((file) => {
    const name = file.replace('.ts', '');
    console.log(chalk.yellow(`  Pending  │ ${name}`));
  });

  console.log(chalk.gray('─'.repeat(60)));
  console.log(`\n  Total: ${files.length} migration(s)\n`);
}

/**
 * Run pending migrations
 */
function runMigrations(): void {
  console.log(chalk.bold('\nRunning Migrations...\n'));

  const migrationsPath = path.join(SRC_PATH, 'database/migrations');
  
  if (!fs.existsSync(migrationsPath)) {
    console.log(chalk.yellow('No migrations directory found.'));
    return;
  }

  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.ts'))
    .sort();

  if (files.length === 0) {
    console.log(chalk.green('Nothing to migrate.'));
    return;
  }

  console.log(chalk.cyan('Note: Using Drizzle Kit for migrations.'));
  console.log(chalk.gray('Run: npm run db:push\n'));
  
  // In a full implementation, this would:
  // 1. Load each migration file
  // 2. Check if already run (from migrations table)
  // 3. Execute the up() method
  // 4. Record in migrations table
}

/**
 * Rollback migrations
 */
function rollbackMigrations(steps: number): void {
  console.log(chalk.bold(`\nRolling back ${steps} migration(s)...\n`));
  console.log(chalk.cyan('Note: Using Drizzle Kit for migrations.'));
  console.log(chalk.gray('Drizzle uses push/pull model. For rollback, modify schema and re-push.\n'));
}

/**
 * Show database structure
 */
function showDatabase(tableName?: string): void {
  console.log(chalk.bold('\nDatabase Structure\n'));
  
  const migrationsPath = path.join(SRC_PATH, 'database/migrations');
  
  if (!fs.existsSync(migrationsPath)) {
    console.log(chalk.yellow('No migrations directory found.'));
    return;
  }

  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.ts'))
    .sort();

  if (tableName) {
    const matchingFile = files.find(f => f.includes(tableName));
    if (matchingFile) {
      console.log(chalk.cyan(`Table definition in: ${matchingFile}\n`));
      const content = fs.readFileSync(path.join(migrationsPath, matchingFile), 'utf-8');
      console.log(content);
    } else {
      console.log(chalk.yellow(`No migration found for table: ${tableName}`));
    }
  } else {
    console.log(chalk.cyan('Tables defined in migrations:\n'));
    files.forEach((file) => {
      const name = file.replace('.ts', '').replace(/^\d+_/, '');
      console.log(`  • ${name}`);
    });
    console.log(chalk.gray('\nUse --table <name> for detailed structure.'));
  }
}

/**
 * Run database seeders
 */
function runSeeders(className?: string): void {
  console.log(chalk.bold('\nSeeding Database...\n'));

  const seedersPath = path.join(SRC_PATH, 'database/seeders');
  
  if (!fs.existsSync(seedersPath)) {
    console.log(chalk.yellow('No seeders directory found.'));
    return;
  }

  const files = fs.readdirSync(seedersPath)
    .filter(file => file.endsWith('.ts') && file !== 'DatabaseSeeder.ts')
    .sort();

  if (className) {
    const matchingFile = files.find(f => f.includes(className));
    if (matchingFile) {
      console.log(chalk.green(`Running ${matchingFile}...`));
      // In full implementation: import and execute the seeder
    } else {
      console.log(chalk.yellow(`No seeder found: ${className}`));
    }
  } else {
    console.log(chalk.cyan('Available seeders:\n'));
    files.forEach((file) => {
      console.log(`  • ${file.replace('.ts', '')}`);
    });
    console.log(chalk.gray('\nRun: npm run db:seed'));
  }
}

/**
 * Prune unused models
 */
function pruneModels(modelName?: string, dryRun?: boolean): void {
  console.log(chalk.bold('\nPruning Models...\n'));
  
  if (dryRun) {
    console.log(chalk.yellow('Dry run mode - no changes will be made.\n'));
  }

  const modelsPath = path.join(SRC_PATH, 'app/Models');
  
  if (!fs.existsSync(modelsPath)) {
    console.log(chalk.yellow('No models directory found.'));
    return;
  }

  const files = fs.readdirSync(modelsPath)
    .filter(file => file.endsWith('.ts') && file !== 'Model.ts')
    .sort();

  if (files.length === 0) {
    console.log(chalk.green('No models to prune.'));
    return;
  }

  console.log(chalk.cyan('Model pruning identifies models with soft-deleted records past retention.\n'));
  console.log(chalk.gray('This feature requires model-level prunable configuration.'));
}
