/**
 * Catalyst CLI - Make Commands
 * 
 * Code generation commands for scaffolding application components.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

const SRC_PATH = path.join(process.cwd(), 'src');

/**
 * Register all make:* commands
 */
export function registerMakeCommands(program: Command): void {
  // make:controller
  program
    .command('make:controller <name>')
    .description('Create a new controller class')
    .option('--api', 'Exclude create and edit methods (API only)')
    .option('--invokable', 'Generate a single __invoke method')
    .option('--resource', 'Generate resource controller with CRUD methods')
    .action((name: string, options) => {
      makeController(name, options);
    });

  // make:model
  program
    .command('make:model <name>')
    .description('Create a new model class')
    .option('-m, --migration', 'Create a migration file for the model')
    .option('-f, --factory', 'Create a factory file for the model')
    .option('-s, --seeder', 'Create a seeder file for the model')
    .option('-a, --all', 'Generate migration, factory, and seeder')
    .action((name: string, options) => {
      makeModel(name, options);
    });

  // make:provider
  program
    .command('make:provider <name>')
    .description('Create a new service provider class')
    .action((name: string) => {
      makeProvider(name);
    });

  // make:middleware
  program
    .command('make:middleware <name>')
    .description('Create a new middleware class')
    .action((name: string) => {
      makeMiddleware(name);
    });

  // make:request
  program
    .command('make:request <name>')
    .description('Create a new form request validation class')
    .action((name: string) => {
      makeRequest(name);
    });

  // make:job
  program
    .command('make:job <name>')
    .description('Create a new job class for queue processing')
    .action((name: string) => {
      makeJob(name);
    });

  // make:migration
  program
    .command('make:migration <name>')
    .description('Create a new database migration file')
    .option('--create <table>', 'Create a new table')
    .option('--table <table>', 'Modify an existing table')
    .action((name: string, options) => {
      makeMigrationFile(name, options);
    });

  // make:notification
  program
    .command('make:notification <name>')
    .description('Create a new notification class (email, SMS, etc.)')
    .option('--mail', 'Generate a mail notification')
    .option('--markdown', 'Generate a markdown mail notification')
    .action((name: string, options) => {
      makeNotification(name, options);
    });

  // make:command
  program
    .command('make:command <name>')
    .description('Create a new custom CLI command')
    .option('--signature <signature>', 'The command signature (e.g., "users:sync")')
    .action((name: string, options) => {
      makeCommand(name, options);
    });

  // make:policy
  program
    .command('make:policy <name>')
    .description('Create a new policy class')
    .option('-m, --model <model>', 'The model that the policy applies to')
    .action((name: string, options) => {
      makePolicy(name, options);
    });
}

/**
 * Create a controller file
 */
function makeController(name: string, options: { api?: boolean; invokable?: boolean; resource?: boolean }): void {
  const controllerName = name.endsWith('Controller') ? name : `${name}Controller`;
  const controllerPath = path.join(SRC_PATH, 'backend/Http/Controllers', `${controllerName}.ts`);

  if (fs.existsSync(controllerPath)) {
    console.log(chalk.red(`Controller already exists: ${controllerName}`));
    process.exit(1);
  }

  let content: string;

  if (options.invokable) {
    content = generateInvokableController(controllerName);
  } else if (options.resource || options.api) {
    content = generateResourceController(controllerName, options.api);
  } else {
    content = generateBasicController(controllerName);
  }

  ensureDirectoryExists(path.dirname(controllerPath));
  fs.writeFileSync(controllerPath, content);
  console.log(chalk.green(`✓ Controller created: ${controllerPath}`));
}

/**
 * Create a model file with optional related files
 */
