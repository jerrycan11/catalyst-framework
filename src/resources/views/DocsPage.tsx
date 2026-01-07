'use client';

import Link from 'next/link';
import { useState } from 'react';

const sidebarSections = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', slug: 'introduction', icon: '📖' },
      { label: 'Installation', slug: 'installation', icon: '⚡' },
      { label: 'Quick Start', slug: 'quick-start', icon: '🚀' },
      { label: 'Directory Structure', slug: 'directory-structure', icon: '📁' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { label: 'Service Container', slug: 'service-container', icon: '📦' },
      { label: 'Request Lifecycle', slug: 'request-lifecycle', icon: '🔄' },
      { label: 'Middleware', slug: 'middleware', icon: '🛡️' },
      { label: 'Configuration', slug: 'configuration', icon: '⚙️' },
    ],
  },
  {
    title: 'Database',
    items: [
      { label: 'Models', slug: 'models', icon: '🗃️' },
      { label: 'Migrations', slug: 'migrations', icon: '📊' },
      { label: 'Relationships', slug: 'relationships', icon: '🔗' },
      { label: 'Query Builder', slug: 'query-builder', icon: '🔍' },
    ],
  },
  {
    title: 'Security',
    items: [
      { label: 'Authentication', slug: 'authentication', icon: '🔐' },
      { label: 'Authorization', slug: 'authorization', icon: '✅' },
      { label: 'Validation', slug: 'validation', icon: '📝' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { label: 'Queue System', slug: 'queue', icon: '📡' },
      { label: 'Task Scheduling', slug: 'scheduling', icon: '⏰' },
      { label: 'Testing', slug: 'testing', icon: '🧪' },
    ],
  },
];

