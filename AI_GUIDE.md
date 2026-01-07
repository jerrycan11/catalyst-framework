# Catalyst Project Structure Guide for AI Agents

This document defines the strict directory structure and file placement rules for the Catalyst project. All AI agents contributing to this project MUST follow these rules to maintain a clean separation between Frontend and Backend logic, mimicking the Laravel architecture.

## Core Philosophy
The project enforces a strict separation of concerns:
- **`src/app/`**: **ROUTING ONLY**. Contains the entry point `[[...path]]/page.tsx` and `layout.tsx`.
- **`src/backend/`**: **BACKEND LOGIC**. Services, Models, Actions, Jobs, Console Commands.
- **`src/resources/`**: **FRONTEND ASSETS & VIEWS**. Components, Pages, Styles, Hooks, Routes Config.

## Directory Structure

### 1. `src/app/` (Routing)
This directory is **ONLY** for Next.js App Router entry points.
- **`[[...path]]/page.tsx`**: The Single Catch-All Router.
- **`layout.tsx`**: The Root Layout Shell.
- **NO OTHER FILES ALLOWED HERE.**

### 2. `src/backend/` (Application Core)
This directory contains all Business Logic and Server-Side code.
- **`Services/`**: Business logic (e.g., `Auth.ts`, `Session.ts`).
- **`Models/`**: Database models (Drizzle schemas) and Types.
- **`Http/`**: Middleware, Requests.
- **`actions/`**: Server Actions used by Frontend.
- **`Console/`**: CLI commands and schedulers.
- **`Jobs/`**, **`Workers/`**: Background jobs and Queues.
- **`Core/`**: Framework utilities and Kernel.

**Import Path**: `@/backend/Services/Name`, `@/backend/Models/Name`

### 3. `src/resources/` (User Interface)
This directory contains all **strictly frontend** code.
- **`views/`**: Full Page Components (e.g., `views/auth/LoginPage.tsx`).
- **`routes/`**: Route Definitions (`web.tsx`).
- **`components/`**: React components (UI Kit, Blocks).
- **`lib/`**: Frontend utilities (e.g., `cn`, formatters).
- **`hooks/`**: Custom React hooks.
- **`css/`**: Global styles (`globals.css`).

**Import Path**: `@/resources/views/Name`, `@/resources/components/Name`

## Logic vs View Separation
1.  **Backend Logic** NEVER goes into `src/resources`.
2.  **Frontend Logic/UI** NEVER goes into `src/backend`.
3.  **Routes** are defined in `src/resources/routes/web.tsx` and map generic paths to Views.

## Placement Decision Tree

1.  **Is it a Service, Model, Job, or Server Action?** -> `src/backend/`
2.  **Is it a React Component or Page View?** -> `src/resources/`
3.  **Is it a Helper Function?**
    *   Backend logic? -> `src/backend/Core` or `src/backend/Services`
    *   UI formatter? -> `src/resources/lib`
4.  **Is it a CLI Command?** -> `src/backend/Console/`
5.  **Is it a Route definition?** -> `src/resources/routes/web.tsx`

## Maintenance
If you find a component sitting in `src/app`, **it is in the wrong place**.
If you find backend logic in `src/app`, **move it** to `src/backend`.