function makeModel(name: string, options: { migration?: boolean; factory?: boolean; seeder?: boolean; all?: boolean }): void {
  const modelName = capitalizeFirst(name);
  const modelPath = path.join(SRC_PATH, 'backend/Models', `${modelName}.ts`);

  if (fs.existsSync(modelPath)) {
    console.log(chalk.red(`Model already exists: ${modelName}`));
    process.exit(1);
  }

  const content = generateModel(modelName);
  ensureDirectoryExists(path.dirname(modelPath));
  fs.writeFileSync(modelPath, content);
  console.log(chalk.green(`✓ Model created: ${modelPath}`));

  // Create related files if flags are set
  if (options.all || options.migration) {
    makeMigration(modelName);
  }

  if (options.all || options.factory) {
    makeFactory(modelName);
  }

  if (options.all || options.seeder) {
    makeSeeder(modelName);
  }
}

/**
 * Create a service provider file
 */
function makeProvider(name: string): void {
  const providerName = name.endsWith('ServiceProvider') ? name : `${name}ServiceProvider`;
  const providerPath = path.join(SRC_PATH, 'backend/Providers', `${providerName}.ts`);

  if (fs.existsSync(providerPath)) {
    console.log(chalk.red(`Provider already exists: ${providerName}`));
    process.exit(1);
  }

  const content = generateProvider(providerName);
  ensureDirectoryExists(path.dirname(providerPath));
  fs.writeFileSync(providerPath, content);
  console.log(chalk.green(`✓ Provider created: ${providerPath}`));
}

/**
 * Create a middleware file
 */
function makeMiddleware(name: string): void {
  const middlewareName = name.endsWith('Middleware') ? name : `${name}Middleware`;
  const middlewarePath = path.join(SRC_PATH, 'backend/Http/Middleware', `${middlewareName}.ts`);

  if (fs.existsSync(middlewarePath)) {
    console.log(chalk.red(`Middleware already exists: ${middlewareName}`));
    process.exit(1);
  }

  const content = generateMiddleware(middlewareName);
  ensureDirectoryExists(path.dirname(middlewarePath));
  fs.writeFileSync(middlewarePath, content);
  console.log(chalk.green(`✓ Middleware created: ${middlewarePath}`));
}

/**
 * Create a form request file
 */
function makeRequest(name: string): void {
  const requestName = name.endsWith('Request') ? name : `${name}Request`;
  const requestPath = path.join(SRC_PATH, 'backend/Http/Requests', `${requestName}.ts`);

  if (fs.existsSync(requestPath)) {
    console.log(chalk.red(`Request already exists: ${requestName}`));
    process.exit(1);
  }

  const content = generateRequest(requestName);
  ensureDirectoryExists(path.dirname(requestPath));
  fs.writeFileSync(requestPath, content);
  console.log(chalk.green(`✓ Request created: ${requestPath}`));
}

/**
 * Create a job file
 */
function makeJob(name: string): void {
  const jobName = name.endsWith('Job') ? name : `${name}Job`;
  const jobPath = path.join(SRC_PATH, 'backend/Jobs', `${jobName}.ts`);

  if (fs.existsSync(jobPath)) {
    console.log(chalk.red(`Job already exists: ${jobName}`));
    process.exit(1);
  }

  const content = generateJob(jobName);
  ensureDirectoryExists(path.dirname(jobPath));
  fs.writeFileSync(jobPath, content);
  console.log(chalk.green(`✓ Job created: ${jobPath}`));
}

/**
 * Create migration file for a model
 */
function makeMigration(modelName: string): void {
  const tableName = toSnakeCase(modelName) + 's';
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const migrationName = `${timestamp}_create_${tableName}_table.ts`;
  const migrationPath = path.join(SRC_PATH, 'database/migrations', migrationName);

  const content = generateMigration(modelName, tableName);
  ensureDirectoryExists(path.dirname(migrationPath));
  fs.writeFileSync(migrationPath, content);
  console.log(chalk.green(`✓ Migration created: ${migrationPath}`));
}

/**
 * Create factory file for a model
 */
