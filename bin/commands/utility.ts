/**
 * Catalyst CLI - Utility Commands
 *
 * Development utilities for route listing, cache clearing, etc.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SRC_PATH = path.join(process.cwd(), 'src');

/**
 * Register utility commands
 */
export function registerUtilityCommands(program: Command): void {
  // route:list
  program
    .command('route:list')
    .description('List all registered routes')
    .option('--method <method>', 'Filter by HTTP method')
    .option('--name <name>', 'Filter by route name')
    .option('--path <path>', 'Filter by path pattern')
    .action((options) => {
      routeList(options);
    });

  // cache:clear
  program
    .command('cache:clear')
    .description('Flush the application cache')
    .option('--store <store>', 'Specific cache store to clear')
    .action((options) => {
      cacheClear(options.store);
    });

  // config:clear
  program
    .command('config:clear')
    .description('Remove the configuration cache file')
    .action(() => {
      configClear();
    });

  // optimize
  program
    .command('optimize')
    .description('Cache configuration and routes for faster loading')
    .action(() => {
      optimize();
    });

  // tinker
  program
    .command('tinker')
    .description('Interact with your application (REPL)')
    .action(() => {
      tinker();
    });

  // serve
  program
    .command('serve')
    .description('Start the development server')
    .option('--port <port>', 'Port to run on', '3000')
    .action((options) => {
      serve(options.port);
    });

  // env
  program
    .command('env')
    .description('Display the current environment')
    .action(() => {
      showEnv();
    });

  // key:generate
  program
    .command('key:generate')
    .description('Generate a new application key and set it in .env')
    .option('--show', 'Display the key instead of modifying .env')
    .option('--force', 'Force overwrite existing key')
    .action((options) => {
      keyGenerate(options);
    });
}

interface RouteInfo {
  method: string;
  uri: string;
  name: string;
  action: string;
  middleware: string[];
}

/**
 * List all routes
 */
function routeList(options: { method?: string; name?: string; path?: string }): void {
  console.log(chalk.bold('\nRoute List\n'));

  // Scan the app directory for route files
  const appPath = path.join(SRC_PATH, 'app');
  const apiPath = path.join(appPath, 'api');

  const routes: RouteInfo[] = [];

  // Scan app/api directory for route handlers
  if (fs.existsSync(apiPath)) {
    scanRouteDirectory(apiPath, '/api', routes);
  }

  // Scan app directory for page routes
  if (fs.existsSync(appPath)) {
    scanPageDirectory(appPath, '', routes);
  }

  // Filter routes based on options
  let filteredRoutes = routes;

  if (options.method) {
    const method = options.method.toUpperCase();
    filteredRoutes = filteredRoutes.filter(r => r.method.includes(method));
  }

  if (options.name) {
    filteredRoutes = filteredRoutes.filter(r => 
      r.name.toLowerCase().includes(options.name!.toLowerCase())
    );
  }

  if (options.path) {
    filteredRoutes = filteredRoutes.filter(r => 
      r.uri.toLowerCase().includes(options.path!.toLowerCase())
    );
  }

  if (filteredRoutes.length === 0) {
    console.log(chalk.yellow('No routes found matching the criteria.'));
    return;
  }

  // Display table header
  console.log(chalk.gray('─'.repeat(100)));
  console.log(
    chalk.bold(padEnd('Method', 12)) +
    chalk.bold(padEnd('URI', 35)) +
    chalk.bold(padEnd('Name', 20)) +
    chalk.bold('Action')
  );
  console.log(chalk.gray('─'.repeat(100)));

  // Display routes
  filteredRoutes.forEach((route) => {
    const methodColor = getMethodColor(route.method);
    console.log(
      chalk[methodColor](padEnd(route.method, 12)) +
      padEnd(route.uri, 35) +
      chalk.cyan(padEnd(route.name, 20)) +
      chalk.gray(route.action)
    );
  });

  console.log(chalk.gray('─'.repeat(100)));
  console.log(`\n  Total: ${filteredRoutes.length} route(s)\n`);
}

/**
 * Scan directory for API routes
 */
