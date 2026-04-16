# Codebase Audit — DigiFactori Idearium

> Generated: April 8, 2026  
> Scope: Full monorepo review — bugs, antipatterns, extensibility, scalability, file organization

---

## Table of Contents

1. [Bugs](#bugs)
2. [Antipatterns](#antipatterns)
3. [Extensibility & Scalability](#extensibility--scalability)
4. [File Organization](#file-organization)
5. [Prioritized Action Plan](#prioritized-action-plan)

---

## Bugs

### API

**`apps/api/src/modules/auth/auth.service.ts` — `createUser` always hashes `undefined`**

`parental_code` is passed directly to `bcrypt.hash` even when it is `undefined`, which will throw at runtime. The `createAccount` method handles this correctly with a null check, but `createUser` does not. It is currently dead code but would crash if called.

```ts
// Bug: parental_code can be undefined, bcrypt.hash will throw
const hashedParentalCode = await bcrypt.hash(parental_code, 10);

// Fix: guard before hashing
const hashedParentalCode = parental_code
  ? await bcrypt.hash(parental_code.toString(), 10)
  : null;
```

---

**`apps/api/src/modules/ideorama/ideorama.services.ts` — `getIdeoramaById` ignores `userId`**

The `userId` parameter is accepted but never used in the Prisma query. Any authenticated user can fetch any ideorama by ID — ownership is not enforced.

```ts
// Bug: userId is silently ignored
export const getIdeoramaById = async (ideoramaId: string, userId: string) => {
  return ideoramaTable.findFirst({
    where: { id: ideoramaId }, // missing: userId
  });
};

// Fix
where: { id: ideoramaId, userId: userId }
```

---

**`apps/api/src/modules/ideorama/ideorama.controller.ts` — `deleteIdeorama` not awaited**

`deleteIdeorama(req.body.ideoramaId)` is called without `await`. If the DB deletion throws, the error is swallowed, the file still gets deleted, and the DB record remains — leaving orphaned data.

```ts
// Bug: fire-and-forget DB delete
deleteIdeorama(req.body.ideoramaId);

// Fix
await deleteIdeorama(req.body.ideoramaId);
```

---

**`apps/api/src/modules/ideorama/ideorama.controller.ts` — synchronous `fs.readFileSync` in async handler**

`fs.readFileSync` is called inside `getIdeoramaByIdController`. If the file doesn't exist (DB record present but file deleted), it throws synchronously and bypasses the `catch` block's intent. Use `fs.promises.readFile` instead.

```ts
// Bug: sync throw escapes async error handling
const fileContent = fs.readFileSync(ideorama.model, 'utf-8');

// Fix
const fileContent = await fs.promises.readFile(ideorama.model, 'utf-8');
```

---

**`apps/api/src/utils/generateToken.ts` — returns `null` on failure, callers don't check**

`generateToken` is typed as `string | null` but every caller in `auth.controller.ts` uses the result directly as `accessToken` without a null check. If token generation fails silently, `null` is sent to the client as the token.

```ts
// Bug: null token sent to client
const token = generateToken(acc.user);
return res.status(201).json({ data: { accessToken: token } }); // token could be null

// Fix: throw instead of returning null, or check before responding
if (!token) return res.status(500).json({ error: 'Token generation failed' });
```

---

**`apps/api/src/modules/profile/profile.service.ts` — `prisma.$disconnect()` in `finally`**

`getSingleProfile` calls `prisma.$disconnect()` in its `finally` block. This disconnects the shared Prisma singleton after every profile fetch, breaking all subsequent database queries until the process restarts.

```ts
// Bug: disconnects the shared singleton
} finally {
  await prisma.$disconnect(); // REMOVE THIS
}
```

---

**`apps/api/src/modules/profile/profile.controller.ts` — wrong status codes in `deleteProfile`**

- Returns `status_code: 201` (Created) on a successful delete — should be `200`.
- The `catch` block returns `401` (Unauthorized) for a server error — should be `500`.

```ts
// Bug: wrong status codes
const response = { status_code: 201 }; // should be 200
return res.status(401).json(...);       // should be 500
```

---

**`apps/api/src/utils/validations.ts` — password validation commented out in `loginSchema`**

The minimum length and regex checks for the password field are commented out. Users can log in with any string as a password, which is a security regression.

```ts
// Bug: validation disabled
password: z.string('Mot de passe requis'),
// .min(6, ...)
// .regex(...)

// Fix: restore the validation
password: z
  .string('Mot de passe requis')
  .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, '...'),
```

---

### Frontend

**`apps/web/src/services/ideorama.service.ts` — all URLs hardcoded to `localhost:3001`**

The axios instance is imported (which has `VITE_API_BASE_URL` configured as `baseURL`) but every call bypasses it with a full hardcoded URL. This means the app always hits localhost in every environment including production.

```ts
// Bug: ignores VITE_API_BASE_URL
const response = await axios.post(`http://localhost:3001/api/ideorama/`, {...});

// Fix: use relative path, let axios baseURL handle the host
const response = await axios.post(`/api/ideorama/`, {...});
```

---

**`apps/web/src/hooks/useAssets.ts` — `translateToFrench` missing `await` inside `.map()`**

`translateToFrench` returns a `Promise<string>`. It is called inside `.map()` without `await`, so the `name` field on every asset item is a `Promise` object, not a string. This silently breaks all asset names in the UI.

```ts
// Bug: name is a Promise, not a string
const mapped = results.map((item: any) => ({
  name: translateToFrench(item.Title), // Promise<string>, not string
}));

// Fix: use Promise.all
const mapped = await Promise.all(
  results.map(async (item: any) => ({
    name: await translateToFrench(item.Title),
  }))
);
```

---

**`apps/web/src/utils/utils.ts` — `copyObjects` wipes all actions in undo/redo history**

`actions` is always set to `[]` when deep-cloning objects for the history stack. Every undo/redo operation removes all actions from every object in the scene.

```ts
// Bug: actions always reset to empty array
newObjects[key] = {
  ...value,
  actions: [], // should deep-clone value.actions
};

// Fix
actions: value.actions?.map(a => ({ ...a })) ?? [],
```

---

**`apps/web/src/hooks/useAssets.ts` — stale closure in `useEffect`**

`fetchAssets` is recreated on every change to `loading`, `hasMore`, or `page` (all in its `useCallback` deps). The `useEffect` that calls `fetchAssets(true)` on search/category change does not include `fetchAssets` in its dependency array, creating a stale closure that may call an outdated version of the function.

```ts
// Bug: stale fetchAssets reference
useEffect(() => {
  setPage(0);
  setHasMore(true);
  fetchAssets(true);
}, [searchTerm, category]); // missing fetchAssets
```

---

## Antipatterns

### API

**Redundant auth guard in every controller**

Every controller function starts with `if (!req.user) return 401`. This check is already performed by the `authenticate` middleware that wraps every route. The duplication adds noise and is a maintenance burden — if the middleware changes, every controller needs updating too.

```ts
// Antipattern: repeated in every controller
if (!user) {
  return res.status(401).json({ ... });
}

// Fix: trust the middleware, remove the guard from controllers
// The middleware already guarantees req.user is set before the controller runs
```

---

**Non-RESTful HTTP methods across all routes**

REST semantics are ignored throughout. Read operations use `POST`, delete operations use `POST /delete`. This makes the API harder to understand, cache, and integrate with.

| Current                              | Should be                  |
| ------------------------------------ | -------------------------- |
| `POST /api/ideorama/` (get by id)    | `GET /api/ideorama/:id`    |
| `POST /api/ideorama/all` (list)      | `GET /api/ideorama`        |
| `POST /api/ideorama/delete`          | `DELETE /api/ideorama/:id` |
| `POST /api/voxel/` (get by id)       | `GET /api/voxel/:id`       |
| `POST /api/voxel/all` (list)         | `GET /api/voxel`           |
| `POST /api/voxel/delete`             | `DELETE /api/voxel/:id`    |
| `POST /api/profile/` (get)           | `GET /api/profile`         |
| `POST /api/profile/setting` (update) | `PATCH /api/profile`       |
| `DELETE /api/profile/delete`         | `DELETE /api/profile`      |

---

**`catch (error: any)` used everywhere**

Every `catch` block types the error as `any` and accesses `.message` directly. This bypasses TypeScript's type safety. Use `unknown` and narrow the type.

```ts
// Antipattern
} catch (error: any) {
  throw new Error(`...: ${error.message}`);
}

// Fix
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`...: ${message}`);
}
```

---

**Both `bcrypt` and `bcryptjs` installed**

`package.json` lists both `bcrypt` and `bcryptjs` as dependencies. They serve the same purpose. Pick one (prefer `bcryptjs` for pure JS, no native bindings required) and remove the other.

---

**`packages/types` and `packages/utils` are empty**

The monorepo has shared packages that are completely empty. As a result, types are duplicated across:

- `apps/api/src/types/index.ts`
- `apps/web/src/types/type.d.ts`
- `apps/web/src/types/3d.d.ts`

And utilities like `round` live only in the web app even though the API could use them.

---

**Error internals leaked to clients in 500 responses**

Controllers return the raw `error` object in 500 responses:

```ts
return res.status(500).json({ error: { code: '...', error } }); // leaks stack traces
```

This exposes internal implementation details and stack traces to clients. Log the error server-side and return only a safe message.

---

### Frontend

**`any` typed function parameters in services and hooks**

```ts
export const register = async (userData: any): Promise<RegisterResponse>
const updateUserProfile = async (user: any, profile: any)
```

These should use the shared types from `packages/types`.

---

**`AuthProvider` context value recreated every render**

`contextValue` is a plain object literal created inline, so it's a new reference on every render. Every consumer of `useAuth` re-renders unnecessarily. Wrap it in `useMemo`.

```ts
// Antipattern: new object every render
const contextValue = { switchToRegister, switchToLogin, ... };

// Fix
const contextValue = useMemo(
  () => ({ switchToRegister, switchToLogin, ... }),
  [switchToRegister, switchToLogin, ...]
);
```

---

**Poly.pizza API key hardcoded in source**

```ts
const API_KEY = '42e4fc678abc42adafdcfad16293a3eb'; // committed to git
```

Move to `VITE_POLY_PIZZA_API_KEY` in `.env.local` and access via `import.meta.env`.

---

**`window.location.href` used for navigation in axios interceptor**

Hard redirects in `axios.service.ts` bypass React Router, lose all in-memory state, and cause a full page reload. Use a router-aware redirect instead (e.g. a shared navigation ref or an event emitter that the router listens to).

---

**UI panel state mixed into scene domain state**

`settingPanelOpen`, `assetsPanelOpen`, `assetsTreeOpen`, `actionPickerOpen` are UI concerns living inside `sceneState` (the Valtio proxy for the 3D scene). This pollutes the serializable scene data, makes undo/redo more complex, and couples the UI to the domain model.

---

**Large commented-out code blocks**

Multiple files contain large commented-out blocks that should be removed:

- `useAssets.ts`: old `translate` library import and implementation
- `actionsRegistry.tsx`: multiple `// clearTweens(ref)` calls
- `validations.ts`: password validation in `loginSchema`

Use git history to track removed code, not comments.

---

**`console.log` in production code**

```ts
console.log('search Ideorama: ', response); // ideorama.service.ts
console.log(response.data); // auth.service.ts
console.log('Your are crazy'); // actionsRegistry.tsx
console.log('DB ERRORS'); // auth.service.ts
```

Replace with a proper logger (e.g. `pino` on the API, remove entirely on the frontend) or at minimum remove before shipping.

---

## Extensibility & Scalability

### 1. File storage is a scalability bottleneck

Scenes and voxel models are stored as JSON files on the server's local filesystem (`uploads/scenes/`, `uploads/voxel-models/`). This breaks with:

- Multiple server instances (files not shared)
- Serverless deployments (ephemeral filesystem)
- Horizontal scaling

**Fix:** Introduce a storage abstraction layer in the API:

```ts
// apps/api/src/storage/storage.service.ts
interface StorageService {
  read(key: string): Promise<string>;
  write(key: string, content: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// Implementations: LocalStorageService, S3StorageService
```

Controllers call `storageService.read/write/delete` — swapping to S3 requires only changing the implementation, not the controllers.

---

### 2. Action Registry — make it plugin-based

The `ActionRegistry` in `actionsRegistry.tsx` is already a great pattern. The next step is making it dynamically registerable so new action types can be added without modifying the core file.

```ts
// lib/actions/registry.ts
class ActionRegistryManager {
  private registry: Map<string, ActionDefinition> = new Map();

  register(key: string, definition: ActionDefinition) {
    this.registry.set(key, definition);
  }

  get(key: string) {
    return this.registry.get(key);
  }

  getAll() {
    return Object.fromEntries(this.registry);
  }
}

export const actionRegistry = new ActionRegistryManager();

// Register built-ins
actionRegistry.register('move', moveAction);
actionRegistry.register('spin', spinAction);
// Future: external packages can call actionRegistry.register(...)
```

---

### 3. Role/permission system is too rigid

`authorize(role: Role)` only accepts a single role. A permission-based approach is more flexible:

```ts
// Current: single role
const authorize = (role: Role) => ...

// Better: array of allowed roles
const authorize = (...roles: Role[]) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ... });
    }
    next();
  };
};

// Usage
router.get('/admin', authenticate, authorize('SUPERVISOR'), handler);
router.get('/shared', authenticate, authorize('CHILD', 'SUPERVISOR'), handler);
```

---

### 4. Typed API client on the frontend

Replace scattered `axios.post(url, body)` calls with a typed client that mirrors the API surface:

```ts
// services/api.client.ts
export const apiClient = {
  ideorama: {
    getById: (id: string) =>
      axios.get<ApiResponse<Ideorama>>(`/api/ideorama/${id}`),
    getAll: () => axios.get<ApiResponse<Ideorama[]>>(`/api/ideorama`),
    save: (data: SaveIdeoramaInput) =>
      axios.post<ApiResponse<Ideorama>>(`/api/ideorama/save`, data),
    delete: (id: string) => axios.delete(`/api/ideorama/${id}`),
  },
  auth: {
    login: (data: LoginInput) =>
      axios.post<ApiResponse<AuthResponse>>(`/api/auth/login`, data),
    register: (data: RegisterInput) =>
      axios.post<ApiResponse<AuthResponse>>(`/api/auth/register`, data),
  },
  // ...
};
```

---

### 5. Separate UI state from scene domain state

Extract panel/UI state from `sceneState` into a dedicated `uiStore`:

```ts
// stores/ui.store.ts
export const uiState = proxy({
  settingPanelOpen: false,
  assetsPanelOpen: false,
  assetsTreeOpen: false,
  actionPickerOpen: false,
  activeSettingView: 'model' as 'model' | 'actions',
});

// stores/ideorama.store.ts — only scene data remains
export const sceneState = proxy<SceneDomainState>({
  id: '',
  mode: 'play',
  global: { ... },
  background: { ... },
  // ...
});
```

This makes `sceneState` fully serializable and keeps undo/redo clean.

---

## File Organization

### Recommended Structure

```
digifactori-idearium/
│
├── apps/
│   │
│   ├── api/
│   │   └── src/
│   │       ├── config/
│   │       │   ├── app.config.ts        # env validation (Zod)
│   │       │   └── client.config.ts     # Prisma singleton
│   │       │
│   │       ├── middlewares/
│   │       │   ├── authenticate.ts      # JWT verification
│   │       │   └── authorize.ts         # role-based access
│   │       │
│   │       ├── modules/                 # feature modules (MVC, keep as-is)
│   │       │   ├── auth/
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.service.ts
│   │       │   │   └── auth.route.ts
│   │       │   ├── profile/
│   │       │   │   ├── profile.controller.ts
│   │       │   │   ├── profile.service.ts
│   │       │   │   └── profile.route.ts
│   │       │   ├── ideorama/
│   │       │   │   ├── ideorama.controller.ts
│   │       │   │   ├── ideorama.service.ts  # RENAME: ideorama.services.ts → ideorama.service.ts
│   │       │   │   └── ideorama.route.ts
│   │       │   └── voxel/
│   │       │       ├── voxel.controller.ts
│   │       │       ├── voxel.service.ts
│   │       │       └── voxel.route.ts
│   │       │
│   │       ├── storage/                 # NEW: storage abstraction
│   │       │   ├── storage.interface.ts # StorageService interface
│   │       │   ├── local.storage.ts     # LocalStorageService (current behavior)
│   │       │   └── index.ts             # exports active implementation
│   │       │
│   │       ├── types/
│   │       │   └── index.ts             # AuthenticatedRequest, request body types
│   │       │
│   │       └── utils/
│   │           ├── generateToken.ts
│   │           └── validations.ts
│   │
│   └── web/
│       └── src/
│           ├── components/
│           │   ├── ui/                  # shadcn/ui primitives only (keep as-is)
│           │   ├── common/              # RENAME from global/: shared app components
│           │   │   ├── Input.tsx
│           │   │   ├── Button.tsx
│           │   │   └── ...
│           │   ├── auth/                # login, register, reset forms (keep as-is)
│           │   ├── editor/              # NEW: merge 3d/ + panel/ + ideorama/
│           │   │   ├── scene/           # Three.js scene components (from 3d/)
│           │   │   ├── panels/          # assets, settings, objects panels (from panel/)
│           │   │   └── actions/         # action picker, action list
│           │   ├── home/
│           │   ├── profile/
│           │   ├── myspace/
│           │   ├── voxel/
│           │   ├── header/
│           │   ├── footer/
│           │   └── sidebar/
│           │
│           ├── hooks/                   # keep as-is, well organized
│           │   ├── useAssets.ts
│           │   ├── useModel.ts
│           │   ├── useProfile.ts
│           │   └── useLocaleStorage.ts
│           │
│           ├── lib/
│           │   ├── actions/             # NEW: group action-related files
│           │   │   ├── runtime.ts       # RENAME: actionRuntime.ts
│           │   │   ├── registry.tsx     # RENAME: actionsRegistry.tsx
│           │   │   └── particles.ts
│           │   └── theme.ts
│           │
│           ├── pages/                   # route-level page components (keep as-is)
│           │   ├── Home.tsx
│           │   ├── Dashboard.tsx
│           │   ├── Ideorama.tsx
│           │   ├── MySpace.tsx
│           │   └── ...
│           │
│           ├── providers/
│           │   ├── UserProvider.tsx
│           │   ├── AuthProvider.tsx     # fix: memoize contextValue
│           │   └── theme-provider.tsx
│           │
│           ├── routes/
│           │   ├── index.tsx
│           │   ├── app.routes.tsx
│           │   ├── public.routes.tsx
│           │   └── protected.routes.tsx
│           │
│           ├── services/
│           │   ├── axios.service.ts     # axios instance + interceptors
│           │   ├── api.client.ts        # NEW: typed API client
│           │   ├── auth.service.ts
│           │   ├── ideorama.service.ts
│           │   ├── profile.service.ts
│           │   └── voxel.service.ts
│           │
│           ├── stores/
│           │   ├── ideorama.store.ts    # scene domain state only
│           │   └── ui.store.ts          # NEW: panel/UI state extracted here
│           │
│           ├── types/
│           │   └── index.d.ts           # CONSOLIDATE: merge type.d.ts + 3d.d.ts
│           │
│           └── utils/
│               └── utils.ts
│
└── packages/
    ├── types/                           # FILL THIS — currently empty
    │   └── index.ts                     # User, Profile, Ideorama, Role, ApiResponse<T>
    │                                    # shared between api and web
    └── utils/                           # FILL THIS — currently empty
        └── index.ts                     # round(), deepClone(), shared pure functions
```

### Key Naming Fixes

| Current                                              | Recommended                 | Reason                                |
| ---------------------------------------------------- | --------------------------- | ------------------------------------- |
| `apps/api/src/modules/ideorama/ideorama.services.ts` | `ideorama.service.ts`       | Inconsistent with all other modules   |
| `apps/web/src/components/global/`                    | `components/common/`        | "global" is ambiguous                 |
| `apps/web/src/components/3d/`                        | `components/editor/scene/`  | Describes purpose, not technology     |
| `apps/web/src/components/panel/`                     | `components/editor/panels/` | Groups with related editor components |
| `apps/web/src/lib/actionRuntime.ts`                  | `lib/actions/runtime.ts`    | Grouped with related action files     |
| `apps/web/src/lib/actionsRegistry.tsx`               | `lib/actions/registry.tsx`  | Grouped with related action files     |
| `apps/web/src/types/type.d.ts` + `3d.d.ts`           | `types/index.d.ts`          | Single source of truth for web types  |

---

## Prioritized Action Plan

### Phase 1 — Bug Fixes (do first, highest impact)

- [ ] Fix `getIdeoramaById` to filter by `userId` (security: unauthorized data access)
- [ ] Add `await` to `deleteIdeorama` call in `deleteIdeoramaController`
- [ ] Fix `translateToFrench` missing `await` in `useAssets.ts` (all asset names broken)
- [ ] Fix `copyObjects` to preserve `actions` array in undo/redo history
- [ ] Fix `generateToken` — throw on failure instead of returning `null`
- [ ] Remove `prisma.$disconnect()` from `getSingleProfile` `finally` block
- [ ] Fix all hardcoded `localhost:3001` URLs in `ideorama.service.ts`
- [ ] Restore password validation in `loginSchema`

### Phase 2 — Security & Correctness

- [ ] Move Poly.pizza API key to `VITE_POLY_PIZZA_API_KEY` env variable
- [ ] Fix `deleteProfile` status codes: success `201` → `200`, catch `401` → `500`
- [ ] Replace `window.location.href` in axios interceptor with router-aware redirect
- [ ] Remove raw `error` object from all 500 responses (prevents stack trace leaks)
- [ ] Remove all `console.log` calls from services and action registry

### Phase 3 — Reduce Coupling & Improve Structure

- [ ] Fill `packages/types/index.ts` with shared types — eliminate duplication between API and web
- [ ] Fill `packages/utils/index.ts` with shared pure functions (`round`, `deepClone`, etc.)
- [ ] Extract UI panel state into a separate `ui.store.ts`
- [ ] Create storage abstraction layer in API (`storage/storage.interface.ts`)
- [ ] Replace `POST` routes that should be `GET`/`DELETE` with proper HTTP methods
- [ ] Remove redundant `if (!req.user)` guards from all controllers
- [ ] Replace `catch (error: any)` with `catch (error: unknown)` + type narrowing
- [ ] Remove one of `bcrypt` / `bcryptjs` (keep `bcryptjs`)
- [ ] Memoize `contextValue` in `AuthProvider`
- [ ] Remove all commented-out code blocks

### Phase 4 — Extensibility

- [ ] Make `ActionRegistry` dynamically registerable (plugin pattern)
- [ ] Extend `authorize` middleware to accept an array of roles
- [ ] Create a typed `apiClient` on the frontend to replace scattered axios calls
- [ ] Rename `ideorama.services.ts` → `ideorama.service.ts` for consistency
- [ ] Consolidate `type.d.ts` + `3d.d.ts` into a single `types/index.d.ts`
- [ ] Reorganize `components/3d/` + `components/panel/` into `components/editor/`