function makeFactory(modelName: string): void {
  const factoryPath = path.join(SRC_PATH, 'database/factories', `${modelName}Factory.ts`);

  const content = generateFactory(modelName);
  ensureDirectoryExists(path.dirname(factoryPath));
  fs.writeFileSync(factoryPath, content);
  console.log(chalk.green(`✓ Factory created: ${factoryPath}`));
}

/**
 * Create seeder file for a model
 */
function makeSeeder(modelName: string): void {
  const seederPath = path.join(SRC_PATH, 'database/seeders', `${modelName}Seeder.ts`);

  const content = generateSeeder(modelName);
  ensureDirectoryExists(path.dirname(seederPath));
  fs.writeFileSync(seederPath, content);
  console.log(chalk.green(`✓ Seeder created: ${seederPath}`));
}

// ==================== STUB GENERATORS ====================

function generateBasicController(name: string): string {
  return `/**
 * ${name}
 */

import { NextRequest, NextResponse } from 'next/server';

export class ${name} {
  /**
   * Handle the incoming request
   */
  async index(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({
      message: '${name} index',
    });
  }
}

export default new ${name}();
`;
}

function generateInvokableController(name: string): string {
  return `/**
 * ${name}
 * 
 * Single-action controller
 */

import { NextRequest, NextResponse } from 'next/server';

export class ${name} {
  /**
   * Handle the incoming request
   */
  async __invoke(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({
      message: '${name} invoked',
    });
  }
}

export default new ${name}();
`;
}

function generateResourceController(name: string, apiOnly?: boolean): string {
  const resourceName = name.replace('Controller', '').toLowerCase();
  
  let methods = `
  /**
   * Display a listing of the resource
   */
  async index(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ data: [] });
  }

  /**
   * Store a newly created resource
   */
  async store(request: NextRequest): Promise<NextResponse> {
    const data = await request.json();
    return NextResponse.json({ data }, { status: 201 });
  }

  /**
   * Display the specified resource
   */
  async show(request: NextRequest, id: string): Promise<NextResponse> {
    return NextResponse.json({ data: { id } });
  }

  /**
   * Update the specified resource
   */
  async update(request: NextRequest, id: string): Promise<NextResponse> {
    const data = await request.json();
    return NextResponse.json({ data: { id, ...data } });
  }

  /**
   * Remove the specified resource
   */
  async destroy(request: NextRequest, id: string): Promise<NextResponse> {
    return NextResponse.json(null, { status: 204 });
  }`;

  if (!apiOnly) {
    methods += `

  /**
   * Show the form for creating a new resource
   */
  async create(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: 'Show create form' });
  }

  /**
   * Show the form for editing the specified resource
   */
  async edit(request: NextRequest, id: string): Promise<NextResponse> {
    return NextResponse.json({ message: 'Show edit form', id });
  }`;
  }

  return `/**
 * ${name}
 * 
 * Resource controller for ${resourceName} management
 */

import { NextRequest, NextResponse } from 'next/server';

export class ${name} {${methods}
}

export default new ${name}();
`;
}

function generateModel(name: string): string {
  const tableName = toSnakeCase(name) + 's';
  
  return `/**
 * ${name} Model
 */

import { Model } from '@/backend/Models/Model';

export interface ${name}Attributes {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export class ${name} extends Model<${name}Attributes> {
  protected table = '${tableName}';
  protected primaryKey = 'id';
  
  protected fillable: (keyof ${name}Attributes)[] = [
    // Add fillable fields here
  ];
  
  protected hidden: (keyof ${name}Attributes)[] = [];
  
  protected casts: Partial<Record<keyof ${name}Attributes, string>> = {
    created_at: 'datetime',
    updated_at: 'datetime',
  };

  /**
   * Scope: Active records
   */
  scopeActive(query: any) {
    return query.where('active', 1);
  }
}

export default ${name};
`;
}

