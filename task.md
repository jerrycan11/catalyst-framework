# Task: Build "Catalyst" - The Enterprise Next.js Framework

**Project Goal:** Construct an enterprise-grade, "Laravel-like" full-stack ecosystem on Next.js 15. The system must provide rigid architectural patterns, type-safety, and developer ergonomics matching mature backend frameworks.

**Tech Stack Lock:**
- **Core:** Next.js 15 (App Router) + React 19 + TypeScript 5.4
- **Data:** Drizzle ORM + SQLite (Dev) / PostgreSQL (Prod)
- **UI:** TailwindCSS 4 + Shadcn UI + Radix Primitives
- **Async:** Redis + BullMQ (Queue)
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest + Playwright

---

## Phase 1: Environment, Configuration & Foundation
- [x] **Project Initialization**:
    - [x] Scaffold Next.js application (`npx create-next-app`).
    - [x] **Package Management & Scripts**:
        - [x] Install `concurrently` for multi-process dev server.
        - [x] Script `dev:catalyst`: Boot Next.js + Worker Process + Schedule Runner.
        - [x] Script `db:reboot`: Drop all tables -> Migrate -> Seed.
        - [x] Script `test:all`: Run Units + Features + Types Check.
- [x] **Strict Configuration Architecture**:
    - [x] **Config Service (`app/Services/Config.ts`)**:
        - [x] Implement `Singleton` pattern for immutable config access.
        - [x] `get(key: string, default: any)`: Dot-notation access (e.g., `app.name`).
        - [x] `has(key: string)`: Boolean check.
    - [x] **Configuration Files (`config/*.ts`)**:
        - [x] `app.ts`:
            - [x] Keys: `name`, `env`, `debug`, `url`, `timezone`, `locale`, `fallback_locale`, `key` (encryption), `cipher`.
        - [x] `database.ts`:
            - [x] Keys: `default` (connection name), `connections` (dictionary of driver options), `migrations` (table name).
        - [x] `filesystems.ts`:
            - [x] Keys: `default` (disk), `disks` (local, s3, public).
        - [x] `logging.ts`:
            - [x] Keys: `default`, `channels` (stack, single, daily, slack).
- [x] **Design System & Assets**:
    - [x] **Token System**:
        - [x] Define `catalyst-primary`, `catalyst-secondary`, `catalyst-accent` in Tailwind.
        - [x] Map semantic colors: `catalyst-success`, `catalyst-danger`, `catalyst-warning`, `catalyst-info`.
    - [x] **Shadcn Integration**:
        - [x] Install core: `button`, `input`, `label`, `card`, `toast`, `dropdown-menu`, `avatar`, `table`, `dialog`, `sheet`.
        - [x] Create `components/ui/loader.tsx`: Global loading state component.

## Phase 2: The Kernel (Container & Request Lifecycle)
- [x] **Service Container (`app/Core/Container.ts`)**:
    - [x] **Core Logic**:
        - [x] `bindings`: Map<string, Closure>.
        - [x] `instances`: Map<string, object> (Singletons).
        - [x] `aliases`: Map<string, string>.
    - [x] **Methods**:
        - [x] `bind(abstract, concrete, shared: boolean)`: Register a dependency.
        - [x] `singleton(abstract, concrete)`: Register a shared dependency.
        - [x] `make(abstract, parameters)`: Resolve a dependency recursively.
        - [x] `instance(abstract, instance)`: Bind an existing object.
- [x] **Request Context (`app/Core/Context.ts`)**:
    - [x] Implement `AsyncLocalStorage` store.
    - [x] Store Interface: `{ user: User | null, requestId: string, segment: string }`.
    - [x] Middleware: `InitializeContext` (runs first, sets up storage).
- [x] **The Middleware Pipeline (`app/Core/Pipeline.ts`)**:
    - [x] **Pattern**: "Onion" architecture (Request -> Middleware 1 -> Middleware 2 -> Core -> Response).
    - [x] `Middleware` Interface: `handle(request, next): Response`.
    - [x] `send(passable)`: Set object being passed.
    - [x] `through(pipes[])`: Set middleware stack.
    - [x] `then(destination)`: Execute the final core logic.
