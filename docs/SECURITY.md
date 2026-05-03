# Security Policy

## Supported Versions

The following versions of DigiFactori Idearium are currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability in DigiFactori Idearium, please **do not open a public GitHub issue**. Instead, report it privately so we can address it before any public disclosure.

**Contact:** Send a detailed report to [security@digifactory.be](mailto:security@digifactory.be)

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- The affected component (frontend, backend API, storage layer, etc.)
- Any relevant logs, screenshots, or proof-of-concept code

You can expect an initial acknowledgement within **48 hours** and a status update every **5 business days** thereafter. If the vulnerability is accepted, we will work with you on a coordinated disclosure timeline. If it is declined, we will explain our reasoning.

---

## Security Architecture Overview

DigiFactori Idearium is an educational hackathon platform for children aged 6–12. Given its audience, we take security seriously across all layers of the stack.

| Component | Technology                                 |
| --------- | ------------------------------------------ |
| Frontend  | React / TypeScript                         |
| Backend   | Node.js / Express                          |
| Database  | PostgreSQL + Prisma ORM                    |
| Storage   | Multi-provider (S3, R2, GCS, Azure, MinIO) |

---

## Known Security Controls

### Authentication & Sessions

- All protected API routes require a signed JWT passed as `Authorization: Bearer <token>`.
- Tokens expire after **7 days** by default (`JWT_EXPIRES_IN`). Production deployments requiring stricter session control should reduce this value.
- `JWT_SECRET` must be **at least 32 characters** and generated with a cryptographically secure tool (e.g. `openssl rand -hex 32`). Secrets must never be reused across environments.

### Role-Based Access Control

The platform enforces three roles with clearly scoped permissions:

| Role       | Capabilities summary                                       |
| ---------- | ---------------------------------------------------------- |
| ADMIN      | Full platform access: users, storage, integrations, assets |
| SUPERVISOR | Can manage INTERN accounts only                            |
| INTERN     | Can only access their own profile and content              |

Privilege escalation between roles is restricted by the API — a SUPERVISOR cannot grant ADMIN-level roles, and ADMIN accounts cannot be modified or deleted by other roles.

### Admin Registration

- Self-registration as ADMIN requires a secret numeric `ADMIN_CODE` set via environment variable.
- This code must be treated as a secret and **rotated immediately** if compromised.
- Organisation codes (`orgCode`, `orgParentalCode`) should also be rotated between workshop sessions.

### Storage Security

- Storage credentials (`accessKey`, `secretKey`) are persisted in the database. Ensure the database is **not publicly accessible** and is protected by network-level controls.
- Files are proxied through the backend (`GET /storage/file/:key`) to avoid direct exposure of bucket credentials or CORS issues.
- **LOCAL storage is not suitable for production** — files are saved to the server filesystem and will be lost on restart or redeployment.

### File Upload Validation

- All uploads are validated by **MIME type and file extension**.
- Maximum file size is **100 MB** per file; bulk uploads are capped at **50 files** per request.
- Do not disable these checks in production.

Allowed types:

| Category  | Formats                   |
| --------- | ------------------------- |
| Images    | JPEG, PNG, GIF, WebP, SVG |
| Audio     | MP3, WAV, OGG, FLAC, AAC  |
| Video     | MP4, WebM                 |
| 3D Models | `.glb`, `.gltf`           |
| Other     | JSON, PDF, ZIP            |

### CORS

- The `CORS_ORIGIN` environment variable restricts API access to the declared frontend origin.
- **Wildcards (`*`) must never be used in production.**

### Rate Limiting

- The API enforces a limit of **60 requests per minute per IP address**.
- This threshold can be adjusted in `apps/api/src/main.ts` if operationally necessary.

---

## Vulnerability Disclosure Policy

We follow a **coordinated disclosure** model:

1. Reporter submits vulnerability details privately.
2. We confirm receipt within 48 hours.
3. We assess, reproduce, and develop a fix.
4. A patched release is published before any public disclosure.
5. Credit is given to the reporter (unless they prefer to remain anonymous).

We ask that reporters give us a reasonable timeframe (typically **90 days**) to resolve the issue before any public disclosure.
