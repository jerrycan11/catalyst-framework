#!/usr/bin/env node
/**
 * Catalyst CLI Wrapper
 * 
 * This script allows running the TypeScript CLI using tsx.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptPath = path.join(__dirname, 'catalyst.ts');
const tsxPath = path.join(__dirname, '../node_modules/.bin/tsx');

if (!fs.existsSync(tsxPath)) {
  console.error('Error: tsx not found in node_modules. Please run npm install.');
  process.exit(1);
}

const result = spawnSync(tsxPath, [scriptPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

process.exit(result.status);