- [x] **Global Middleware Stack**:
    - [x] `TrustProxies`: Handle `X-Forwarded-*` headers.
    - [x] `TrimStrings`: Recursively trim input data.
    - [x] `ConvertEmptyStringsToNull`: Normalize input.
    - [x] `VerifyCsrfToken`: Validate `X-XSRF-TOKEN` against logic (if cookie based).

## Phase 3: The Catalyst CLI (Developer Experience)
- [x] **Binary Engine (`bin/catalyst`)**:
    - [x] Entry Point: `#!/usr/bin/env node`.
    - [x] Library: `commander` + `inquirer` (for prompts) + `chalk` (for styling).
    - [x] `app`: Bootstrap the framework kernel without HTTP layer (Console Kernel).
- [x] **Code Generators (`make:*`)**:
    - [x] **`make:controller {name}`**:
        - [x] Flag `--api`: Excludes `create` and `edit` methods.
        - [x] Flag `--invokable`: Generates single `__invoke` method.
        - [x] Flag `--resource`: Generates standard CRUD methods.
    - [x] **`make:model {name}`**:
        - [x] Flag `--migration` (-m): Create schema file.
        - [x] Flag `--factory` (-f): Create factory file.
        - [x] Flag `--seeder` (-s): Create seeder file.
        - [x] Flag `--all` (-a): Do all of the above.
    - [x] **`make:provider {name}`**:
        - [x] Stub: `register()` and `boot()` methods.
- [x] **Database Operations**:
    - [x] `migrate:status`: Show pending vs ran migrations.
    - [x] `db:show`: Display table structure in CLI.
    - [x] `model:prune`: remove models no longer needed (advanced).
- [x] **Utilities**:
    - [x] `route:list`:
        - [x] Columns: `Method`, `URI`, `Name`, `Action`, `Middleware`.
        - [x] Filter: `--method=GET`, `--name=users`.
    - [x] `cache:clear`: Flush Redis/File cache.

## Phase 4: Database, ORM & Active Record Wrapper
- [x] **Connection Factory**:
    - [x] Support `Replica` configuration (Read/Write definitions).
    - [x] Lazy connection establishment.
- [x] **The Model Class (`app/Models/Model.ts`)**:
    - [x] **Properties**:
        - [x] `protected table`: String.
        - [x] `protected primaryKey`: String (default 'id').
        - [x] `protected fillable`: string[] (Mass assignment protection).
        - [x] `protected hidden`: string[] (JSON serialization filtering).
        - [x] `protected casts`: Record<string, string> (int, float, json, datetime).
    - [x] **Query Scopes**:
        - [x] `scopeActive(query)`: Helper for `where('active', 1)`.
    - [x] **Events (Lifecycle Hooks)**:
        - [x] `static booting()` / `static booted()`.
        - [x] `Model.creating(cb)`, `Model.updated(cb)`, `Model.deleted(cb)`.
- [x] **Relationship Engine**:
    - [x] `hasOne(Related, foreignKey, localKey)`.
    - [x] `hasMany(Related, foreignKey, localKey)`.
    - [x] `belongsTo(Related, foreignKey, ownerKey)`.
    - [x] `belongsToMany(Related, pivotTable, foreignKey, relatedByKey)`.
    - [x] `with(relations[])`: Eager loading resolver (stub).

## Phase 5: Security, Auth & Access Control
- [x] **Authentication System**:
    - [x] **Authentication Manager**:
        - [x] `guard(name)`: Swappable strategies (Web/Session vs API/Token).
    - [x] **Session Guard**:
        - [x] `attempt(credentials, remember)`: Validate + Login.
        - [x] `loginUsingId(id)`: Force login.
        - [x] `logout()`: Invalidate session + Regenerate Token.
    - [x] **Password Broker**:
        - [x] `sendResetLink(credentials)`: Email logic.
        - [x] `reset(credentials, callback)`: Token validation + Password update.
- [x] **Authorization (ACL)**:
    - [x] **Gate**: Closure based checks (`Gate.define('update-post', fn)`).
    - [x] **Policies**: Class based checks mapping to Models (`PostPolicy`).
    - [x] **Middleware**: `Can:update-post` middleware integration.
