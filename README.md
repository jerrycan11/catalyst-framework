<![CDATA[<div align="center">
  <h1>⚗️ Catalyst</h1>
  <p><strong>Enterprise-Grade Next.js Framework with Laravel DX</strong></p>
  <p>Build like Laravel. Ship like Next.js.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---
## 🚀 Overview

**Catalyst** is an enterprise Next.js framework that brings Laravel's elegant developer experience to the React ecosystem. It provides a Service Container, Active Record ORM, CLI code generators, and enterprise patterns — all with TypeScript's full type safety.

### Why Catalyst?

- **Laravel Patterns** — Service Container, Middleware Pipeline, Gates & Policies
- **Type-Safe ORM** — Active Record models wrapping Drizzle ORM with relationships
- **CLI Generators** — Generate controllers, models, migrations, and more
- **Queue System** — Background job processing with BullMQ
- **Built-in Auth** — Multi-guard authentication with session & JWT support
- **Form Validation** — 20+ Zod-powered Laravel-style validation rules
- **Frontend Bridge** — Inertia-like rendering with Ziggy-style named routes

---

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (Turbopack) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **ORM** | Drizzle ORM |
| **Database** | SQLite (better-sqlite3) |
| **Queue** | BullMQ + Redis |
| **Validation** | Zod |
| **Testing** | Vitest + Playwright |
| **CLI** | Commander.js |

---

## 🏗️ Project Structure

Catalyst follows a Laravel-inspired architecture with strict separation of concerns:

```
src/
├── app/                    # Next.js Router (API Routes & Catch-All)
│   ├── api/                # REST API endpoints
│   └── [[...path]]/        # Virtual router catch-all
│
├── backend/                # Server-Side Logic (Laravel-like)
│   ├── Cache/              # Cache drivers (Redis, File)
│   ├── Console/            # CLI commands & scheduler
│   ├── Core/               # Service Container & Request Context
│   ├── Events/             # Event dispatcher & listeners
│   ├── Http/               # Controllers & Middleware
│   ├── Jobs/               # Queue jobs
│   ├── Mail/               # Mail drivers (SMTP, SES)
│   ├── Models/             # Active Record models
│   ├── Providers/          # Service providers
│   ├── Services/           # Business logic services
│   └── Workers/            # Queue & schedule runners
│
├── database/               # Database Layer
│   ├── migrations/         # Drizzle migrations
│   ├── schema/             # Table definitions
│   └── seeders/            # Database seeders
│
└── resources/              # Frontend Assets (Views & Components)
    ├── components/         # Reusable UI components
    ├── routes/             # Virtual route definitions
    └── views/              # Page components
        ├── auth/           # Login, Register, Forgot Password
        ├── dashboard/      # Dashboard pages
        ├── legal/          # Privacy, Terms
        └── layouts/        # Layout components
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Redis (for queue system)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/catalyst.git
cd catalyst

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### Development

```bash
# Start dev server with Turbopack
npm run dev

# Start with queue worker & scheduler
npm run dev:catalyst

# Open in browser
open http://localhost:3000
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:catalyst` | Dev server + worker + scheduler |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Vitest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run catalyst` | CLI commands |

---

## 🛠️ CLI Commands

Catalyst includes a powerful CLI inspired by Laravel's Artisan:

```bash
# Generate code
npm run catalyst make:controller UserController
npm run catalyst make:model Post
npm run catalyst make:middleware RateLimit
npm run catalyst make:job SendEmailJob
npm run catalyst make:request StoreUserRequest

# Database
npm run catalyst db:migrate
npm run catalyst db:migrate:status
npm run catalyst db:migrate:rollback
npm run catalyst db:seed

# Utilities
npm run catalyst route:list
npm run catalyst cache:clear
npm run catalyst config:clear
npm run catalyst optimize
npm run catalyst env
npm run catalyst serve
```

---

## 🔐 Authentication

Catalyst provides enterprise-grade authentication with multiple guards:

```typescript
// Session-based auth (web)
const user = await Auth.guard('web').attempt({
  email: 'user@example.com',
  password: 'secret',
});

// JWT auth (API)
const token = await Auth.guard('api').attempt(credentials);

// Check authentication
if (Auth.check()) {
  const user = Auth.user();
}

// Authorization with Gates
if (Gate.allows('update-post', post)) {
  // User can update
}
```

---

## 📋 Form Validation

Laravel-style validation powered by Zod:

```typescript
import { FormRequest, rules } from '@/backend/Http/FormRequest';

class StoreUserRequest extends FormRequest {
  rules() {
    return {
      name: rules.required().min(2).max(255),
      email: rules.required().email().unique('users', 'email'),
      password: rules.required().min(8).confirmed(),
      role: rules.required().in(['admin', 'user', 'guest']),
    };
  }

  messages() {
    return {
      'email.unique': 'This email is already registered.',
    };
  }
}
```

---

## 📨 Queue System

Background job processing with BullMQ:

```typescript
import { Job } from '@/backend/Jobs/Job';

class SendWelcomeEmail extends Job {
  static queue = 'emails';
  static tries = 3;
  static timeout = 30000;

  async handle(payload: { userId: string }) {
    const user = await User.find(payload.userId);
    await Mailer.send(new WelcomeEmail(user));
  }
}

// Dispatch job
SendWelcomeEmail.dispatch({ userId: '123' })
  .delay(60) // delay 60 seconds
  .onQueue('high');
```

---

## 🧪 Testing

Comprehensive testing setup with Vitest and Playwright:

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run feature tests only
npm run test:feature

# Run E2E tests
npm run test:e2e

# Run full test suite (lint + types + tests + e2e)
npm run test:all
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { TestCase } from '@/tests/TestCase';

describe('Authentication', () => {
  it('can login with valid credentials', async () => {
    const test = new TestCase();
    
    await test.seed('users');
    
    const response = await test.post('/api/login', {
      email: 'test@example.com',
      password: 'password',
    });
    
    response.assertStatus(200);
    response.assertJsonPath('user.email', 'test@example.com');
  });
});
```

---

## 🛡️ Compliance

Catalyst includes built-in compliance support for:

- **WCAG 2.2 AA** — Accessible UI components and patterns
- **Australian Privacy Principles (APP)** — Privacy-compliant templates
- **ISO 27001** — Security headers and best practices

See documentation in `docs/compliance/` for detailed guidelines.

---

## 📚 Documentation

Comprehensive documentation is available:

- **In-App Docs**: Visit `/docs` in development mode
- **Compliance**: `docs/compliance/`
- **Reports**: `docs/reports/`
- **AI Guide**: `AI_GUIDE.md` (for AI-assisted development)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.

---

<div align="center">
  <p>Built with ❤️ using Next.js & TypeScript</p>
  <p>
    <a href="/docs">Documentation</a> •
    <a href="https://github.com">GitHub</a> •
    <a href="https://discord.gg/catalyst">Discord</a>
  </p>
</div>
]]>
