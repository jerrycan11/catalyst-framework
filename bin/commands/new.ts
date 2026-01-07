/**
 * Catalyst CLI - New Command
 * 
 * Creates a new project from the Catalyst framework.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Register the new command
 */
export function registerNewCommand(program: Command): void {
  program
    .command('new <name>')
    .description('Create a new Catalyst project')
    .action(async (name) => {
      await createNewProject(name);
    });
}

/**
 * Create a new project
 */
async function createNewProject(name: string): Promise<void> {
  const targetDir = path.isAbsolute(name) ? name : path.join(process.cwd(), name);
  const sourceDir = path.resolve(__dirname, '../../'); // Root of the framework

  console.log(chalk.gray(`  Source: ${sourceDir}`));
  console.log(chalk.gray(`  Target: ${targetDir}`));

  console.log(chalk.cyan(`\nCreating a new Catalyst project: ${chalk.bold(name)}...`));
  
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Error: Directory ${name} already exists.`));
    process.exit(1);
  }

  try {
    // 1. Create target directory
    fs.mkdirSync(targetDir, { recursive: true });

    // 2. Identify files to copy
    const itemsToCopy = [
      'bin',
      'config',
      'data',
      'docs',
      'public',
      'src',
      'tests',
      '.catalyst',
      '.agent',
      '.env.example',
      '.gitignore',
      'AI_GUIDE.md',
      'AI_INDEX.md',
      'README.md',
      'drizzle.config.ts',
      'eslint.config.mjs',
      'next.config.ts',
      'package.json',
      'playwright.config.ts',
      'postcss.config.mjs',
      'tsconfig.json',
      'vitest.config.ts'
    ];

    console.log(chalk.gray('  Copying framework files...'));

    for (const item of itemsToCopy) {
      const srcPath = path.join(sourceDir, item);
      const destPath = path.join(targetDir, item);

      // Skip if the source path is the target directory itself
      if (srcPath === targetDir) {
        continue;
      }

      if (fs.existsSync(srcPath)) {
        if (fs.lstatSync(srcPath).isDirectory()) {
          copyRecursiveSync(srcPath, destPath, targetDir);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    // 3. Create .env from .env.example
    const envExample = path.join(targetDir, '.env.example');
    const envFile = path.join(targetDir, '.env');
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envFile);
      console.log(chalk.gray('  Created .env from .env.example'));
    }

    // 4. Update package.json name
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.name = name;
      pkg.version = '0.1.0';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log(chalk.gray(`  Updated package.json name to "${name}"`));
    }

    console.log(chalk.green('\n✓ Project created successfully!'));
    
    console.log(chalk.cyan('\nNext steps:'));
    console.log(`  cd ${name}`);
    console.log('  npm install');
    console.log('  npm run dev\n');

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\nFailed to create project: ${errorMsg}`));
    process.exit(1);
  }
}

/**
 * Recursive copy
 */
function copyRecursiveSync(src: string, dest: string, targetDir: string) {
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      const childSrc = path.join(src, childItemName);
      const childDest = path.join(dest, childItemName);
      
      // Skip the target directory itself to prevent infinite recursion
      if (childSrc === targetDir) {
        return;
      }
      
      copyRecursiveSync(childSrc, childDest, targetDir);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
