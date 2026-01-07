# 📊 Catalyst Framework vs. Laravel: Comprehensive Comparison Report

## 1. Executive Summary
Catalyst is an enterprise-grade framework built on **Next.js 15**, designed to emulate the architectural elegance and developer experience of **Laravel**. It adopts the separation of concerns, service-oriented architecture, and CLI-driven workflow that makes Laravel a standard for modern web development, while leveraging the performance and reactivity of the **TypeScript/React** ecosystem.

---

## 2. Architectural Comparison

### 🌍 Core Philosophy
| Feature | Laravel (PHP) | Catalyst (Next.js/TS) |
| :--- | :--- | :--- |
| **Language** | PHP 8.3+ (Strict) | TypeScript (Strict) |
| **Routing** | `routes/web.php` & `routes/api.php` | **Virtual Router**: [web.tsx](file:///Users/jp_mac/workplace/HIS/src/resources/routes/web.tsx) mapped via Catch-all route. |
| **Core Kernel** | `app/Http/Kernel.php` | [Kernel.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Core/Container.ts) & [Pipeline.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Core/Pipeline.ts) |
| **State** | Global `$app` / Facades | `AsyncLocalStorage` via [Context.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Core/Context.ts) |

### 📂 Directory Structure Alignment
Catalyst maps Laravel's directory structure to a Next.js context to maintain familiarity for Laravel developers:

*   **`app/` (Logic)** → [src/backend/](file:///Users/jp_mac/workplace/HIS/src/backend/)
*   **`app/Models/`** → [src/backend/Models/](file:///Users/jp_mac/workplace/HIS/src/backend/Models/)
*   **`config/`** → [config/](file:///Users/jp_mac/workplace/HIS/config/)
*   **`resources/views/`** → [src/resources/views/](file:///Users/jp_mac/workplace/HIS/src/resources/views/)
*   **`routes/`** → [src/resources/routes/](file:///Users/jp_mac/workplace/HIS/src/resources/routes/)
*   **`artisan`** → [bin/catalyst.ts](file:///Users/jp_mac/workplace/HIS/bin/catalyst.ts)

---

## 3. Service & Package Equivalence

### 🛡️ Authentication (Sanctum/Passport Equivalence)
Catalyst implements an [Auth Service](file:///Users/jp_mac/workplace/HIS/src/backend/Services/Auth.ts) that mimics Laravel's Guard system.
- **Session Guard**: Native stateful sessions via [Session.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Services/Session.ts).
- **Token Guard**: JWT-based stateless authentication using `jose`.

### 🗄️ Database & ORM (Eloquent Equivalence)
Catalyst uses **Drizzle ORM** as the engine but provides an **Active Record Wrapper** in [Model.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Models/Model.ts).
- **Lifecycle Events**: `creating`, `updated`, `deleting` hooks are implemented exactly like Eloquent.
- **Mass Assignment**: `fillable` and `guarded` properties are respected.

### ⛓️ Queues & Jobs (Horizon Equivalence)
Background processing is handled via **BullMQ** and **Redis**.
- **Worker Process**: [runner.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Workers/runner.ts) processes jobs asynchronously.
- **Fluent Dispatch**: `Job.dispatch(payload)` API mirrors Laravel's syntax.

### 📅 Task Scheduling (Artisan Schedule Equivalence)
A dedicated [scheduler.ts](file:///Users/jp_mac/workplace/HIS/src/backend/Console/scheduler.ts) runs every minute, checking for due tasks defined in the [Console Kernel](file:///Users/jp_mac/workplace/HIS/src/backend/Console/Kernel.ts).
- **Frequency Helpers**: `everyMinute()`, `dailyAt()`, `weekly()` are fully supported.

---

## 4. Ecosystem Comparison Table

| Laravel Feature/Package | Catalyst Implementation | Status |
| :--- | :--- | :--- |
| **Inertia.js** | [Inertia.ts Service](file:///Users/jp_mac/workplace/HIS/src/backend/Services/Inertia.ts) | ✅ **Full Support** |
| **Laravel Socialite** | [Socialite.ts Service](file:///Users/jp_mac/workplace/HIS/src/backend/Services/Socialite.ts) | ⚠️ **In Progress** |
| **Laravel Breeze/Jetstream** | Pre-built Views in `src/resources/views/auth` | ✅ **Implemented** |
| **Pest/PHPUnit** | **Vitest** for Unit/Feature, **Playwright** for E2E | ✅ **Configured** |
| **Laravel Scout** | TBD (Algolia/Meilisearch Bridge) | ❌ **Planned** |
| **Laravel Cashier** | TBD (Stripe Bridge) | ❌ **Planned** |

---

## 5. Implementation Differentiators

### 🚀 Performance & Deployment
- **Edge Compatibility**: Catalyst is designed to run on Vercel/Netlify Edge functions. While Laravel requires specialized runtimes (Octane), Catalyst is native to the Edge.
- **Type Safety**: Catalyst provides end-to-end type safety from the Database (Drizzle) to the React Components. Laravel (PHP) requires tools like Larastan or extensive DocBlocks to achieve similar rigor.

### 🛠️ The "Virtual Routing" Engine
Catalyst avoids the Next.js `app/` folder clutter by using a **Catch-all Route handler**. This allows:
1.  **Middleware Pipelines**: Run authentication and CORS checks *before* React hydration.
2.  **Shared Layouts**: Dynamically wrap pages in layouts defined in [web.tsx](file:///Users/jp_mac/workplace/HIS/src/resources/routes/web.tsx).

---

## 6. Future Roadmap Insights
To achieve 100% Laravel ecosystem parity, Catalyst should prioritize:
1.  **Catalyst UI (Component Library)**: Expand the Radix-based UI kit to include complex patterns like multi-step wizards.
2.  **Automated Policies**: Generate Drizzle-aware Access Control Policies via CLI.
3.  **Telescope for Next.js**: A dashboard to view logs, jobs, and query performance in real-time.

---
**Report Generated:** 2026-01-08
**Architect:** Antigravity AI