- [x] **Data Validation (`app/Http/Requests`)**:
    - [x] **Standard Rules**:
        - [x] `required`, `nullable`, `string`, `integer`, `boolean`.
        - [x] `email`, `url`, `ip`, `uuid`.
        - [x] `min:val`, `max:val`, `between:min,max`.
        - [x] `in:foo,bar`, `not_in:foo,bar`.
        - [x] `unique:table,column`, `exists:table,column`.
    - [x] **FormRequest Lifecycle**:
        - [x] Detects `ValidationException`.
        - [x] Flashes errors to Session.
        - [x] Redirects back to `previousUrl()` with input.

## Phase 6: Frontend Bridge (The "Inertia" Protocol)
- [x] **Server-Side Adapter**:
    - [x] `Inertia::render(component, props)`.
    - [x] `Inertia::share(key, value)`: Global prop injection (User, Flash).
    - [x] `Inertia::location(url)`: External redirect.
- [x] **Client-Side Props**:
    - [x] `FlashMessage` Type: `{ success?: string, error?: string, warning?: string }`.
    - [x] `PageProps` Interface: `{ auth: { user: User }, jetstream: any, errors: Record<string, string> }`.
- [x] **Named Routing (Ziggy Port)**:
    - [x] **Route Payload**: JSON blob of all route definitions injected into `<head>`.
    - [x] **Helper**: `route(name, params, absolute)`.
        - [x] Validates route existence.
        - [x] Replaces dynamic segments `/users/{id}`.
        - [x] Appends query string for extra params.

## Phase 7: Async Services (Queues & Schedules)
- [x] **Queue Worker**:
    - [x] **Architecture**: Independent Node.js process.
    - [x] `app/Jobs/Job.ts`:
        - [x] property `tries`: Max retries.
        - [x] property `timeout`: Max seconds.
        - [x] property `backoff`: Seconds to wait before retry.
    - [x] **Dispatching**:
        - [x] `Job.dispatch(payload)`: Serializes payload to JSON -> Redis.
        - [x] `Job.dispatch(payload).delay(seconds)`.
        - [x] `Job.dispatch(payload).onQueue('high')`.
- [x] **Task Scheduler (`app/Console/Kernel.ts`)**:
    - [x] **Frequency Helpers**:
        - [x] `everyMinute()`, `hourly()`, `daily()`.
        - [x] `weeklyOn(day, time)`, `monthly()`.
    - [x] **Outputs**:
        - [x] `appendOutputTo(file)`.
        - [x] `emailOutputTo(email)` (On failure).
    - [x] **Maintenance Mode**:
        - [x] `down`: Put app in 503 mode.
        - [x] `up`: Bring app online.

## Phase 8: Testing & Quality Assurance
- [x] **Testing Architecture**:
    - [x] **Unit Tests (`tests/Unit`)**: Isolated class testing.
    - [x] **Feature Tests (`tests/Feature`)**: HTTP request/response testing.
- [x] **Test Helpers (`TestCase`)**:
    - [x] `actingAs(user, guard)`: Impersonate.
    - [x] `seed(class)`: Run seeder.
    - [x] `assertDatabaseHas(table, data)`.
    - [x] `assertDatabaseMissing(table, data)`.
    - [x] `assertRedirect(uri)`.
    - [x] `assertSessionHasErrors(keys)`.
- [x] **Mocking**:
    - [x] `Storage::fake('s3')`: Swap disk for in-memory array.
    - [x] `Queue::fake()`: Prevent jobs from actually running.
    - [x] `Event::fake()`: Assert events were dispatched without running listeners.

---

## Phase 9: Ecosystem Expansion
- [x] **Socialite Finalization**:
    - [x] `SocialLogin` Action: "Find or Create" user logic.
    - [x] `Socialite::stateless()` support.
- [x] **Automated Policies (CLI)**:
    - [x] `make:policy <name>` command.
    - [x] `--model` option support (scaffold CRUD methods).

## Phase 10: Catalyst UI & Developer Experience
- [x] **Multi-Step Wizard Component**:
    - [x] `Wizard` container with state management.
    - [x] `WizardStep` and control buttons.
- [x] **Telescope Lite (DevTools)**:
    - [x] `/_catalyst` Dashboard Route.
    - [x] Tabs: Routes, Config, Logs.
    - [x] Secured by local environment check.

## Phase 11: Experimental (Roadmap)
- [ ] **Scout Bridge**: Abstract driver interface.
- [ ] **Cashier Bridge**: Abstract subscription interface.

