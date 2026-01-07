# AI Knowledge Index

## Index 001: Task List Expansion
- **Request:** Expand task list to include features and details for "Catalyst" framework.
- **Solution Components:** 
    - Analyzed goal: "Laravel-like structure for Next.js".
    - Expanded into 8 detailed phases covering Architecture, CLI, ORM, Auth, Frontend, and Testing.
    - Added specific Laravel "emulation" items like Service Container, FormRequest, and Facades.
- **Time/Resource:** Low (Planning & Documentation).
- **Date:** 2026-01-07

## Index 002: Catalyst Framework Roadmap
- **Request:** Create detailed generic architectural roadmap for Next.js "Laravel-wrapper".
- **Solution Components:**
    - **Service Container:** Decided on `AsyncLocalStorage` for Request-Scoped logic in Next.js.
    - **CLI:** Selected `commander.js` for `bin/catalyst`.
    - **ORM:** Wrapping Drizzle with an Active Record `Model` class.
    - **Routing:** Plan includes `Ziggy-js` style named routes for React.
    - **Expansion:** Converted high-level phases into granular, stub-level implementation tasks.
    - **Deep Dive (3x Expansion):** Added detailed sub-tasks for specific Methods, Flags, Config Keys, and Testing assertions.
    - **Atomic Level:** Replaced abstract tasks with Pseudo-Code logic, File Path definitions, and dependency lists.
- **Complexity:** Extreme (Atomic-Level Implementation Guide).
- **Date:** 2026-01-07

## Index 003: Catalyst Framework Full Implementation
- **Request:** Complete all 8 phases of Catalyst framework from task.md
- **Solution Components:**
    - **Phase 1 - Foundation:**
        - Scaffolded Next.js 15 with TypeScript, Tailwind CSS 4, ESLint
        - Created comprehensive package.json with all dependencies (Drizzle, BullMQ, Zod, Vitest, Playwright)
        - Built Config Service with Singleton pattern and dot-notation access
        - Created config files: app.ts, database.ts, filesystems.ts, logging.ts
        - Implemented full Design System with Catalyst color tokens and Tailwind v4 @theme
        - Created 10 Shadcn UI components: Button, Input, Label, Card, Loader, Toast, DropdownMenu, Avatar, Table, Dialog, Sheet
    
    - **Phase 2 - Kernel:**
        - Service Container with bind/singleton/make/instance methods and circular dependency detection
        - Request Context using AsyncLocalStorage with user, requestId, segment, flash, errors
        - Middleware Pipeline with Onion architecture pattern
        - Global Middleware: TrustProxies, TrimStrings, ConvertEmptyStringsToNull, VerifyCsrfToken, InitializeContext
    
    - **Phase 3 - CLI:**
        - Created bin/catalyst CLI entry point with Commander.js
        - make commands: controller, model, provider, middleware, request, job
        - db commands: migrate:status, migrate, migrate:rollback, db:show, db:seed, model:prune
        - utility commands: route:list, cache:clear, config:clear, optimize, tinker, serve, env
    
    - **Phase 4 - Database/ORM:**
        - Database Connection Factory with read/write replica support
        - Drizzle ORM schema with users, sessions, jobs, failed_jobs, cache, migrations tables
        - Base Model class with fillable/guarded, hidden/visible, casts, lifecycle events
        - Relationship stubs: hasOne, hasMany, belongsTo, belongsToMany
    
    - **Phase 5 - Security/Auth:**
        - AuthManager with guard switching (session, api)
        - SessionGuard with attempt, login, loginUsingId, logout
        - TokenGuard with JWT generation/verification using jose
        - PasswordBroker for password resets
        - Gate with abilities, policies, before/after hooks
        - Policy base class with viewAny, view, create, update, delete, restore, forceDelete
        - Can middleware for route authorization
        - FormRequest with Zod validation and Laravel-style error formatting
        - 20+ validation rules: required, email, url, uuid, min, max, between, in, unique, exists, etc.
    
    - **Phase 6 - Frontend Bridge:**
        - Inertia-like class with share, render, location, lazy, defer methods
        - PageProps interface with auth, flash, errors
        - Router class with Ziggy-style named routing
        - route() helper with parameter replacement and query string building
    
    - **Phase 7 - Async Services:**
        - Job base class with tries, timeout, backoff properties
        - Fluent dispatch API: Job.dispatch(payload).delay(seconds).onQueue('high')
        - Console Kernel with Task Scheduler
        - Frequency helpers: everyMinute, hourly, daily, weekly, monthly, cron
        - Schedule Event with appendOutputTo, emailOutputTo, withoutOverlapping
        - Worker runner as independent Node.js process
        - Schedule runner for cron-like task execution
    
    - **Phase 8 - Testing:**
        - TestCase base class with actingAs, seed, database assertions
        - FeatureTestCase with HTTP helpers: get, post, put, patch, delete
        - Response assertions: assertStatus, assertOk, assertRedirect, assertJson
        - Mocking utilities: Storage.fake, Queue.fake, Event.fake
        - Vitest configuration with coverage
        - Playwright configuration for E2E testing
        - Example unit test (ConfigTest) and feature test (AuthenticationTest)
        - Example E2E test (home.spec.ts)