function generateProvider(name: string): string {
  return `/**
 * ${name}
 * 
 * Service provider for registering application services.
 */

import Container from '@/backend/Core/Container';

export class ${name} {
  protected container = Container.getInstance();

  /**
   * Register any application services.
   * 
   * This method is called before the application has booted.
   * Register bindings, singletons, and other container entries here.
   */
  register(): void {
    // Example:
    // this.container.singleton('myService', () => new MyService());
  }

  /**
   * Bootstrap any application services.
   * 
   * This method is called after all providers have been registered.
   * Perform any actions that require other services to be available.
   */
  boot(): void {
    // Example:
    // const config = this.container.make('config');
  }
}

export default ${name};
`;
}

function generateMiddleware(name: string): string {
  return `/**
 * ${name}
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Middleware, NextFunction } from '@/backend/Core/Pipeline';

export class ${name} implements Middleware {
  /**
   * Handle the incoming request.
   * 
   * @param request - The incoming request
   * @param next - Callback to pass control to the next middleware
   */
  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // Perform actions before the request is handled
    
    const response = await next();
    
    // Perform actions after the request is handled
    
    return response;
  }
}

export default ${name};
`;
}

function generateRequest(name: string): string {
  return `/**
 * ${name}
 * 
 * Form request for validating incoming data.
 */

import { z } from 'zod';

export const ${name.replace('Request', '')}Schema = z.object({
  // Define your validation schema here
  // Example:
  // name: z.string().min(1, 'Name is required').max(255),
  // email: z.string().email('Invalid email address'),
});

export type ${name.replace('Request', '')}Data = z.infer<typeof ${name.replace('Request', '')}Schema>;

/**
 * Validate request data
 */
export async function validate${name.replace('Request', '')}(data: unknown): Promise<{
  success: boolean;
  data?: ${name.replace('Request', '')}Data;
  errors?: Record<string, string[]>;
}> {
  const result = ${name.replace('Request', '')}Schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    });
    
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}
`;
}

function generateJob(name: string): string {
  return `/**
 * ${name}
 * 
 * Queueable job for background processing.
 */

import { Job } from '@/backend/Jobs/Job';

export interface ${name}Payload {
  // Define your job payload here
  // Example:
  // userId: string;
  // action: string;
}

export class ${name} extends Job<${name}Payload> {
  /**
   * The number of times the job may be attempted.
   */
  public tries = 3;

  /**
   * The maximum number of seconds the job can run.
   */
  public timeout = 60;

  /**
   * The number of seconds to wait before retrying a failed job.
   */
  public backoff = 5;

  /**
   * Execute the job.
   */
  async handle(): Promise<void> {
    const payload = this.payload;
    
    // Process the job here
    console.log('Processing ${name}:', payload);
  }

  /**
   * Handle a job failure.
   */
  async failed(error: Error): Promise<void> {
    console.error('${name} failed:', error.message);
  }
}

export default ${name};
`;
}

function generateMigration(modelName: string, tableName: string): string {
  return `/**
 * Migration: Create ${tableName} table
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const ${tableName} = sqliteTable('${tableName}', {
  id: text('id').primaryKey(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql\`(unixepoch())\`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql\`(unixepoch())\`),
});

export type ${modelName}Record = typeof ${tableName}.$inferSelect;
export type New${modelName}Record = typeof ${tableName}.$inferInsert;
`;
}

function generateFactory(modelName: string): string {
  return `/**
 * ${modelName}Factory
 * 
 * Factory for generating fake ${modelName} data for testing.
 */

import { nanoid } from 'nanoid';

export class ${modelName}Factory {
  /**
   * Define the model's default state.
   */
  definition() {
    return {
      id: nanoid(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Create a single model instance.
   */
  make(overrides = {}) {
    return { ...this.definition(), ...overrides };
  }

  /**
   * Create multiple model instances.
   */
  count(count: number, overrides = {}) {
    return Array.from({ length: count }, () => this.make(overrides));
  }
}

export default new ${modelName}Factory();
`;
}

