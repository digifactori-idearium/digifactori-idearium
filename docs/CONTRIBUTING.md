# Getting Started

This project is a **PNPM monorepo** managed with **Turborepo**.

For detailed contribution rules and workflows, see the:
➡️ [Developer Guide](/docs/CONTRIBUTOR.md)

**Benefits**:

- Incremental builds
- Task caching
- Parallel execution
- Faster CI pipelines

## Prerequisites

- Node.js 18+
- PNPM 8+ (`npm install -g pnpm`)
- Git
- PostgreSQL (local instance or Docker)

## Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd digifactori-idearium

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
```

## Development Setup

### Project structure

```bash
apps/
├── api/
│   ├── src/
│   │   ├── modules/         # Feature modules (auth, models, etc.)
│   │   ├── prisma/          # Database schema and migrations
│   │   ├── middlewares/     # Express middlewares
│   │   ├── utils/           # API-specific utilities
│   │   └── main.ts          # Application entry point
│   └── tests/              # API tests
│
├── web/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── 3d/         # Three.js components
│   │   │   └── ui/         # UI components
│   │   ├── assets/         # Static assets
│   │   │   ├── models/     # 3D models
│   │   │   └── textures/   # Textures for 3D
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service calls
│   │   ├── store/          # State management
│   │   └── types/          # Frontend-specific types
│   └── tests/             # Frontend tests
│
packages/
├── types/
│       └── index.ts        # Export all shared types
└── utils/
        ├── api/           # Shared API utilities
        ├── validation/    # Shared validation logic
        └── index.ts       # Export all shared utilities
```

### Application Overview

#### API (apps/api)

Backend server built with:

- Node.js + Express – HTTP server
- TypeScript – Type safety
- Prisma – Database ORM, migration management, and PostgreSQL integration
- JWT + Bcrypt – Stateless user authentication, authorization, and password hashing
- Zod – Request & schema validation
- Helmet + Rate Limit – Production security middleware for HTTP headers and DDoS protection
- Resend – Transactional email delivery service

#### Web (apps/web)

Frontend application built with:

- Vite + React – Frontend Build Tool & Framework
- shadcn ui – Accessible Component Layer
- dnd-kit – Advanced drag-and-drop mechanics.
- Tiptap – Headless, fully modular rich text editor.
- TypeScript – Type Safety
- Tailwind CSS – Utility-First Styling
- Three.js – 3D Graphics Engine
- Valtio – Proxy-Based State Management

#### Shared Packages (packages)

Shared code used across backend and frontend:

- types – Shared TypeScript types
- utils – Reusable helpers (API, validation, etc.)

### Testing Strategy

#### Unit Tests

- **Backend (API)**:
  - Framework: Jest
  - Tests business logic, services, and controllers
- **Frontend (Web)**:
  - Framework: Vitest
  - Tests components, hooks, and utilities

## Environment Variables

Copy `.env.example` to `.env` in `apps/api/` and fill in the following:

| Variable         | Required | Description                                             | Example                                          |
| ---------------- | -------- | ------------------------------------------------------- | ------------------------------------------------ |
| `PORT`           | Yes      | Backend listening port                                  | `3001`                                           |
| `NODE_ENV`       | Yes      | Runtime environment                                     | `development`                                    |
| `API_BASE_URL`   | Yes      | Public URL of the backend                               | `http://localhost:3001`                          |
| `FRONTEND_URL`   | Yes      | Public URL of the frontend                              | `http://localhost:5173`                          |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string                            | `postgresql://user:pass@localhost:5432/idearium` |
| `JWT_SECRET`     | Yes      | Min 32 characters — signs authentication tokens         | `openssl rand -hex 32`                           |
| `JWT_EXPIRES_IN` | Yes      | Token expiry duration                                   | `7d`                                             |
| `CORS_ORIGIN`    | Yes      | Allowed frontend origin                                 | `http://localhost:5173`                          |
| `ADMIN_CODE`     | Yes      | Numeric code required to self-register as ADMIN         | `505050`                                         |
| `RESEND_API_KEY` | Yes      | API key from resend.com for transactional emails        | `re_xxxxxxxxxxxx`                                |
| `EMAIL_FROM`     | Yes      | Sender address — must match your verified Resend domain | `noreply@digifactory.be`                         |

> ⚠️ Never commit `.env` to the repository. It is gitignored. Never share secrets in Slack, Discord, or pull requests.

## Running and Scripting

### First-Time Database Setup

```bash
# Create the local database (run once)
createdb idearium

# Apply all migrations and generate the Prisma client
pnpm db:migrate
```

### Run the Full Stack

From the monorepo root — Turborepo starts both API and Web in parallel:

```bash
pnpm dev
```

Or individually:

```bash
cd apps/api && pnpm dev   # API on http://localhost:3001
cd apps/web && pnpm dev   # Web on http://localhost:5173
```

### Running Tests

From the monorepo root — Turborepo test both API and Web

```bash
pnpm test
```

#### API — Jest

```bash
cd apps/api
pnpm test             # run once
pnpm test:watch       # watch mode
pnpm test:coverage    # with coverage report
pnpm test:ci          # CI mode (no watch, with coverage)
```

#### Web — Vitest

```bash
cd apps/web
pnpm test             # run once
pnpm test:watch       # watch mode
pnpm test:coverage    # with coverage report
pnpm test:ui          # opens Vitest UI in browser
```

