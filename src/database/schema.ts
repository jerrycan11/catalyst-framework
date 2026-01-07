/**
 * Catalyst Database Schema
 * 
 * Central schema definition file for Drizzle ORM.
 * All table definitions should be imported and re-exported here.
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ==================== USERS TABLE ====================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  email_verified_at: integer('email_verified_at', { mode: 'timestamp' }),
  password: text('password'), // Optional for social users
  github_id: text('github_id').unique(),
  google_id: text('google_id').unique(),
  avatar: text('avatar'),
  remember_token: text('remember_token'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

// ==================== PASSWORD RESET TOKENS ====================

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  email: text('email').primaryKey(),
  token: text('token').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type PasswordResetTokenRecord = typeof passwordResetTokens.$inferSelect;

// ==================== SESSIONS TABLE ====================

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  payload: text('payload').notNull(),
  last_activity: integer('last_activity').notNull(),
});

export type SessionRecord = typeof sessions.$inferSelect;
export type NewSessionRecord = typeof sessions.$inferInsert;

// ==================== JOBS TABLE (Queue) ====================

export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  queue: text('queue').notNull().default('default'),
  payload: text('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  reserved_at: integer('reserved_at', { mode: 'timestamp' }),
  available_at: integer('available_at', { mode: 'timestamp' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type JobRecord = typeof jobs.$inferSelect;
export type NewJobRecord = typeof jobs.$inferInsert;

// ==================== FAILED JOBS TABLE ====================

export const failedJobs = sqliteTable('failed_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull().unique(),
  connection: text('connection').notNull(),
  queue: text('queue').notNull(),
  payload: text('payload').notNull(),
  exception: text('exception').notNull(),
  failed_at: integer('failed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type FailedJobRecord = typeof failedJobs.$inferSelect;

// ==================== CACHE TABLE ====================

export const cache = sqliteTable('cache', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  expiration: integer('expiration').notNull(),
});

export type CacheRecord = typeof cache.$inferSelect;

// ==================== MIGRATIONS TABLE ====================

export const migrations = sqliteTable('catalyst_migrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  migration: text('migration').notNull(),
  batch: integer('batch').notNull(),
});

export type MigrationRecord = typeof migrations.$inferSelect;