function generateSeeder(modelName: string): string {
  const tableName = toSnakeCase(modelName) + 's';
  
  return `/**
 * ${modelName}Seeder
 * 
 * Seeds the ${tableName} table with sample data.
 */

// import { db } from '@/database';
// import { ${tableName} } from '@/database/migrations/create_${tableName}_table';
import ${modelName}Factory from '../factories/${modelName}Factory';

export default async function seed() {
  console.log('Seeding ${tableName}...');
  
  const records = ${modelName}Factory.count(10);
  
  // Insert records into database
  // await db.insert(${tableName}).values(records);
  
  console.log(\`✓ Seeded \${records.length} ${tableName}\`);
}
`;
}

// ==================== NEW COMMAND IMPLEMENTATIONS ====================

/**
 * Create a migration file
 */
function makeMigrationFile(name: string, options: { create?: string; table?: string }): void {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const migrationName = `${timestamp}_${toSnakeCase(name)}.ts`;
  const migrationPath = path.join(SRC_PATH, 'database/migrations', migrationName);

  if (fs.existsSync(migrationPath)) {
    console.log(chalk.red(`Migration already exists: ${migrationName}`));
    process.exit(1);
  }

  let content: string;
  
  if (options.create) {
    content = generateCreateTableMigration(name, options.create);
  } else if (options.table) {
    content = generateAlterTableMigration(name, options.table);
  } else {
    content = generateBlankMigration(name);
  }

  ensureDirectoryExists(path.dirname(migrationPath));
  fs.writeFileSync(migrationPath, content);
  console.log(chalk.green(`✓ Migration created: ${migrationPath}`));
}

/**
 * Create a notification file
 */
function makeNotification(name: string, options: { mail?: boolean; markdown?: boolean }): void {
  const notificationName = name.endsWith('Notification') ? name : `${name}Notification`;
  const notificationPath = path.join(SRC_PATH, 'backend/Notifications', `${notificationName}.ts`);

  if (fs.existsSync(notificationPath)) {
    console.log(chalk.red(`Notification already exists: ${notificationName}`));
    process.exit(1);
  }

  const content = generateNotification(notificationName, options);
  ensureDirectoryExists(path.dirname(notificationPath));
  fs.writeFileSync(notificationPath, content);
  console.log(chalk.green(`✓ Notification created: ${notificationPath}`));

  // If markdown, also create the template
  if (options.markdown) {
    const templateName = toSnakeCase(name.replace('Notification', ''));
    const templatePath = path.join(SRC_PATH, 'resources/views/emails', `${templateName}.md`);
    ensureDirectoryExists(path.dirname(templatePath));
    fs.writeFileSync(templatePath, generateMarkdownEmailTemplate(name));
    console.log(chalk.green(`✓ Email template created: ${templatePath}`));
  }
}

/**
 * Create a custom CLI command file
 */
function makeCommand(name: string, options: { signature?: string }): void {
  const commandName = name.endsWith('Command') ? name : `${name}Command`;
  const commandPath = path.join(SRC_PATH, 'backend/Console/Commands', `${commandName}.ts`);

  if (fs.existsSync(commandPath)) {
    console.log(chalk.red(`Command already exists: ${commandName}`));
    process.exit(1);
  }

  const signature = options.signature || toSnakeCase(name.replace('Command', '')).replace(/_/g, ':');
  const content = generateCommand(commandName, signature);
  ensureDirectoryExists(path.dirname(commandPath));
  fs.writeFileSync(commandPath, content);
  console.log(chalk.green(`✓ Command created: ${commandPath}`));
}

/**
 * Create a policy file
 */
