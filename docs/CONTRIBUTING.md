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
- PNPM 8+ (npm install -g pnpm)
- Git

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

## Start the Application

### Start everything (recommended)

From the root of the monorepo:

```bash
pnpm turbo run dev
```

This will start:

- API at http://localhost:3000
- Web at http://localhost:5173

### Start applications individually

#### Start the API

```bash
pnpm --filter api dev
```

#### Start the Web application

```bash
pnpm --filter web dev
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
│   └── tests/               # API tests
│
├── web/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── 3d/         # Three.js components
│   │   │   └── ui/         # UI components
│   │   ├── assets/         # Static assets
│   │   │   ├── models/     # 3D models
│   │   │   └── textures/   # Textures for 3D
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service calls
│   │   ├── store/          # State management
│   │   └── types/          # Frontend-specific types
│   └── tests/              # Frontend tests
│
packages/
├── types/
│       └── index.ts       # Export all shared types
└── utils/
        ├── api/           # Shared API utilities
        ├── validation/    # Shared validation logic
        └── index.ts       # Export all shared utilities
```

### Available Scripts

#### Root (Turborepo)

```bash
pnpm turbo run dev       # Start all apps
pnpm turbo run build     # Build all apps
pnpm turbo run test      # Run all tes
```

#### API (apps/api)

```bash
pnpm dev                 # Start API
pnpm build               # Build API
pnpm test                # Run API integration tests
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Run migrations
```

#### Web (apps/web)

```bash
pnpm dev                 # Start frontend
pnpm build               # Build frontend
pnpm test                # Run frontend tests
```

### Application Overview

#### API (apps/api)

Backend server built with:

- Node.js + Express – HTTP server
- TypeScript – Type safety
- Prisma – Database ORM & migrations
- JWT – Authentication & authorization
- Zod – Request & schema validation

#### Web (apps/web)

Frontend application built with:

- Vite + React – Frontend framework
- TypeScript – Type safety
- Tailwind CSS – Styling
- Three.js – 3D visualization
- Zustand / Redux – State management

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

#### Integration Tests

- **Backend (API)**: Jest + Supertest for Express routes, middleware, and Prisma with a test database.
- **Frontend (Web)**: Vitest + Testing Library for Component interactions, and API calls.
