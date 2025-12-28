# Getting Started

This project is a **PNPM monorepo** managed with **Turborepo**.

For detailed contribution rules and workflows, see the:
➡️ [Developer Guide](CONTRIBUTOR.md)

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