function makePolicy(name: string, options: { model?: string }): void {
  const policyName = name.endsWith('Policy') ? name : `${name}Policy`;
  const policyPath = path.join(SRC_PATH, 'backend/Policies', `${policyName}.ts`);

  if (fs.existsSync(policyPath)) {
    console.log(chalk.red(`Policy already exists: ${policyName}`));
    process.exit(1);
  }

  const content = generatePolicy(policyName, options.model);
  ensureDirectoryExists(path.dirname(policyPath));
  fs.writeFileSync(policyPath, content);
  console.log(chalk.green(`✓ Policy created: ${policyPath}`));
}

// ==================== NEW STUB GENERATORS ====================

function generateCreateTableMigration(name: string, tableName: string): string {
  return `/**
 * Migration: ${name}
 * 
 * Creates the ${tableName} table.
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const ${tableName} = sqliteTable('${tableName}', {
  id: text('id').primaryKey(),
  // Add your columns here
  // name: text('name').notNull(),
  // email: text('email').notNull().unique(),
  // status: text('status').default('active'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql\`(unixepoch())\`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql\`(unixepoch())\`),
});

export type ${capitalizeFirst(tableName)}Record = typeof ${tableName}.$inferSelect;
export type New${capitalizeFirst(tableName)}Record = typeof ${tableName}.$inferInsert;
`;
}

function generateAlterTableMigration(name: string, tableName: string): string {
  return `/**
 * Migration: ${name}
 * 
 * Modifies the ${tableName} table.
 */

// Note: Drizzle ORM uses a push-based migration model.
// To modify a table, update the schema definition and run:
// npm run db:push

/*
Example modifications:

// Add a new column
ALTER TABLE ${tableName} ADD COLUMN new_column TEXT;

// Add an index
CREATE INDEX idx_${tableName}_column ON ${tableName}(column_name);

// Add a foreign key (SQLite limitations apply)
// For SQLite, you may need to recreate the table
*/

export const migration = {
  name: '${name}',
  description: 'Modify ${tableName} table',
  
  async up() {
    // Execute migration
    console.log('Running migration: ${name}');
  },
  
  async down() {
    // Rollback migration
    console.log('Rolling back migration: ${name}');
  },
};

export default migration;
`;
}

function generateBlankMigration(name: string): string {
  return `/**
 * Migration: ${name}
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Define your schema changes here

export const migration = {
  name: '${name}',
  
  async up() {
    // Execute migration
    console.log('Running migration: ${name}');
  },
  
  async down() {
    // Rollback migration
    console.log('Rolling back migration: ${name}');
  },
};

export default migration;
`;
}

function generateNotification(name: string, options: { mail?: boolean; markdown?: boolean }): string {
  const channels = options.mail || options.markdown ? "['mail']" : "['mail', 'database']";
  const templateMethod = options.markdown ? 'toMarkdownMail' : 'toMail';
  
  return `/**
 * ${name}
 * 
 * Notification class for sending alerts via various channels.
 */

export interface ${name}Data {
  // Define your notification data here
  // Example:
  // userId: string;
  // message: string;
}

export interface MailMessage {
  subject: string;
  greeting?: string;
  lines: string[];
  action?: {
    text: string;
    url: string;
  };
  salutation?: string;
}

export interface NotifiableUser {
  id: string;
  email: string;
  name: string;
}

export class ${name} {
  private data: ${name}Data;

  constructor(data: ${name}Data) {
    this.data = data;
  }

  /**
   * Get the notification's delivery channels.
   */
  via(notifiable: NotifiableUser): string[] {
    return ${channels};
  }

  /**
   * Get the mail representation of the notification.
   */
  ${templateMethod}(notifiable: NotifiableUser): MailMessage {
    return {
      subject: '${name.replace('Notification', '')}',
      greeting: \`Hello \${notifiable.name}!\`,
      lines: [
        'This is a notification from your application.',
        'You can customize this message in the ${name} class.',
      ],
      action: {
        text: 'View Details',
        url: process.env.APP_URL || 'http://localhost:3000',
      },
      salutation: 'Best regards,\\nThe Team',
    };
  }

  /**
   * Get the database representation of the notification.
   */
  toDatabase(notifiable: NotifiableUser): Record<string, unknown> {
    return {
      type: '${name}',
      data: this.data,
      notifiable_id: notifiable.id,
      created_at: new Date(),
    };
  }

  /**
   * Get the array representation of the notification.
   */
  toArray(): ${name}Data {
    return this.data;
  }
}

export default ${name};
`;
}

