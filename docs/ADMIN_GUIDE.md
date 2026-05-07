# DigiFactori Idearium - Administrator Guide

> **Audience:** Platform administrators and technical operators  
> **Application:** DigiFactori Idearium — Educational hackathon platform for children aged 6–12  
> **Version:** Production

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Environment Variables](#2-environment-variables)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [API Reference](#4-api-reference)
5. [Storage Configuration](#5-storage-configuration)
6. [Integrations Configuration](#6-integrations-configuration)
7. [User Management](#7-user-management)
8. [Asset Management](#8-asset-management)
9. [Organisation Settings](#9-organisation-settings)
10. [Common Errors & Troubleshooting](#10-common-errors--troubleshooting)
11. [Security Notes](#11-security-notes)

---

## 1. Application Overview

DigiFactori Idearium is an educational platform offering 3-day hackathon-style workshops for children aged 6–12. The platform is structured as a monorepo with the following components:

| Component | Technology                                        | Deployment URL                            |
| --------- | ------------------------------------------------- | ----------------------------------------- |
| Frontend  | React / TypeScript                                | https://digifactori-idearium.netlify.app  |
| Backend   | Node.js / Express                                 | https://digifactori-idearium.onrender.com |
| Database  | PostgreSQL + Prisma ORM                           | Managed via `DATABASE_URL`                |
| Storage   | Multi-provider (S3, R2, GCS, Azure, MinIO, Local) | Configured via Admin API                  |

The backend exposes a REST API under `/api`. All admin operations are performed through this API, either directly or via the admin interface in the frontend.

---

## 2. Environment Variables

All backend environment variables are defined in `apps/api/.env`. A reference template is available at `apps/api/.example.env`.

| Variable         | Required | Description                                                                           |
| ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `PORT`           | Yes      | Backend listening port. Default: `3001`                                               |
| `NODE_ENV`       | Yes      | Runtime environment: `development`, `production`, or `test`                           |
| `API_BASE_URL`   | Yes      | Public URL of the backend (e.g. `https://digifactori-idearium.onrender.com`)          |
| `FRONTEND_URL`   | Yes      | Public URL of the frontend (e.g. `digifactori-idearium.netlify.app`)                  |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string (see format below)                                       |
| `JWT_SECRET`     | Yes      | Minimum 32 characters. Used to sign authentication tokens                             |
| `JWT_EXPIRES_IN` | Yes      | Token expiry duration. Default: `7d`                                                  |
| `CORS_ORIGIN`    | Yes      | Frontend origin allowed by CORS (e.g. `http://localhost:3000`)                        |
| `ADMIN_CODE`     | Yes      | Numeric code required to self-register as ADMIN (e.g. `505050`). Keep secret          |
| `RESEND_API_KEY` | Yes      | API key from [resend.com](https://resend.com) for transactional emails                |
| `EMAIL_FROM`     | Yes      | Sender email address. Must match your verified domain (e.g. `noreply@digifactory.be`) |

### DATABASE_URL Format

```
postgresql://user:password@host:5432/idearium?schema=public
```

Replace `user`, `password`, `host`, and `idearium` with your actual PostgreSQL credentials and database name.

---

## 3. User Roles & Permissions

The platform defines three roles: **ADMIN**, **SUPERVISOR**, and **INTERN**.

### ADMIN

- View all users
- Create SUPERVISOR or INTERN accounts
- Update any user's basic info (email, first name, last name)
- Change any user's role (except other ADMINs)
- Activate or deactivate any user account
- Delete any non-ADMIN user
- Manage storage configuration
- Manage integrations
- Manage assets (upload, edit, delete)
- Access all settings

### SUPERVISOR

- View all INTERN accounts
- Create INTERN accounts only
- Update INTERN basic info
- Change INTERN role only
- Delete INTERN accounts

### INTERN

- View their own profile
- Create and manage their own Idéoramas, Voxel models, and Documents

---

## 4. API Reference

**Base URL:** `https://digifactori-idearium.onrender.com/api`

All protected routes require the following header:

```
Authorization: Bearer <accessToken>
```

---

### 4.1 Authentication

| Method | Endpoint                       | Description                                                                       |
| ------ | ------------------------------ | --------------------------------------------------------------------------------- |
| `POST` | `/auth/register`               | Register a new account. Requires `orgCode` for SUPERVISOR, `ADMIN_CODE` for ADMIN |
| `POST` | `/auth/login`                  | Login with email or pseudo + password. Returns `{ accessToken, user }`            |
| `POST` | `/auth/change-password`        | Change password (authenticated)                                                   |
| `POST` | `/auth/reset-password/request` | Request a password reset email                                                    |
| `POST` | `/auth/reset-password`         | Reset password using the token received by email                                  |

---

### 4.2 User Management

> Accessible by ADMIN and SUPERVISOR (with restrictions per role).

| Method   | Endpoint           | Description                                              |
| -------- | ------------------ | -------------------------------------------------------- |
| `GET`    | `/user/list`       | List users. ADMIN sees all; SUPERVISOR sees INTERNs only |
| `GET`    | `/user/:id`        | Get a user by ID                                         |
| `POST`   | `/user`            | Create a user                                            |
| `PATCH`  | `/user/:id`        | Update user basic info                                   |
| `PATCH`  | `/user/:id/role`   | Change a user's role                                     |
| `PATCH`  | `/user/:id/active` | Toggle active status (ADMIN only)                        |
| `DELETE` | `/user/:id`        | Delete a user                                            |

---

### 4.3 Storage

> ADMIN only.

| Method   | Endpoint             | Description                                                               |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| `GET`    | `/storage`           | Get current storage configuration                                         |
| `POST`   | `/storage/test`      | Test credentials without saving                                           |
| `PATCH`  | `/storage`           | Update storage configuration                                              |
| `DELETE` | `/storage`           | Reset storage to LOCAL                                                    |
| `GET`    | `/storage/file/:key` | Stream a file by its storage key (authenticated, proxied through backend) |

---

### 4.4 Settings & Integrations

> ADMIN only.

| Method   | Endpoint                            | Description                                         |
| -------- | ----------------------------------- | --------------------------------------------------- |
| `GET`    | `/settings`                         | Get all settings including integrations             |
| `PATCH`  | `/settings/org`                     | Update org codes                                    |
| `GET`    | `/settings/integrations`            | List integrations. Optional query: `?type=MODEL_3D` |
| `POST`   | `/settings/integrations`            | Create an integration                               |
| `GET`    | `/settings/integrations/:id`        | Get integration by ID                               |
| `PATCH`  | `/settings/integrations/:id`        | Update an integration                               |
| `PATCH`  | `/settings/integrations/:id/toggle` | Toggle active/inactive                              |
| `DELETE` | `/settings/integrations/:id`        | Delete an integration                               |

---

### 4.5 Assets

> Write operations (upload, update, delete) are ADMIN only. Read operations require authentication.

| Method   | Endpoint          | Description                                  |
| -------- | ----------------- | -------------------------------------------- |
| `GET`    | `/asset/list`     | List assets with optional filters            |
| `GET`    | `/asset/:assetId` | Get asset by ID                              |
| `POST`   | `/asset`          | Upload a single asset (multipart/form-data)  |
| `POST`   | `/asset/bulk`     | Upload multiple assets (multipart/form-data) |
| `PATCH`  | `/asset/:assetId` | Update asset metadata                        |
| `DELETE` | `/asset/:assetId` | Delete a single asset                        |
| `DELETE` | `/asset/bulk`     | Bulk delete assets                           |

**Asset list query parameters:**

| Parameter  | Description                                        |
| ---------- | -------------------------------------------------- |
| `category` | Filter by `MODEL_3D`, `SOUND`, `IMAGE`, or `OTHER` |
| `search`   | Case-insensitive text search on asset name         |
| `tags`     | Comma-separated tag filter (e.g. `nature,outdoor`) |
| `page`     | Page number (default: `1`)                         |
| `limit`    | Items per page (default: `20`)                     |

---

## 5. Storage Configuration

### Overview

Storage is configured via `PATCH /storage` (ADMIN only). The configuration is persisted in the database (`CloudStorage` table, singleton row `id=1`). The system falls back to LOCAL storage if credentials are missing or incomplete.

> **Warning:** LOCAL storage saves files to `apps/api/uploads/` on the server filesystem. It is **not suitable for production** and will be lost on server restarts or redeployments.

### Testing Before Saving

Use `POST /storage/test` with the same body as `PATCH /storage` to validate credentials without persisting them. Returns `200 OK` on success or `400 Bad Request` with an error message on failure. Always test before applying a new configuration.

### How Public URLs Are Resolved

The database stores only the **storage key** (e.g. `assets/abc123.glb`). When assets are served, the backend resolves the key to a full public URL using the `getPublicUrl(key)` function:

| Provider | Resolved URL                                       |
| -------- | -------------------------------------------------- |
| S3       | `https://{bucket}.s3.{region}.amazonaws.com/{key}` |
| R2       | `{publicUrl}/{key}`                                |
| GCS      | `{publicUrl}/{key}`                                |
| MinIO    | `{publicUrl}/{key}`                                |
| Azure    | `{publicUrl}/{container}/{key}`                    |
| Local    | `{API_BASE_URL}/uploads/{key}`                     |

Files are proxied through the backend at `GET /storage/file/{key}` to avoid CORS issues on the frontend.

### File Upload Limits

| Constraint             | Limit                     |
| ---------------------- | ------------------------- |
| Max file size          | 100 MB per file           |
| Max bulk upload        | 50 files per request      |
| Allowed image types    | JPEG, PNG, GIF, WebP, SVG |
| Allowed audio types    | MP3, WAV, OGG, FLAC, AAC  |
| Allowed video types    | MP4, WebM                 |
| Allowed 3D model types | `.glb`, `.gltf`           |
| Other allowed types    | JSON, PDF, ZIP            |

---

### 5.1 AWS S3

**Required fields:**

| Field       | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| `provider`  | `S3`                                                                               |
| `accessKey` | AWS Access Key ID                                                                  |
| `secretKey` | AWS Secret Access Key                                                              |
| `bucket`    | S3 bucket name                                                                     |
| `region`    | AWS region (e.g. `us-east-1`). Optional, defaults to `us-east-1`                   |
| `publicUrl` | Optional. If omitted, auto-derived as `https://{bucket}.s3.{region}.amazonaws.com` |

**Example request body:**

```json
{
  "provider": "S3",
  "accessKey": "AKIAIOSFODNN7EXAMPLE",
  "secretKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "bucket": "idearium-assets",
  "region": "eu-west-1",
  "publicUrl": "https://idearium-assets.s3.eu-west-1.amazonaws.com"
}
```

**Public URL format:** `https://{bucket}.s3.{region}.amazonaws.com/{key}`

---

### 5.2 Cloudflare R2

**Required fields:**

| Field       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `provider`  | `R2`                                                                          |
| `accessKey` | R2 Access Key ID                                                              |
| `secretKey` | R2 Secret Access Key                                                          |
| `bucket`    | R2 bucket name                                                                |
| `endpoint`  | `https://{account_id}.r2.cloudflarestorage.com`                               |
| `publicUrl` | Your R2 public domain or custom domain (e.g. `https://assets.yourdomain.com`) |

**Example request body:**

```json
{
  "provider": "R2",
  "accessKey": "your-r2-access-key-id",
  "secretKey": "your-r2-secret-access-key",
  "bucket": "idearium-assets",
  "endpoint": "https://abc123def456.r2.cloudflarestorage.com",
  "publicUrl": "https://assets.digifactory.be"
}
```

**Public URL format:** `{publicUrl}/{key}`

---

### 5.3 Google Cloud Storage (GCS)

GCS is accessed via HMAC keys (S3-compatible interface).

**Required fields:**

| Field       | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| `provider`  | `GCS`                                                       |
| `accessKey` | HMAC Access Key                                             |
| `secretKey` | HMAC Secret                                                 |
| `bucket`    | GCS bucket name                                             |
| `endpoint`  | `https://storage.googleapis.com`                            |
| `publicUrl` | `https://storage.googleapis.com/{bucket}` or custom CDN URL |

**Example request body:**

```json
{
  "provider": "GCS",
  "accessKey": "GOOGTS7C7FUP3AIRVJTE2BCDKINBTES3HC2GY5CBFJDCQ2SYHB6A3TELKOMSA",
  "secretKey": "bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ",
  "bucket": "idearium-assets",
  "endpoint": "https://storage.googleapis.com",
  "publicUrl": "https://storage.googleapis.com/idearium-assets"
}
```

**Public URL format:** `{publicUrl}/{key}` → e.g. `https://storage.googleapis.com/idearium-assets/{key}`

---

### 5.4 Azure Blob Storage

**Required fields:**

| Field       | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `provider`  | `AZURE`                                                                 |
| `accessKey` | Azure Storage **account name**                                          |
| `secretKey` | Azure Storage **account key**                                           |
| `bucket`    | Azure **container name**                                                |
| `endpoint`  | `https://{accountName}.blob.core.windows.net` (auto-derived if omitted) |
| `publicUrl` | CDN endpoint or `https://{accountName}.blob.core.windows.net`           |

**Example request body:**

```json
{
  "provider": "AZURE",
  "accessKey": "myidearium",
  "secretKey": "dGhpcyBpcyBhIGZha2Uga2V5IGZvciBkb2N1bWVudGF0aW9u",
  "bucket": "assets",
  "endpoint": "https://myidearium.blob.core.windows.net",
  "publicUrl": "https://myidearium.blob.core.windows.net"
}
```

**Public URL format:** `{publicUrl}/{container}/{key}`

---

### 5.5 MinIO (Self-Hosted)

**Required fields:**

| Field       | Description                                            |
| ----------- | ------------------------------------------------------ |
| `provider`  | `MINIO`                                                |
| `accessKey` | MinIO access key                                       |
| `secretKey` | MinIO secret key                                       |
| `bucket`    | Bucket name                                            |
| `endpoint`  | MinIO server URL (e.g. `http://minio.internal:9000`)   |
| `publicUrl` | Optional. If omitted, derived as `{endpoint}/{bucket}` |

**Example request body:**

```json
{
  "provider": "MINIO",
  "accessKey": "minioadmin",
  "secretKey": "minioadmin",
  "bucket": "idearium-assets",
  "endpoint": "http://minio.internal:9000",
  "publicUrl": "http://minio.internal:9000/idearium-assets"
}
```

**Public URL format:** `{publicUrl}/{key}`

---

## 6. Integrations Configuration

Integrations connect the platform to external asset libraries (3D models, sounds, images). They are managed via `POST /settings/integrations` and `PATCH /settings/integrations/:id` (ADMIN only).

### Integration Fields

| Field          | Type         | Required | Description                                 |
| -------------- | ------------ | -------- | ------------------------------------------- |
| `name`         | string       | Yes      | Display name (min 2 characters)             |
| `url`          | string (URL) | Yes      | API endpoint URL                            |
| `type`         | enum         | Yes      | `MODEL_3D`, `SOUND`, `IMAGE`, or `OTHER`    |
| `key`          | string       | No       | API key (min 8 characters if provided)      |
| `isActive`     | boolean      | No       | Defaults to `true`                          |
| `fieldMapping` | object       | No       | Maps API response fields to internal fields |

### Field Mapping

The `fieldMapping` object tells the system how to extract data from the external API response. It supports dot notation and bracket notation for nested fields.

| Field       | Type   | Required | Description                                       |
| ----------- | ------ | -------- | ------------------------------------------------- |
| `id`        | string | Yes      | Path to the unique identifier in the API response |
| `name`      | string | Yes      | Path to the display name                          |
| `file`      | string | Yes      | Path to the file URL or download link             |
| `category`  | string | No       | Path to the category field                        |
| `thumbnail` | string | No       | Path to the thumbnail image URL                   |

**Dot notation examples:**

| Expression                                         | Resolves to                                |
| -------------------------------------------------- | ------------------------------------------ |
| `"tags.0"`                                         | First element of the `tags` array          |
| `"previews.preview-hq-mp3"`                        | Nested key with a hyphen                   |
| `"thumbnails.images.0.url"`                        | Deeply nested value                        |
| `"archives.source.url ?? thumbnails.images.0.url"` | Fallback chain — first non-null value wins |

---

### 6.1 Preset: Poly Pizza (3D Models)

Get your API key at [https://poly.pizza](https://poly.pizza) (requires account registration).

```json
{
  "name": "Poly Pizza",
  "url": "https://api.poly.pizza/v1.1/search",
  "type": "MODEL_3D",
  "key": "your-poly-pizza-api-key",
  "fieldMapping": {
    "id": "ID",
    "name": "Title",
    "file": "Download",
    "thumbnail": "Thumbnail",
    "category": "Category"
  }
}
```

---

### 6.2 Preset: Freesound (Audio)

Get your API key at [https://freesound.org/apiv2/apply](https://freesound.org/apiv2/apply) (requires account registration).

```json
{
  "name": "Freesound",
  "url": "https://freesound.org/apiv2/search/text/",
  "type": "SOUND",
  "key": "your-freesound-api-key",
  "fieldMapping": {
    "id": "id",
    "name": "name",
    "file": "previews.preview-hq-mp3",
    "category": "tags.0"
  }
}
```

---

### 6.3 Preset: Sketchfab (3D Models — Limited)

Get your API token from your Sketchfab account settings.

```json
{
  "name": "Sketchfab",
  "url": "https://api.sketchfab.com/v3/models",
  "type": "MODEL_3D",
  "key": "your-sketchfab-token",
  "fieldMapping": {
    "id": "uid",
    "name": "name",
    "file": "archives.source.url",
    "thumbnail": "thumbnails.images.0.url",
    "category": "categories.0.name"
  }
}
```

> **Note:** Sketchfab GLB download requires OAuth. Browsing and search work, but direct file download may be restricted depending on the model's license and your account tier.

---

### 6.4 Toggling an Integration

Send `PATCH /settings/integrations/{id}/toggle` with no request body. The `isActive` flag is inverted automatically. Inactive integrations are not queried by the frontend.

---

## 7. User Management

### 7.1 Creating a User

**Endpoint:** `POST /user` — ADMIN or SUPERVISOR

```json
{
  "email": "jean.dupont@example.com",
  "first_name": "Jean",
  "last_name": "Dupont",
  "pseudo": "jeandupont",
  "role": "INTERN"
}
```

**Behaviour:**

- A temporary password is auto-generated in the format: `ROLE@pseudo{year}` (e.g. `INTERN@jeandupont2026`)
- A welcome email is sent automatically via Resend containing the temporary password
- The user must change their password on first login

**Role creation rules:**

| Creator    | Can create         |
| ---------- | ------------------ |
| ADMIN      | SUPERVISOR, INTERN |
| SUPERVISOR | INTERN only        |

---

### 7.2 Updating a User

**Endpoint:** `PATCH /user/:id`

All fields are optional, but at least one must be provided.

```json
{
  "email": "new.email@example.com",
  "first_name": "Jean-Pierre",
  "last_name": "Dupont"
}
```

---

### 7.3 Changing a User's Role

**Endpoint:** `PATCH /user/:id/role`

```json
{
  "role": "SUPERVISOR"
}
```

**Rules:**

- ADMIN can change any user's role except another ADMIN's
- SUPERVISOR can only set a role to INTERN

---

### 7.4 Activating / Deactivating a User

**Endpoint:** `PATCH /user/:id/active` — ADMIN only

```json
{
  "isActive": false
}
```

Deactivated users cannot log in and will receive a `401 Unauthorized` response.

---

### 7.5 Deleting a User

**Endpoint:** `DELETE /user/:id`

| Role       | Can delete           |
| ---------- | -------------------- |
| ADMIN      | Any non-ADMIN user   |
| SUPERVISOR | INTERN accounts only |

> **Warning:** This action is irreversible. There is no soft-delete or recovery mechanism.

---

## 8. Asset Management

### 8.1 Uploading a Single Asset

**Endpoint:** `POST /asset` — ADMIN only  
**Content-Type:** `multipart/form-data`

| Field       | Type   | Required | Description                                            |
| ----------- | ------ | -------- | ------------------------------------------------------ |
| `file`      | File   | Yes      | The asset file (`.glb`, `.gltf`, `.mp3`, `.png`, etc.) |
| `thumbnail` | File   | No       | Thumbnail image                                        |
| `name`      | string | Yes      | Display name                                           |
| `category`  | string | Yes      | `MODEL_3D`, `SOUND`, `IMAGE`, or `OTHER`               |
| `assetType` | string | No       | See asset type values below                            |
| `tags`      | string | No       | JSON array string, e.g. `'["nature","tree"]'`          |

**Available `assetType` values:**

`ANIMALS`, `NATURE`, `BUILDINGS`, `PEOPLE_AND_CHARACTERS`, `FURNITURE_AND_DECOR`, `OBJECTS`, `TRANSPORT`, `WEAPONS`, `FOOD_AND_DRINK`, `SCENES_AND_LEVELS`, `CLUTTER`, `OTHER`

---

### 8.2 Bulk Upload

**Endpoint:** `POST /asset/bulk` — ADMIN only  
**Content-Type:** `multipart/form-data`

| Field        | Description                        |
| ------------ | ---------------------------------- |
| `files`      | Up to 50 asset files               |
| `thumbnails` | Optional matching thumbnail images |

---

### 8.3 Listing Assets

**Endpoint:** `GET /asset/list` — Authenticated

| Query Parameter | Description                                        |
| --------------- | -------------------------------------------------- |
| `category`      | Filter by `MODEL_3D`, `SOUND`, `IMAGE`, or `OTHER` |
| `search`        | Case-insensitive text search on asset name         |
| `tags`          | Comma-separated tag filter (e.g. `nature,outdoor`) |
| `page`          | Page number (default: `1`)                         |
| `limit`         | Items per page (default: `20`)                     |

The response includes `fileUrl` and `thumbnailUrl` as resolved public URLs (not raw storage keys).

---

## 9. Organisation Settings

### Org Codes

**Endpoint:** `PATCH /settings/org` — ADMIN only

```json
{
  "orgCode": 202026,
  "orgParentalCode": 2026
}
```

| Field             | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `orgCode`         | 6-digit minimum code that SUPERVISOR accounts must provide at registration |
| `orgParentalCode` | 4-digit minimum parental code for INTERN accounts                          |

These codes act as registration gates. Rotate them between workshop sessions to control access.

---

## 10. Common Errors & Troubleshooting

| Error                                           | Cause                                           | Fix                                                                      |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| `401 Aucun token fourni`                        | Missing or expired JWT                          | Re-login to obtain a fresh token                                         |
| `403 Accès refusé`                              | Role does not have permission for this action   | Use an ADMIN account for this operation                                  |
| `400 URL ou clé API invalide`                   | Integration URL unreachable or API key rejected | Verify the URL and key are correct and the external service is reachable |
| `400 Provider invalide`                         | Wrong storage provider value                    | Use one of: `S3`, `R2`, `GCS`, `AZURE`, `MINIO`, `LOCAL`                 |
| `500 LocalAdapter cannot be used in production` | Storage not configured in production            | Configure a cloud storage provider via `PATCH /storage`                  |
| Assets return broken URLs                       | `publicUrl` not set or incorrect                | Verify `publicUrl` in storage config matches your CDN or bucket URL      |
| Emails not sent                                 | `RESEND_API_KEY` missing or invalid             | Check the Resend dashboard and update the environment variable           |
| Database connection error                       | Wrong `DATABASE_URL`                            | Verify host, port, credentials, and database name                        |

---

## 11. Security Notes

- **JWT expiry:** Tokens expire after 7 days by default (`JWT_EXPIRES_IN`). Reduce this value in production environments that require stricter session control.
- **JWT secret:** `JWT_SECRET` must be at least 32 characters. Use a cryptographically random string generated with a tool like `openssl rand -hex 32`. Never reuse secrets across environments.
- **Storage credentials:** `accessKey` and `secretKey` are stored in the database. Ensure your database is not publicly accessible and is protected by network-level controls.
- **Admin registration code:** The `ADMIN_CODE` environment variable controls who can self-register as ADMIN. Treat it as a secret and rotate it if compromised.
- **Rate limiting:** The API enforces a limit of 60 requests per minute per IP address. This can be adjusted in `apps/api/src/main.ts` if your use case requires different thresholds.
- **File uploads:** All uploads are validated by MIME type and file extension. Maximum file size is 100 MB. Do not disable these checks in production.
- **CORS:** The `CORS_ORIGIN` variable restricts which frontend origins can call the API. Set it to the exact frontend URL in production — avoid using wildcards (`*`).