- **Key Architecture Decisions:**
    - Used AsyncLocalStorage for request-scoped context (no global state)
    - Drizzle ORM for type-safe database operations
    - Zod for validation with Laravel-style rule naming
    - Jose for JWT handling (Edge-compatible)
    - Commander.js for CLI with chalk for styling
    - Radix UI primitives for accessible components

- **Files Created:** 50+ TypeScript files across src/, config/, bin/, tests/
- **Complexity:** Extreme (Full Framework Implementation)
- **Build Verification:** ✅ TypeScript compiles, Next.js builds successfully
- **Date:** 2026-01-07

## Index 004: Landing Page Redesign
- **Request:** Improve landing page with better UI, vibrant colors, smooth transitions, 100% width, and project information.
- **Solution Components:**
    - **Visual Design:**
        - Dark gradient background with animated floating orbs (purple, blue, cyan)
        - Glassmorphism navigation bar with backdrop blur
        - 100% full-width viewport layout with no content constraints
        - Curated color palette using vibrant gradients (violet, purple, pink, cyan)
        - Grid pattern overlay for visual depth
    
    - **Page Sections:**
        - **Hero**: Animated gradient text headlines, pulsing badge indicator, dual CTA buttons
        - **Stats**: 4 key metrics with hover effects and gradient backgrounds
        - **Features**: 6 feature cards with icon gradients, hover animations, and glassmorphism
        - **Architecture**: Split layout with code preview window and numbered architecture points
        - **Tech Stack**: Animated pill badges for all technologies
        - **CTA**: Gradient bordered card with glow effects
        - **Footer**: Full navigation with social icons and links
    
    - **Animations & Transitions:**
        - Fade-in on page load using `useSyncExternalStore` for hydration-safe mounting
        - Staggered reveal animations on scroll (via transition delays)
        - Hover scale/rotate effects on feature icons
        - Smooth transitions on all interactive elements (300-500ms)
        - Animated gradient backgrounds with pulse effects
        - Bounce animation on scroll indicator
    
    - **SEO Enhancements:**
        - Title: "Catalyst | Enterprise Next.js Framework"
        - Meta description with keywords
        - Open Graph tags for social sharing
        - Twitter card configuration
        - Theme color meta tags for light/dark mode
        - Proper heading hierarchy (single h1)
    
    - **Technical Implementation:**
        - Client component with `'use client'` directive
        - `useSyncExternalStore` hook for hydration-safe client detection (avoids useEffect lint warnings)
        - CSS custom properties for theming
        - Additional keyframe animations: float, glow, shimmer, shake, gradient-shift

- **Files Modified:** 
    - `src/app/page.tsx`: Complete redesign (~400 lines)
    - `src/app/layout.tsx`: Enhanced metadata and viewport settings
    - `src/app/globals.css`: Added 5 new keyframe animations
- **Complexity:** High (Premium UI Implementation)
- **Build Verification:** ✅ Dev server running, page serving correctly
- **Date:** 2026-01-07

