#!/usr/bin/env node
/**
 * Catalyst CLI
 * 
 * Command-line interface for the Catalyst framework.
 * Provides code generation, database operations, and development utilities.
 * 
 * Usage:
 *   npx catalyst make:controller UserController --api
 *   npx catalyst make:model User -mfs
 *   npx catalyst migrate:status
 *   npx catalyst route:list
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// Import command handlers
import { registerMakeCommands } from './commands/make';
import { registerDbCommands } from './commands/db';
import { registerUtilityCommands } from './commands/utility';
import { registerNewCommand } from './commands/new';

const program = new Command();

// ASCII Art Banner
const banner = `
   ___      _        _           _   
  / __\\__ _| |_ __ _| |_   _ ___| |_ 
 / /  / _\` | __/ _\` | | | | / __| __|
/ /__| (_| | || (_| | | |_| \\__ \\ |_ 
\\____/\\__,_|\\__\\__,_|_|\\__, |___/\\__|
                       |___/         
`;

console.log(chalk.cyan(banner));
console.log(chalk.gray('Enterprise Next.js Framework\n'));

program
  .name('catalyst')
  .description('Catalyst CLI - Code generation and development utilities')
  .version('1.0.0');

// Register all command groups
registerMakeCommands(program);
registerDbCommands(program);
registerUtilityCommands(program);
registerNewCommand(program);

// Auto-load custom commands from src/backend/Console/Commands
async function loadCustomCommands(): Promise<void> {
  const commandsDir = path.join(process.cwd(), 'src/backend/Console/Commands');
  
  if (!fs.existsSync(commandsDir)) {
    return;
  }

  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    try {
      const commandPath = path.join(commandsDir, file);
      const commandModule = await import(commandPath);
      const command = commandModule.default;
      
      if (command && typeof command.register === 'function') {
        command.register(program);
      }
    } catch {
      // Silently skip commands that fail to load
      console.error(chalk.yellow(`Warning: Failed to load command ${file}`));
    }
  }
}

// Main execution
async function main() {
  await loadCustomCommands();
  
  // Parse arguments
  program.parse(process.argv);

  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main().catch(console.error);

