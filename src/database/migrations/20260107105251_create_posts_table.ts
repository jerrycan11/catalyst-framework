/**
 * Migration: create_posts_table
 * 
 * Creates the posts table.
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  // Add your columns here
  // name: text('name').notNull(),
  // email: text('email').notNull().unique(),
  // status: text('status').default('active'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type PostsRecord = typeof posts.$inferSelect;
export type NewPostsRecord = typeof posts.$inferInsert;