## Index 005: Landing Page Link Fix & New Pages
- **Request:** Fix broken buttons and URLs on landing page that were empty or returning 404
- **Solution Components:**
    - **Pages Created:**
        - `/login` - Login page with email/password form, social login buttons (GitHub, Google), glassmorphic design
        - `/register` - Registration page with name/email/password/confirm fields, terms agreement
        - `/dashboard` - Full admin dashboard with sidebar navigation, stats grid, activity feed, quick actions
        - `/docs` - Interactive documentation page with sidebar, searchable sections, markdown-like content
        - `/privacy` - Privacy Policy page with full legal content sections
        - `/terms` - Terms of Service page with legal sections
        - `/forgot-password` - Password reset request page with success confirmation
    
    - **Links Updated in Landing Page:**
        - Footer "Documentation", "Changelog", "Roadmap" → `/docs`
        - Footer "Blog", "Tutorials", "Examples" → `/docs`
        - Footer "Community" → `https://discord.gg/catalyst`
        - Footer "Privacy" → `/privacy`
        - Footer "Terms" → `/terms`
        - Social icons → Proper external URLs (GitHub, Twitter, Discord)
    
    - **Design Consistency:**
        - All pages share the same dark gradient background
        - Glassmorphism cards with backdrop-blur
        - Consistent violet/purple gradient accent colors
        - Smooth hover transitions on all interactive elements

- **Files Created:** 
    - `src/app/login/page.tsx` (~170 lines)
    - `src/app/register/page.tsx` (~165 lines)
    - `src/app/dashboard/page.tsx` (~230 lines)
    - `src/app/docs/page.tsx` (~300 lines)
    - `src/app/privacy/page.tsx` (~115 lines)
    - `src/app/terms/page.tsx` (~115 lines)
    - `src/app/forgot-password/page.tsx` (~130 lines)
- **Files Modified:**
    - `src/app/page.tsx`: Updated footer links to point to new pages
- **Build Verification:** ✅ All pages returning HTTP 200 OK
- **Date:** 2026-01-07

## Index 006: Compliance Implementation (WCAG 2.2, APP, ISO 27001)
- **Request:** Check WCAG 2.2, Australian Privacy Principles, and ISO 27001 compliance. Fix issues and add implementation guidelines for AI and human developers.
- **Solution Components:**
    
    ### Documentation Created:
    - **`.agent/workflows/compliance-check.md`**: Comprehensive workflow for verifying compliance during development
    - **`docs/compliance/WCAG_2_2_GUIDELINES.md`**: Complete WCAG 2.2 AA guidelines with code examples covering:
        - All 4 principles (Perceivable, Operable, Understandable, Robust)
        - New WCAG 2.2 success criteria (Target Size, Dragging Movements, Accessible Authentication)
        - Component requirements and testing checklists
    - **`docs/compliance/AUSTRALIAN_PRIVACY_PRINCIPLES.md`**: Full APP compliance covering:
        - All 13 Australian Privacy Principles with implementation examples
        - Notifiable Data Breaches (NDB) scheme requirements
        - Cross-border disclosure documentation template
        - Privacy policy required sections
    - **`docs/compliance/ISO_27001_GUIDELINES.md`**: Information security guidelines including:
        - Security headers configuration
        - Authentication and session management
        - Input validation and output encoding
        - Data protection and encryption
        - Logging and incident response
    - **`docs/compliance/COMPLIANCE_CHECKLIST.md`**: Master checklist combining all three standards
    
    ### Components Created:
    - **`src/components/ui/accessibility.tsx`**: WCAG-compliant accessibility utilities:
        - `<SkipLink />` - Bypass blocks navigation
        - `<VisuallyHidden />` - Screen reader only content
        - `<Announce />` - Live region for status messages
        - `<FocusTrap />` - Modal focus management
        - `useReducedMotion()` - Motion preference hook
        - `<FormFieldWrapper />` - Accessible form fields
        - `<HeadingLevelProvider />`, `<Section />`, `<Heading />` - Automatic heading hierarchy
    - **`src/components/ui/cookie-consent.tsx`**: APP-compliant cookie consent:
        - Four cookie categories (Necessary, Analytics, Marketing, Preferences)
        - Granular consent management
        - `useCookieConsent()` hook for checking consent status
    
    ### Configuration Updates:
    - **`next.config.ts`**: ISO 27001 security headers added:
        - Content-Security-Policy
        - Strict-Transport-Security (HSTS)
        - X-Frame-Options (SAMEORIGIN)
        - X-Content-Type-Options (nosniff)
        - X-XSS-Protection
        - Referrer-Policy
        - Permissions-Policy
    - **`src/app/layout.tsx`**: Added SkipLink component and main landmark
    - **`src/app/globals.css`**: WCAG 2.2 enhancements:
        - `prefers-reduced-motion` media query
        - Enhanced focus-visible styles
        - Touch target size for coarse pointers
        - High contrast mode support
        - Print styles
    
    ### Privacy Policy Update:
    - **`src/app/privacy/page.tsx`**: Complete rewrite with APP compliance:
        - All 13 APP sections covered
        - Notifiable Data Breaches procedures
        - Cross-border disclosure table
        - Access and correction rights
        - Complaint process and OAIC contact
        - Cookie policy section
        - ARIA landmarks and proper heading hierarchy
        - **`src/app/privacy/page.tsx`**: Complete rewrite with APP compliance:
        - All 13 APP sections covered
        - Notifiable Data Breaches procedures
        - Cross-border disclosure table
        - Access and correction rights
        - Complaint process and OAIC contact
        - Cookie policy section
        - ARIA landmarks and proper heading hierarchy