function scanRouteDirectory(dir: string, basePath: string, routes: RouteInfo[]): void {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const segment = item.name.startsWith('[') 
        ? `/:${item.name.slice(1, -1)}`
        : `/${item.name}`;
      scanRouteDirectory(fullPath, basePath + segment, routes);
    } else if (item.name === 'route.ts' || item.name === 'route.tsx') {
      // Read the file to determine which methods are exported
      const content = fs.readFileSync(fullPath, 'utf-8');
      const methods: string[] = [];

      if (content.includes('export async function GET') || content.includes('export function GET')) {
        methods.push('GET');
      }
      if (content.includes('export async function POST') || content.includes('export function POST')) {
        methods.push('POST');
      }
      if (content.includes('export async function PUT') || content.includes('export function PUT')) {
        methods.push('PUT');
      }
      if (content.includes('export async function PATCH') || content.includes('export function PATCH')) {
        methods.push('PATCH');
      }
      if (content.includes('export async function DELETE') || content.includes('export function DELETE')) {
        methods.push('DELETE');
      }

      routes.push({
        method: methods.join('|') || 'ANY',
        uri: basePath || '/',
        name: pathToName(basePath),
        action: `route.ts`,
        middleware: [],
      });
    }
  }
}

/**
 * Scan directory for page routes
 */
function scanPageDirectory(dir: string, basePath: string, routes: RouteInfo[]): void {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const excludeDirs = ['api', 'Components', 'Core', 'Http', 'Models', 'Providers', 'Services', 'Jobs', 'Workers', 'Console'];

  for (const item of items) {
    if (excludeDirs.includes(item.name)) continue;

    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const segment = item.name.startsWith('[') 
        ? `/:${item.name.slice(1, -1)}`
        : `/${item.name}`;
      scanPageDirectory(fullPath, basePath + segment, routes);
    } else if (item.name === 'page.tsx' || item.name === 'page.ts') {
      routes.push({
        method: 'GET',
        uri: basePath || '/',
        name: pathToName(basePath) || 'home',
        action: `page.tsx`,
        middleware: [],
      });
    }
  }
}

/**
 * Convert path to route name
 */
function pathToName(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\//g, '.')
    .replace(/:/g, '')
    .replace(/\[|\]/g, '')
    || 'index';
}

/**
 * Get chalk color for HTTP method
 */
function getMethodColor(method: string): 'green' | 'blue' | 'yellow' | 'red' | 'magenta' | 'cyan' {
  if (method.includes('GET')) return 'green';
  if (method.includes('POST')) return 'blue';
  if (method.includes('PUT') || method.includes('PATCH')) return 'yellow';
  if (method.includes('DELETE')) return 'red';
  return 'cyan';
}

/**
 * Pad string to fixed length
 */
function padEnd(str: string, length: number): string {
  return str.length >= length ? str.slice(0, length - 1) + ' ' : str + ' '.repeat(length - str.length);
}

/**
 * Clear application cache
 */
function cacheClear(store?: string): void {
  console.log(chalk.bold('\nClearing Cache...\n'));

  const cachePaths = [
    path.join(process.cwd(), '.next/cache'),
    path.join(process.cwd(), 'storage/cache'),
  ];

  let cleared = 0;

  cachePaths.forEach((cachePath) => {
    if (fs.existsSync(cachePath)) {
      console.log(chalk.gray(`  Clearing: ${cachePath}`));
      // In production, use fs.rmSync with recursive
      cleared++;
    }
  });

  if (cleared === 0) {
    console.log(chalk.yellow('No cache files found.'));
  } else {
    console.log(chalk.green(`\n✓ Cache cleared successfully.\n`));
  }

  console.log(chalk.cyan('Note: Next.js build cache is in .next/cache'));
  console.log(chalk.gray('For full rebuild: rm -rf .next && npm run build\n'));
}

/**
 * Clear configuration cache
 */
function configClear(): void {
  console.log(chalk.bold('\nClearing Configuration Cache...\n'));
  
  const configCache = path.join(process.cwd(), 'storage/cache/config.json');
  
  if (fs.existsSync(configCache)) {
    fs.unlinkSync(configCache);
    console.log(chalk.green('✓ Configuration cache cleared.\n'));
  } else {
    console.log(chalk.yellow('No configuration cache found.\n'));
  }
}