function generateMarkdownEmailTemplate(name: string): string {
  const title = name.replace('Notification', '').replace(/([A-Z])/g, ' $1').trim();
  
  return `# ${title}

Hello {{ name }}!

This is a notification from your application.

You can customize this markdown template to match your needs.

## Details

- **Item 1**: Description here
- **Item 2**: Description here

@component('button', { url: '{{ actionUrl }}' })
View Details
@endcomponent

Thanks,<br>
{{ config.app.name }}
`;
}

function generateCommand(name: string, signature: string): string {
  return `/**
 * ${name}
 * 
 * Custom CLI command for the Catalyst framework.
 * 
 * Usage:
 *   npm run catalyst -- ${signature}
 */

import { Command } from 'commander';
import chalk from 'chalk';

export interface ${name}Options {
  // Define your command options here
  verbose?: boolean;
}

export class ${name} {
  /**
   * The command signature.
   */
  public signature = '${signature}';

  /**
   * The command description.
   */
  public description = 'Description of what ${signature} does';

  /**
   * Register the command with the CLI program.
   */
  register(program: Command): void {
    program
      .command(this.signature)
      .description(this.description)
      .option('-v, --verbose', 'Enable verbose output')
      .action((options: ${name}Options) => {
        this.handle(options);
      });
  }

  /**
   * Execute the command.
   */
  async handle(options: ${name}Options): Promise<void> {
    console.log(chalk.cyan('\\nExecuting ${signature}...\\n'));

    if (options.verbose) {
      console.log(chalk.gray('Verbose mode enabled'));
    }

    try {
      // Your command logic here
      await this.execute(options);
      
      console.log(chalk.green('\\n✓ Command completed successfully!\\n'));
    } catch (error) {
      console.error(chalk.red('\\n✗ Command failed:'), error);
      process.exit(1);
    }
  }

  /**
   * The main command logic.
   */
  private async execute(options: ${name}Options): Promise<void> {
    // Implement your command logic here
    console.log('Running ${signature} command...');
    
    // Example: Simulate some work
    // await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export default new ${name}();

/**
 * To register this command, add to your CLI entry point:
 * 
 * import ${name} from './Commands/${name}';
 * ${name}.register(program);
 */
`;
}

function generatePolicy(name: string, model?: string): string {
  const modelClass = model ? capitalizeFirst(model) : null;
  const modelImport = modelClass ? `import ${modelClass} from '@/backend/Models/${modelClass}';` : '';
  const userImport = `import { User } from '@/backend/Core/Context';`;

  return `/**
 * ${name}
 */
 
${userImport}
${modelImport}

export class ${name} {
  /**
   * Determine whether the user can view any models.
   */
  viewAny(user: User): boolean {
    return true;
  }

  /**
   * Determine whether the user can view the model.
   */
  view(user: User${modelClass ? `, ${model?.toLowerCase()}: ${modelClass}` : ''}): boolean {
    return true;
  }

  /**
   * Determine whether the user can create models.
   */
  create(user: User): boolean {
    return true;
  }

  /**
   * Determine whether the user can update the model.
   */
  update(user: User${modelClass ? `, ${model?.toLowerCase()}: ${modelClass}` : ''}): boolean {
    return true;
  }

  /**
   * Determine whether the user can delete the model.
   */
  delete(user: User${modelClass ? `, ${model?.toLowerCase()}: ${modelClass}` : ''}): boolean {
    return true;
  }
}
`;
}

// ==================== UTILITIES ====================

function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}
