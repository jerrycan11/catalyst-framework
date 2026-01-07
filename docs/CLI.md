# Catalyst CLI Reference

Complete reference for all Catalyst CLI commands.

## Usage

```bash
npx catalyst <command> [options]
# or
npx tsx bin/catalyst.ts <command> [options]
```

---

## Table of Contents

- [Project Commands](#project-commands)
- [Code Generation Commands](#code-generation-commands)
- [Database Commands](#database-commands)
- [Utility Commands](#utility-commands)

---

## Project Commands

### `new`

Create a new Catalyst project.

```bash
npx catalyst new <project-name>
```

**Example:**
```bash
npx catalyst new my-app
cd my-app
npm install
npm run dev
```

---

## Code Generation Commands

All `make:*` commands generate boilerplate code following framework conventions.

### `make:controller`

Create a new controller class.

```bash
npx catalyst make:controller <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--api` | Generate API controller (excludes create/edit methods) |
| `--resource` | Generate resource controller with full CRUD methods |
| `--invokable` | Generate single-action controller with `__invoke` method |

**Examples:**
```bash
npx catalyst make:controller UserController
npx catalyst make:controller PostController --resource
npx catalyst make:controller Api/ProductController --api
npx catalyst make:controller SendNewsletterController --invokable
```

**Output:** `src/backend/Http/Controllers/<Name>Controller.ts`

---

### `make:model`

Create a new model class with optional related files.

```bash
npx catalyst make:model <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `-m, --migration` | Also create a migration file |
| `-f, --factory` | Also create a factory file |
| `-s, --seeder` | Also create a seeder file |
| `-a, --all` | Create migration, factory, and seeder |

**Examples:**
```bash
npx catalyst make:model Post
npx catalyst make:model Product -m        # with migration
npx catalyst make:model User -mfs         # with migration, factory, seeder
npx catalyst make:model Order --all       # all related files
```

**Output:**
- `src/backend/Models/<Name>.ts`
- `src/database/migrations/<timestamp>_create_<table>_table.ts` (if -m)
- `src/database/factories/<Name>Factory.ts` (if -f)
- `src/database/seeders/<Name>Seeder.ts` (if -s)

---

### `make:middleware`

Create a new middleware class.

```bash
npx catalyst make:middleware <name>
```

**Example:**
```bash
npx catalyst make:middleware RateLimitMiddleware
npx catalyst make:middleware Admin
```

**Output:** `src/backend/Http/Middleware/<Name>Middleware.ts`

---

### `make:request`

Create a new form request validation class with Zod schema.

```bash
npx catalyst make:request <name>
```

**Example:**
```bash
npx catalyst make:request StoreUserRequest
npx catalyst make:request UpdatePostRequest
```

**Output:** `src/backend/Http/Requests/<Name>Request.ts`

---

### `make:job`

Create a new job class for queue processing.

```bash
npx catalyst make:job <name>
```

**Example:**
```bash
npx catalyst make:job SendWelcomeEmailJob
npx catalyst make:job ProcessPaymentJob
```

**Output:** `src/backend/Jobs/<Name>Job.ts`

---

### `make:migration`

Create a new database migration file.

```bash
npx catalyst make:migration <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--create <table>` | Create a new table |
| `--table <table>` | Modify an existing table |

**Examples:**
```bash
npx catalyst make:migration create_products_table --create products
npx catalyst make:migration add_status_to_orders --table orders
npx catalyst make:migration update_user_roles
```

**Output:** `src/database/migrations/<timestamp>_<name>.ts`

---

### `make:notification`

Create a new notification class.

```bash
npx catalyst make:notification <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--mail` | Generate mail notification |
| `--markdown` | Generate markdown email notification with template |

**Examples:**
```bash
npx catalyst make:notification OrderShippedNotification
npx catalyst make:notification WelcomeNotification --mail
npx catalyst make:notification InvoiceNotification --markdown
```

**Output:**
- `src/backend/Notifications/<Name>Notification.ts`
- `src/resources/views/emails/<name>.md` (if --markdown)

---

### `make:command`

Create a new custom CLI command.

```bash
npx catalyst make:command <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--signature <sig>` | Custom command signature (default: derived from name) |

**Examples:**
```bash
npx catalyst make:command SyncUsersCommand
npx catalyst make:command CleanupCommand --signature "cleanup:old-records"
```

**Output:** `src/backend/Console/Commands/<Name>Command.ts`

---

### `make:provider`

Create a new service provider class.

```bash
npx catalyst make:provider <name>
```

**Example:**
```bash
npx catalyst make:provider PaymentServiceProvider
npx catalyst make:provider SearchServiceProvider
```

**Output:** `src/backend/Providers/<Name>ServiceProvider.ts`

---

### `make:policy`

Create a new authorization policy class.

```bash
npx catalyst make:policy <name> [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `-m, --model <model>` | The model the policy applies to |

**Examples:**
```bash
npx catalyst make:policy PostPolicy
npx catalyst make:policy OrderPolicy --model Order
```

**Output:** `src/backend/Policies/<Name>Policy.ts`

---

## Database Commands

### `migrate`

Run all pending database migrations.

```bash
npx catalyst migrate
```

> **Note:** Catalyst uses Drizzle Kit for migrations. For schema changes, use `npm run db:push`.

---

### `migrate:status`

Show the status of each migration.

```bash
npx catalyst migrate:status
```

**Output:**
```
Migration Status
────────────────────────────────────────────
  Status   │ Migration
────────────────────────────────────────────
  Pending  │ 20240115_create_users_table
  Pending  │ 20240116_create_posts_table
────────────────────────────────────────────
  Total: 2 migration(s)
```

---

### `migrate:rollback`

Rollback the last batch of migrations.

```bash
npx catalyst migrate:rollback [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--step <number>` | Number of migrations to rollback (default: 1) |

**Example:**
```bash
npx catalyst migrate:rollback
npx catalyst migrate:rollback --step 3
```

---

### `db:show`

Display table structure from migrations.

```bash
npx catalyst db:show [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--table <name>` | Show specific table structure |

**Examples:**
```bash
npx catalyst db:show              # List all tables
npx catalyst db:show --table users  # Show users table structure
```

---

### `db:seed`

Seed the database with records.

```bash
npx catalyst db:seed [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--class <name>` | Run specific seeder class |

**Examples:**
```bash
npx catalyst db:seed                    # Run all seeders
npx catalyst db:seed --class UserSeeder # Run specific seeder
```

---

### `model:prune`

Prune soft-deleted models past retention period.

```bash
npx catalyst model:prune [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--model <name>` | Prune specific model |
| `--dry-run` | Preview without deleting |

**Examples:**
```bash
npx catalyst model:prune
npx catalyst model:prune --model Order --dry-run
```

---

## Utility Commands

### `key:generate`

Generate a new application encryption key and set it in `.env`.

```bash
npx catalyst key:generate [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--show` | Display key without modifying `.env` |
| `--force` | Overwrite existing key |

**Examples:**
```bash
npx catalyst key:generate           # Generate and save to .env
npx catalyst key:generate --show    # Just display a new key
npx catalyst key:generate --force   # Overwrite existing key
```

**Generated key format:**
```
APP_KEY=
```

---

### `route:list`

List all registered routes.

```bash
npx catalyst route:list [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--method <method>` | Filter by HTTP method (GET, POST, etc.) |
| `--name <name>` | Filter by route name |
| `--path <path>` | Filter by path pattern |

**Examples:**
```bash
npx catalyst route:list
npx catalyst route:list --method POST
npx catalyst route:list --path api/users
```

**Output:**
```
Route List
────────────────────────────────────────────────────────────────
Method      URI                                 Name                Action
────────────────────────────────────────────────────────────────
GET         /                                   home                page.tsx
GET|POST    /api/auth/callback/:provider        api.auth.callback   route.ts
POST        /api/register                       api.register        route.ts
POST        /api/log                            api.log             route.ts
────────────────────────────────────────────────────────────────
  Total: 4 route(s)
```

---

### `cache:clear`

Flush the application cache.

```bash
npx catalyst cache:clear [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--store <store>` | Clear specific cache store |

**Example:**
```bash
npx catalyst cache:clear
npx catalyst cache:clear --store redis
```

---

### `config:clear`

Remove the configuration cache file.

```bash
npx catalyst config:clear
```

---

### `optimize`

Cache configuration and routes for faster loading.

```bash
npx catalyst optimize
```

---

### `env`

Display the current environment configuration.

```bash
npx catalyst env
```

**Output:**
```
Environment
────────────────────────────────────────
  NODE_ENV:     development
  APP_ENV:      local
  APP_DEBUG:    true
  APP_URL:      http://localhost:3000
────────────────────────────────────────
```

---

### `serve`

Start the development server.

```bash
npx catalyst serve [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--port <port>` | Port to run on (default: 3000) |

> **Note:** Prefer using `npm run dev` for development.

---

### `tinker`

Start an interactive REPL session.

```bash
npx catalyst tinker
```

> **Note:** Currently not fully implemented. Use `node --experimental-repl-await` as alternative.

---

## Custom Commands

You can create custom commands that are automatically loaded from `src/backend/Console/Commands/`.

### Creating a Custom Command

```bash
npx catalyst make:command MyCustomCommand
```

### Command Structure

```typescript
// src/backend/Console/Commands/MyCustomCommand.ts
import { Command } from 'commander';

export class MyCustomCommand {
  public signature = 'my:custom';
  public description = 'Description of what my:custom does';

  register(program: Command): void {
    program
      .command(this.signature)
      .description(this.description)
      .option('-v, --verbose', 'Enable verbose output')
      .action((options) => {
        this.handle(options);
      });
  }

  async handle(options: { verbose?: boolean }): Promise<void> {
    // Command logic here
  }
}

export default new MyCustomCommand();
```

### Running Custom Commands

```bash
npx catalyst my:custom
npx catalyst my:custom --verbose
```

---

## NPM Scripts Reference

These npm scripts are available in `package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Run database seeders |
| `npm run worker` | Start background job worker |
| `npm run schedule` | Start task scheduler |

---

## Environment Variables

Key environment variables for CLI operations:

```env
# Application
APP_NAME=Catalyst
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:3000
APP_KEY=

# Database
DB_CONNECTION=sqlite
DB_DATABASE=./data/catalyst.db

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

Generate the `APP_KEY` using:
```bash
npx catalyst key:generate
```
