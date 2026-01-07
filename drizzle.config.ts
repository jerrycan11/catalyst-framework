import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_DATABASE || './data/catalyst.db',
  },
  verbose: true,
  strict: true,
});