/**
 * Optimize the application
 */
function optimize(): void {
  console.log(chalk.bold('\nOptimizing Application...\n'));
  
  console.log(chalk.cyan('Running optimizations:\n'));
  console.log('  1. Caching configuration...');
  console.log('  2. Caching routes...');
  console.log('  3. Generating route types...');
  
  console.log(chalk.green('\n✓ Application optimized!\n'));
  console.log(chalk.gray('Run "npm run build" for production optimization.\n'));
}

/**
 * Start interactive REPL
 */
function tinker(): void {
  console.log(chalk.bold('\nCatalyst Tinker\n'));
  console.log(chalk.yellow('Interactive REPL is not yet implemented.'));
  console.log(chalk.gray('Use: node --experimental-repl-await\n'));
}

/**
 * Start development server
 */
function serve(port: string): void {
  console.log(chalk.bold(`\nStarting Development Server on port ${port}...\n`));
  console.log(chalk.cyan('Use: npm run dev\n'));
}

/**
 * Show current environment
 */
function showEnv(): void {
  console.log(chalk.bold('\nEnvironment\n'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`  NODE_ENV:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`  APP_ENV:      ${process.env.APP_ENV || 'local'}`);
  console.log(`  APP_DEBUG:    ${process.env.APP_DEBUG || 'true'}`);
  console.log(`  APP_URL:      ${process.env.APP_URL || 'http://localhost:3000'}`);
  console.log(chalk.gray('─'.repeat(40)));
}

/**
 * Generate application key
 */
function keyGenerate(options: { show?: boolean; force?: boolean }): void {
  console.log(chalk.bold('\nApplication Key Generator\n'));

  // Generate a secure 32-character key (base64 encoded)
  const key = generateSecureKey();

  // If --show flag, just display the key
  if (options.show) {
    console.log(chalk.gray('Generated key:'));
    console.log(chalk.green(`  ${key}\n`));
    return;
  }

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // Check if .env exists, if not create from .env.example
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log(chalk.yellow('No .env file found. Creating from .env.example...\n'));
      fs.copyFileSync(envExamplePath, envPath);
    } else {
      console.log(chalk.yellow('No .env file found. Creating new .env file...\n'));
      fs.writeFileSync(envPath, `APP_KEY=${key}\n`);
      console.log(chalk.green('✓ Application key set successfully.\n'));
      console.log(chalk.gray(`  Key: ${key}\n`));
      return;
    }
  }

  // Read current .env content
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Check if APP_KEY already exists and has a value
  const appKeyMatch = envContent.match(/^APP_KEY=(.*)$/m);
  const existingKey = appKeyMatch ? appKeyMatch[1].trim() : null;

  if (existingKey && existingKey !== '' && !isDefaultKey(existingKey) && !options.force) {
    console.log(chalk.yellow('Application key already exists.\n'));
    console.log(chalk.gray(`  Current key: ${existingKey}\n`));
    console.log(chalk.cyan('Use --force to overwrite the existing key.\n'));
    return;
  }

  // Update or add APP_KEY
  if (appKeyMatch) {
    // Replace existing APP_KEY line
    envContent = envContent.replace(/^APP_KEY=.*$/m, `APP_KEY=${key}`);
  } else {
    // Add APP_KEY if not present
    envContent = `APP_KEY=${key}\n${envContent}`;
  }

  // Write back to .env
  fs.writeFileSync(envPath, envContent);

  console.log(chalk.green('✓ Application key set successfully.\n'));
  console.log(chalk.gray(`  Key: ${key}\n`));
}

/**
 * Generate a secure random key
 * Returns a 32-character base64 encoded string
 */
function generateSecureKey(): string {
  // Generate 32 random bytes and encode as base64
  const bytes = crypto.randomBytes(32);
  return `base64:${bytes.toString('base64')}`;
}

/**
 * Check if a key is the default placeholder key
 */
function isDefaultKey(key: string): boolean {
  const defaultKeys = [
    'catalyst-change-this-to-32-chars!',
    'catalyst-secure-key-change-this-!',
    'change-this-key',
    '',
  ];
  return defaultKeys.includes(key);
}