- **Compliance Notes:**
    - WCAG 2.2 AA: Framework now includes all required accessibility patterns
    - Australian Privacy Principles: Privacy policy fully compliant with all 13 APPs
    - ISO 27001: Security headers and development guidelines implemented
    
- **Files Created:** 9 new files (4 documentation, 2 components, 1 workflow)
- **Files Modified:** 5 files (next.config.ts, layout.tsx, globals.css, privacy/page.tsx, bin/catalyst.ts)
- **Build Verification:** ✅ TypeScript compiles, Next.js builds successfully
- **Complexity:** High (Multi-standard Compliance Implementation)
- **Date:** 2026-01-07
    
## Index 008: Project Structure Segregation & Laravel Alignment
- **Request:** Strictly segregate Backend to `src/app` and Frontend Assets to `src/resources`, mirroring Laravel architecture fully. Remove Pages from `src/app`.
- **Solution:**
    - **Virtual Routing**: Implemented a "Catalyst Router" using Next.js `[[...path]]` catch-all route.
    - **Deleted**: `src/app/login`, `src/app/dashboard`, `src/app/register`, etc. were DELETED.
    - **Created**: `src/resources/routes/web.tsx` which maps URL paths to Components.
    - **Consolidated `src/backend/`**: Moved all backend logic (`Services`, `Models`, `Console`, `Jobs`, `actions`) to `src/backend/` as app folder is for routing only.
    - **Governance**: Updated `AI_GUIDE.md` to reinforce that `src/app` is for Routing Only, `src/backend` is for Logic, and `src/resources` is for UI.
- **Complexity:** High (Custom Routing Engine)
- **Build Verification:** ✅ TypeScript passed `typecheck`.
- **Date:** 2026-01-07

## Index 009: Runtime Fix - Client Component Invocation
- **Request:** Fix runtime error "Attempted to call the default export ... from the server" for Client Components in CatchAllRoute.
- **Root Cause:** The `CatchAllRoute` in `src/app/[[...path]]/page.tsx` was calling `route.component()` as a function. This works for Server Components but throws a "Module Reference" error for Client Components (which cannot be invoked on the server).
- **Solution:**
    - Refactored `CatchAllRoute` to use JSX syntax `<Component />` instead of function invocation `Component()`.
    - This allows Next.js to properly handle Client References by rendering the instruction to load them on the client.
    - Updated `route.component` and `route.layout` types to be cast as `React.ElementType` to satisfy TypeScript.