## Development Workflow

### Before You Start — Sync with dev

Before making any change, always pull the latest version of the dev branch to avoid conflicts:
Befor any chanfe make sur you pull from the dev branch

```shell
git pull orign dev
```

Then sync dependencies and apply any new migrations:

```shell
# root(better) or apps/api or apps/web
pnpm install
# root(better) or apps/api not apps/web
pnpm db:migrate
pnpm db:generate
```

Then navigate to the app you are working:

```shell
cd apps/api # for backend
cd apps/web # for frontend
```

### Before You Push — Verify the Build

Before pushing any changes, make sure the project builds successfully:
Make sure you run at the root of the project.

```shell
pnpm run build
```

## Database Migrations

### Local Development

Use the standard Prisma development command. This creates a new migration file, applies it to your local database, and regenerates the Prisma client:
Make sure you run at the root of the project or in the apps/api.

```bash
# Create a new migration and apply it
pnpm db:migrate

# Regenerate the Prisma client only (no new migration)
pnpm db:generate

# Open Prisma Studio to inspect the database visually
pnpm db:studio

# Seed the database with sample data
pnpm db:seed
```

### Production Migrations

> ⚠️ **Never run `prisma migrate dev` in production.** It is a development-only command that can drop data, prompt interactively, and reset the database. Always use `prisma migrate deploy` instead.

`prisma migrate deploy` applies all pending migrations that exist in the `prisma/migrations/` folder in order, without prompting, without generating new migrations, and without touching any data beyond what the migration files define.

#### Running a Production Migration Manually

```bash
# From apps/api, with your production DATABASE_URL set
DATABASE_URL="postgresql://..." pnpm prisma:migrate
```

Or with the environment loaded from a file:

```bash
dotenv -e .env.production -- pnpm prisma:migrate
```

#### In a CI/CD Pipeline

Add the following step **before** starting the application, **after** the build step:

```yaml
# Example — GitHub Actions
- name: Run database migrations
  working-directory: apps/api
  run: pnpm prisma:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

The recommended deployment order is always:

```
1. Build    →  pnpm build
2. Migrate  →  pnpm prisma:migrate   (prisma migrate deploy)
3. Start    →  pnpm start
```

This order ensures the schema is up to date before any new application code starts serving traffic.

#### Migration Checklist Before Merging to `main`

- [ ] Migration file is committed inside `prisma/migrations/`
- [ ] `schema.prisma` reflects the final intended state
- [ ] The migration was tested locally with `pnpm db:migrate`
- [ ] No destructive operations (column drops, renames) without a prior deprecation step
- [ ] Seed script (`pnpm db:seed`) still runs cleanly if applicable
- [ ] `pnpm build` passes after schema changes (Prisma client is regenerated via `prebuild`)

#### Handling Destructive Changes Safely

If a migration involves renaming or dropping a column, **never do it in a single release**. Use a three-step approach across separate deployments:

| Step | Migration               | App Code                                |
| ---- | ----------------------- | --------------------------------------- |
| 1    | Add the new column      | Write to both old and new columns       |
| 2    | Backfill data if needed | Read from the new column                |
| 3    | Drop the old column     | Remove all references to the old column |

This avoids downtime and data loss when deploying in environments where old and new instances run simultaneously.

## Pull Request Checklist

Before requesting a review, verify:

- [ ] Branched off `dev`, not `main`
- [ ] Branch name follows `<name>/<type>/<module>` convention
- [ ] Commit messages follow the Commitlint convention
- [ ] `pnpm build` passes locally
- [ ] Tests pass (`pnpm test` in the relevant app)
- [ ] New migrations committed in `prisma/migrations/`
- [ ] `.env.example` updated if new environment variables were added
- [ ] PR targets `dev`, not `main`
- [ ] No `console.log` or debug code left in

## Production Deployment

The application is hosted on the **UNamur university server** using **nginx** (static file serving + reverse proxy) and **PM2** (Node.js process manager).

### Architecture

```
Browser
  │
  ▼
nginx :80
  ├── /        → serves web/dist/   (React static files)
  └── /api/    → proxy → localhost:3001  (PM2 → Node.js API)
                              │
                              ▼
                        PostgreSQL :5432
```

### Deployment is automated via GitHub Actions

Every push to `main` triggers the production pipeline (`.github/workflows/production.yml`), which:

1. Installs dependencies
2. Lints and type-checks all packages
3. Runs the full test suite against a temporary PostgreSQL service
4. Builds all packages
5. Transfers build artifacts to the server via rsync over SSH
6. Installs production dependencies on the server
7. Runs `prisma migrate deploy`
8. Restarts the API via PM2
9. Runs a health check against `/api/health`

### Required GitHub Secrets & Variables

| Name              | Type     | Description                                          |
| ----------------- | -------- | ---------------------------------------------------- |
| `SSH_PRIVATE_KEY` | Secret   | Private key for SSH access to the server             |
| `SERVER_HOST`     | Secret   | Server IP or hostname                                |
| `SERVER_USER`     | Secret   | SSH user                                             |
| `REMOTE_DIR`      | Secret   | Deployment path on server (e.g. `/var/www/idearium`) |
| `VITE_API_URL`    | Variable | Public API URL baked into the frontend at build time |

> Never put `DATABASE_URL` or other credentials in GitHub secrets. They must be set directly in the `.env` file on the server.