const docContent: Record<string, { title: string; content: string }> = {
  // ... (Introduction, Installation, Quick Start kept as were, but re-included for completeness if needed. 
  // actually I will include them to match the replacement target range)
  introduction: {
    title: 'Introduction',
    content: `
# Introduction to Catalyst

Catalyst is an enterprise-grade Next.js framework that brings the elegance and developer experience of Laravel to the modern React ecosystem.

## Why Catalyst?

Building enterprise applications requires more than just a UI library. You need:

- **Structured Architecture** - Clear patterns for organizing your code
- **Dependency Injection** - Testable, loosely-coupled components
- **Database Abstraction** - Type-safe ORM with relationships
- **Authentication & Authorization** - Multi-guard auth with policies
- **Background Processing** - Queue system for async jobs

Catalyst provides all of this while leveraging the power of Next.js 15, React 19, and TypeScript.

## Key Features

### 🏗️ Service Container
A powerful IoC container with dependency injection, singleton management, and automatic resolution.

### 🗃️ Active Record ORM
Laravel-like models wrapping Drizzle ORM, complete with relationships, scopes, and lifecycle events.

### 🔐 Multi-Guard Authentication
Session and JWT-based authentication with password resets and remember tokens.

### 🛡️ Authorization with Gates & Policies
Define abilities at the gate level or encapsulate them in policy classes.

### ⚡ CLI Code Generators
Generate controllers, models, migrations, and more with a single command.

### 📡 Queue System
Background job processing with delays, retries, and multiple queue support.
    `,
  },
  installation: {
    title: 'Installation',
    content: `
# Installation

Get started with Catalyst in just a few minutes.

## Requirements

- Node.js 18.17 or later
- npm, yarn, or pnpm

## Quick Installation

\`\`\`bash
npx create-catalyst-app my-project
cd my-project
npm run dev
\`\`\`

## Manual Installation

If you prefer to set up Catalyst manually:

\`\`\`bash
# Clone the starter template
git clone https://github.com/catalyst/starter my-project
cd my-project

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run migrations
npm run catalyst migrate

# Start development server
npm run dev
\`\`\`

## Configuration

After installation, configure your application:

1. Update \`.env\` with your database credentials
2. Set your \`APP_KEY\` for encryption
3. Configure your cache and queue drivers

\`\`\`env
APP_NAME=MyCatalystApp
APP_ENV=development
APP_KEY=base64:your-32-character-key-here
APP_DEBUG=true
APP_URL=http://localhost:3000

DB_CONNECTION=sqlite
DB_DATABASE=./data/database.sqlite
\`\`\`
    `,
  },
  'quick-start': {
    title: 'Quick Start',
    content: `
# Quick Start Guide

Build your first Catalyst application in 5 minutes.

## Step 1: Create a Model

\`\`\`bash
npm run catalyst make:model Post --migration
\`\`\`

This creates:
- \`src/backend/Models/Post.ts\` - The model class
- \`src/database/migrations/xxxx_create_posts_table.ts\` - Migration file

## Step 2: Define the Schema

Edit your migration file:

\`\`\`typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
\`\`\`

## Step 3: Run Migration

\`\`\`bash
npm run catalyst migrate
\`\`\`

## Step 4: Create a Controller

\`\`\`bash
npm run catalyst make:controller PostController --resource
\`\`\`

## Step 5: Build Your UI

Create a page at \`src/resources/views/posts/Index.tsx\`:

\`\`\`tsx
import { Container } from '@/backend/Core/Container';

export default async function PostsPage() {
  const posts = await Container.make('PostService').all();
  
  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
\`\`\`
    `,
  },
  'directory-structure': {
    title: 'Directory Structure',
    content: `
# Directory Structure

Catalyst enforces a strict separation of concerns, mimicking the Laravel architecture but adapted for Next.js.

## 1. \`src/app/\` (Routing Only)
This directory is strictly for Next.js App Router entry points.
- **\`[[...path]]/page.tsx\`**: The Single Catch-All Router that delegates to the Catalyst routing system.
- **\`layout.tsx\`**: The Root Layout Shell.
- **No business logic or UI components should exist here.**

## 2. \`src/backend/\` (Application Core)
This directory contains all Business Logic and Server-Side code.
- **\`Services/\`**: Business logic classes (e.g., \`Auth.ts\`, \`Session.ts\`).
- **\`Models/\`**: Database models (Active Record wrappers around Drizzle).
- **\`Http/\`**: Middleware, Requests, and Controllers.
- **\`actions/\`**: Server Actions used by Frontend.
- **\`Console/\`**: CLI commands and schedulers.
- **\`Jobs/\`**: Background jobs and Queue workers.
- **\`Core/\`**: Framework utilities and Kernel.

## 3. \`src/resources/\` (User Interface)
This directory contains all strictly frontend code.
- **\`views/\`**: Full Page Components mapped to routes.
- **\`routes/\`**: Route Definitions (\`web.tsx\`).
- **\`components/\`**: Reusable React components (UI Kit, Blocks).
- **\`lib/\`**: Frontend utilities (e.g., class mergers).
- **\`hooks/\`**: Custom React hooks.
- **\`css/\`**: Global styles.

## Summary
- **Logic** goes to \`src/backend\`.
- **UI** goes to \`src/resources\`.
- **Routing** starts in \`src/app\` but is defined in \`src/resources/routes/web.tsx\`.
    `,
  },
  'service-container': {
    title: 'Service Container',
    content: `
# Service Container

The Service Container is a powerful tool for managing class dependencies and performing dependency injection.

## Binding

Bind interfaces to implementations in your AppServiceProvider:

\`\`\`typescript
Container.bind('PaymentGateway', StripePaymentGateway);
\`\`\`

## Resolving

Resolve dependencies anywhere in your backend code:

\`\`\`typescript
const payment = Container.make('PaymentGateway');
\`\`\`

## Singletons

\`\`\`typescript
Container.singleton('Config', ConfigService);
\`\`\`

The Container automatically handles circular dependencies and manages the lifecycle of your services.
    `,
  },
  'request-lifecycle': {
    title: 'Request Lifecycle',
    content: `
# Request Lifecycle

Understanding how Catalyst handles a request is key to mastering the framework.

1.  **Entry Point**: Next.js receives the request at \`src/app/[[...path]]/page.tsx\`.
2.  **Kernel Boot**: The application Kernel initializes (Environment, Config).
3.  **Routing**: Catalyst matches the URL against \`src/resources/routes/web.tsx\`.
4.  **Middleware**: The Middleware pipeline executes (Auth, CSRF, Validation).
5.  **Controller/Action**: The matched route's component or controller is invoked.
6.  **Rendering**: The React component is rendered (Server Side) or hydrated (Client Side).
7.  **Response**: The HTML is sent back to the browser.
    `,
  },
  'middleware': {
    title: 'Middleware',
    content: `
# Middleware

Middleware provide a convenient mechanism for inspecting and filtering HTTP requests entering your application.

## Defining Middleware

Middleware are located in \`src/backend/Http/Middleware\`.

\`\`\`typescript
export async function ensureAdmin(request: Request, next: NextFunction) {
    if (!Auth.user()?.isAdmin) {
        throw new ForbiddenException();
    }
    return next();
}
\`\`\`

## Registering Middleware

Register middleware in \`src/backend/Http/Kernel.ts\`:

\`\`\`typescript
protected routeMiddleware = {
    'auth': AuthMiddleware,
    'admin': EnsureAdmin,
};
\`\`\`
    `,
  },
  'configuration': {
    title: 'Configuration',
    content: `
# Configuration

Configuration files are stored in the \`config/\` directory.

## Accessing Configuration

You can access configuration values using the \`Config\` service:

\`\`\`typescript
import { Config } from '@/backend/Services/Config';

const appName = Config.get('app.name');
const dbHost = Config.get('database.connections.mysql.host');
\`\`\`

## Environment Variables

Always use \`.env\` file for sensitive data and refer to them in your config files using \`process.env\`.
    `,
  },
  'models': {
    title: 'Models',
    content: `
# Models

Catalyst provides an Active Record implementation on top of Drizzle ORM.

## Defining Models

\`\`\`typescript
import { Model } from '@/backend/Models/Model';

export class User extends Model {
    static table = 'users';
    
    // Relationships
    posts() {
        return this.hasMany(Post);
    }
}
\`\`\`

## Retrieving Models

\`\`\`typescript
const users = await User.where('active', true).get();
const user = await User.find(1);
\`\`\`

## Creating & Updating

\`\`\`typescript
const user = await User.create({ name: 'John', email: 'john@example.com' });

user.name = 'John Doe';
await user.save();
\`\`\`
    `,
  },
  'migrations': {
    title: 'Migrations',
    content: `
# Migrations

Migrations are like version control for your database.

## Creating Migrations

\`\`\`bash
npm run catalyst make:migration create_users_table
\`\`\`

## Structure

Catalyst uses Drizzle Kit for migrations.

\`\`\`typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});
\`\`\`

## Running Migrations

\`\`\`bash
npm run catalyst migrate
\`\`\`
    `,
  },
  'relationships': {
    title: 'Relationships',
    content: `
# Relationships

Tables are often related to one another. Catalyst makes managing these relationships easy.

## Supported Relationships

- **HasOne**
- **HasMany**
- **BelongsTo**
- **BelongsToMany**

## Defining Relationships

\`\`\`typescript
class User extends Model {
    posts() {
        return this.hasMany(Post);
    }
}
\`\`\`

## Querying Relations

\`\`\`typescript
const user = await User.with('posts').find(1);
    
// Access loaded relationship
console.log(user.posts); 
\`\`\`
    `,
  },
  'query-builder': {
    title: 'Query Builder',
    content: `
# Query Builder

Catalyst provides a fluent interface for building database queries.

## Basics

\`\`\`typescript
const users = await DB.table('users')
    .where('votes', '>', 100)
    .orderBy('name')
    .get();
\`\`\`

## Joins

\`\`\`typescript
const users = await DB.table('users')
    .leftJoin('posts', 'users.id', '=', 'posts.user_id')
    .get();
\`\`\`

The Query Builder is backed by Drizzle ORM for type safety and performance.
    `,
  },
  'authentication': {
    title: 'Authentication',
    content: `
# Authentication

Catalyst provides a complete authentication system out of the box.

## Guards

- **Session**: Standard cookie-based auth for your frontend.
- **Token**: API token authentication (JWT or Database).

## Usage

\`\`\`typescript
import { Auth } from '@/backend/Services/Auth';

if (await Auth.attempt({ email, password })) {
    // Login success
    return redirect('/dashboard');
}
\`\`\`

## Accessing User

\`\`\`typescript
const user = Auth.user();
\`\`\`
    `,
  },
  'authorization': {
    title: 'Authorization',
    content: `
# Authorization

Control access to resources using Gates and Policies.

## Gates

\`\`\`typescript
Gate.define('edit-settings', (user) => {
    return user.isAdmin;
});

if (Gate.allows('edit-settings')) {
    // ...
}
\`\`\`

## Policies

Generate a policy:
\`\`\`bash
npm run catalyst make:policy PostPolicy
\`\`\`

Register it in \`AuthServiceProvider\`, then use it:

\`\`\`typescript
if (user.can('update', post)) {
    // ...
}
\`\`\`
    `,
  },
  'validation': {
    title: 'Validation',
    content: `
# Validation

Catalyst uses Zod for robust data validation, but wraps it in a Laravel-like API.

## Form Requests

\`\`\`typescript
const data = await request.validate({
    title: 'required|min:5',
    email: 'required|email|unique:users',
});
\`\`\`

## Validator

\`\`\`typescript
const validator = Validator.make(input, {
    name: 'required',
});

if (validator.fails()) {
    // ...
}
\`\`\`
    `,
  },
  'queue': {
    title: 'Queue System',
    content: `
# Queue System

Offload slow tasks to background workers using BullMQ.

## Creating Jobs

\`\`\`bash
npm run catalyst make:job ProcessPodcast
\`\`\`

## Dispatching Jobs

\`\`\`typescript
await ProcessPodcast.dispatch(podcastId);
\`\`\`

## Delayed Dispatch

\`\`\`typescript
await ProcessPodcast.dispatch(podcastId).delay(10 * 60); // 10 mins
\`\`\`

## Running Workers

\`\`\`bash
npm run catalyst queue:work
\`\`\`
    `,
  },
  'scheduling': {
    title: 'Task Scheduling',
    content: `
# Task Scheduling

Define cron jobs in your code, not in your server configuration.

## Defining Schedules

In \`src/backend/Console/Kernel.ts\`:

\`\`\`typescript
protected schedule(schedule: Schedule) {
    schedule.command('emails:send').dailyAt('13:00');
    schedule.job(new BackupDatabase).everyHour();
}
\`\`\`

## Running the Scheduler

Set up a single cron entry on your server:
\`\`\`bash
* * * * * cd /path-to-project && npm run catalyst schedule:run
\`\`\`
    `,
  },
  'testing': {
    title: 'Testing',
    content: `
# Testing

Catalyst is built with testing in mind, using Vitest and Playwright.

## Unit Tests

\`\`\`typescript
test('basic test', () => {
    expect(2 + 2).toBe(4);
});
\`\`\`

## Feature Tests

\`\`\`typescript
test('can view dashboard', async () => {
    const user = await User.factory().create();
    
    const response = await this.actingAs(user).get('/dashboard');
    
    response.assertStatus(200);
});
\`\`\`

## Running Tests

\`\`\`bash
npm test
\`\`\`
    `,
  },
};

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentDoc = docContent[activeDoc] || docContent.introduction;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <span className="text-xl">⚗️</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Catalyst</span>
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">Documentation</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search docs..."
                className="w-64 px-4 py-2 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <a 
              href="https://github.com/catalyst"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="relative flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
          <div className="p-6 space-y-8">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.slug}>
                      <button
                        onClick={() => setActiveDoc(item.slug)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                          activeDoc === item.slug
                            ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-500'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed left-4 bottom-4 z-50 p-3 rounded-full bg-violet-600 shadow-lg shadow-violet-500/25 hover:bg-violet-500 transition-colors md:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Document Content */}
            <article className="prose prose-invert prose-violet max-w-none">
              <div className="mb-8 pb-8 border-b border-white/10">
                <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {currentDoc.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Last updated: January 7, 2026</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
              </div>

              {/* Render markdown-like content */}
              <div className="space-y-6 text-slate-300 leading-relaxed">
                {currentDoc.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-white mt-8">{line.slice(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-white mt-6">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-white mt-4">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4">{line.slice(2)}</li>;
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  return <p key={index}>{line}</p>;
                })}
              </div>
            </article>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                Next
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