- **Files Modified:** `src/app/[[...path]]/page.tsx`
- **Complexity:** Low (Bug Fix)
- **Time:** 10 mins
- **Date:** 2026-01-07
## Index 010: Theme Compatibility & Light Mode Support
- **Request:** Ensure proper Light Mode support and fix "can't see difference" issue.
- **Root Cause:** 
    - Hardcoded dark theme classes (e.g., `bg-slate-950`) were forcing dark mode.
    - Missing `suppressHydrationWarning` on `html` tag caused hydration mismatches with `next-themes`.
- **Solution:**
    - **Installed `next-themes`**: Added robust theme management avoiding FOUC and hydration issues.
    - **Created `ThemeProvider`**: Configured with `attribute="class"` strategy.
    - **Created `ThemeToggle`**: UI component with Sun/Moon icons for manual switching.
    - **Refactored Views**: Updated `LandingPage`, `LoginPage`, `RegisterPage` with `dark:` modifiers (e.g., `bg-indigo-50/50 dark:bg-slate-950`).
    - **Hydration Fix**: Added `suppressHydrationWarning` to `src/resources/views/layouts/RootLayout.tsx`.
- **Files Modified:** `RootLayout.tsx`, `LandingPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `globals.css`
- **Files Created:** `src/resources/components/providers/ThemeProvider.tsx`, `src/resources/components/ui/ThemeToggle.tsx`
- **Complexity:** Medium (UI/UX)
- **Date:** 2026-01-07

## Index 011: Documentation & Governance Updates
- **Request:** Update all guides and frontend documentation page (`/docs`) to reflect recent architectural changes (app vs resources vs backend).
- **Solution:**
    - **DocsPage Refactor**: Populated 15+ missing sections in `src/resources/views/DocsPage.tsx` including "Directory Structure", "Service Container", "Models", "Middleware", etc.
    - **Structure Clarity**: Docs now explicitly explain the `src/app` (Router), `src/backend` (Logic), `src/resources` (View) separation.
    - **Verified Guides**: Confirmed `AI_GUIDE.md` aligns with strict separation rules.
- **Files Modified:** `src/resources/views/DocsPage.tsx`
- **Complexity:** Medium (Documentation)
- **Date:** 2026-01-07

## Index 012: Registration Flow Implementation
- **Request:** Fix mock registration redirecting to login without creating user, causing login failure.
- **Solution:**
    - **API Route:** Created `src/app/api/register/route.ts` to handle real user creation with duplicate email checks and password hashing.
    - **Database:** Initialized `users` table in SQLite via `drizzle-kit push`.
    - **Frontend:** Updated `RegisterPage.tsx` to use the API and wait for success (200 OK) before redirecting to login.
    - **Logic:** Registration now properly persists data, enabling successful login.
- **Files Modified:** `src/resources/views/auth/RegisterPage.tsx`
- **Files Created:** `src/app/api/register/route.ts`
- **Complexity:** Medium (Backend Logic & Database)
- **Date:** 2026-01-07
## Index 013: CLI Global Command & Project Generation
- **Request:** Create a command to link Catalyst framework with npm and enable `catalyst new <project-name>` in any directory.
- **Solution:**
    - **Global Linking:** Used `npm link` to register the `catalyst` binary defined in `package.json`.
    - **CLI Implementation:** Verified `bin/catalyst.ts` correctly registers `new <name>` command.
    - **Robust Recursion Fix:** Patched `bin/commands/new.ts` to identify and skip the target directory during recursive copying. This prevents infinite recursion errors (ENAMETOOLONG) when creating a project inside a subdirectory of the framework (e.g., in `data/`).
    - **Path Resolution:** Updated command to handle absolute paths and correctly resolve the framework source path regardless of where the command is executed.
- **Complexity:** Medium (CLI & File System)
- **Time:** 20 mins
- **Date:** 2026-01-08

## Index 014: Framework Comparison & Research
- **Request:** Study Laravel framework and its addon packages. Compare with the project and create detailed report of difference.
- **Solution Components:**
    - **Philosophical Alignment:** Documented the mapping of Laravel concepts (Service Container, Middleware, Models) to the Catalyst Next.js implementation.
    - **Equivalence Mapping:** Created a detailed breakdown of Laravel first-party packages (Sanctum, Horizon, Inertia) vs. Catalyst internal services.
    - **Report Generation:** Saved comprehensive report to `docs/reports/LARAVEL_COMPARISON.md`.
    - **Key Findings:** Highlighted Catalyst's Edge-compatibility and end-to-end type safety as primary differentiators over standard PHP-based Laravel.
- **Complexity:** Medium (Research & Documentation)
- **Time:** 15 mins
- **Date:** 2026-01-08

## Index 015: Telescope Logs & Real Data Connectivity
- **Request:** Add Logs view to Telescope, restrict access to local environment, and connect to real data.
- **Solution Components:**
    - **Backend Logger:** Added `getLogs` method to `Logger` service to parse and retrieve logs from file system.
    - **Environment Security:** Enforced environment check in `CatalystController` to restrict access to local development only (HTTP 403).
    - **Frontend Logs View:** Implemented "Logs" tab in Telescope dashboard with:
        - Real-time log fetching from backend.
        - Log level filtering (Error, Warning, Info, Debug).
        - Search functionality.
        - Expandable rows for Context and Error stack traces.
    - **Real Data:** Connected Telescope to actual log files and system metrics, replacing static placeholders for Logs.
- **Files Modified:** `src/backend/Services/Logger.ts`, `src/backend/Http/Controllers/CatalystController.ts`, `src/resources/views/catalyst/telescope/index.tsx`
- **Complexity:** Medium (Backend/Frontend Integration)
- **Time:** 15 mins
- **Date:** 2026-01-08

## Index 016: Codebase Audit & Test Configuration Fix
- **Request:** Perform through audit of project, find insights/bugs, and create report.
- **Solution Components:**
    - **Audit Report:** Created `AUDIT_REPORT.md` detailing architecture strengths, security posture, and critical findings.
    - **Critical Fix:** Identified and fixed a conflict between Vitest and Playwright.
        - `vitest.config.ts` was blindly including `tests/e2e` folder.
        - Excluded `tests/e2e` from Vitest to allow `npm test` to pass.
    - **Architecture Validation:** Confirmed strict adherence to "Laravel-in-Next.js" pattern (Virtual Router, Backend/Resources split).
    - **Security Review:** Validated ISO 27001 headers and Auth middleware. Identified minor UX gap in Telescope unauthorized state.
- **Files Created:** `AUDIT_REPORT.md`
- **Files Modified:** `vitest.config.ts`
- **Build Verification:** ✅ `npm test` now passes (16 tests).
- **Date:** 2026-01-08

## Index 017: Security Hardening & Build Fixes
- **Request:** Fix all findings from Audit Report (Telescope protection, Type safety, Build errors).
- **Solution Components:**
    - **Telescope Protection:**
        - Created `TelescopeGuard` layout middleware to redirect unauthorized users.
        - Implemented `Gate` policy `viewTelescope` in `AuthServiceProvider`.
        - Applied `gate.authorize()` check in `CatalystController`.
    - **Router Security:**
        - Added `middleware` support to `RouteConfig` in `src/resources/routes/web.tsx`.
        - Updated generic Router (`src/app/[[...path]]/page.tsx`) to execute `requireAuth()`/`requireGuest()` based on route config.
    - **Build Stabilization:**
        - Fixed `Model.ts` static method generic typing issues (`this` context).
        - Fixed `Auth.ts` nullable password check for social users.
        - Added `@ts-expect-error` for optional mail drivers (`nodemailer`, `@aws-sdk/client-ses`).
        - Fixed unused variables and arguments in Controllers.
- **Files Modified:** `Auth.ts`, `Model.ts`, `CatalystController.ts`, `web.tsx`, `page.tsx`, `SesDriver.ts`, `SmtpDriver.ts`.
- **Files Created:** `TelescopeGuard.tsx`, `AuthServiceProvider.ts`.
- **Build Verification:** ✅ `npm run build` passes. ✅ `npm test` passes.
- **Date:** 2026-01-08
