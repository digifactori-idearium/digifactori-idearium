# DigiFactori Idearium — Technical Handover & Release Notes

**Version:** 1.0.0
**Date:** May 2026  
**Target Users:** Children aged 6–12 (Interns), Supervisors, Administrators  
**Audience:** Future Development Teams, Maintainers, Technical Operators

---

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Architecture Summary](#2-architecture-summary)
3.  [Implemented Features](#3-implemented-features)
4.  [System Optimizations Required](#4-system-optimizations-required)
5.  [Features Not Yet Implemented](#5-features-not-yet-implemented)
6.  [Technical Debt & Improvements](#6-technical-debt--improvements)
7.  [Known Issues](#7-known-issues)
8.  [Security Improvements Needed](#8-security-improvements-needed)
9.  [3D Engine & Performance Notes](#9-3d-engine--performance-notes)
10. [Recommended Next Priorities](#10-recommended-next-priorities)
11. [Final Notes for Future Teams](#11-final-notes-for-future-teams)

---

## 1. Project Overview

DigiFactori Idearium is an educational creative platform designed for children aged 6–12 to participate in hackathon-style workshops and collaborative digital creation experiences.

The platform combines:

- **3D Ideorama spaces**
- **Voxel model editing**
- **Asset management**
- **Educational creativity tools**
- **Supervisor/Intern management**
- **Multi-provider cloud storage**
- **External integrations for educational assets**

The system is structured as a **monorepo**.

---

## 2. Architecture Summary

| Component          | Technology                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Frontend**       | React + TypeScript                                                         |
| **Backend**        | Node.js + Express                                                          |
| **Database**       | PostgreSQL                                                                 |
| **ORM**            | Prisma (Primary), TypeORM (Legacy modules)                                 |
| **3D Engine**      | Three.js / React Three Fiber                                               |
| **Deployment**     | Netlify (FE) + Render (BE)                                                 |
| **Authentication** | JWT                                                                        |
| **Email Service**  | Resend                                                                     |
| **Storage**        | Multi-provider (S3/R2/GCS/Azure/MinIO/Local) configured via Admin Settings |
| **Admin Settings** | Parental codes, Org codes, Storage config, Integrations                    |

---

## 3. Implemented Features

### Authentication & Security

- JWT authentication (login, register, password reset)
- Protected routes & role-based permissions
- Admin registration system
- Active/inactive user management

### User Roles

| Role           | Key Capabilities Implemented                                         |
| -------------- | -------------------------------------------------------------------- |
| **ADMIN**      | Full access, user/storage/integration/asset management, org settings |
| **SUPERVISOR** | Intern management (create, delete, update role)                      |
| **INTERN**     | Profile access, Ideorama, Voxel editor, personal assets/projects     |

### Admin Settings Panel

Centralized configuration management accessible only to ADMIN users:

| Setting Type              | Description                                            | Managed Via    |
| ------------------------- | ------------------------------------------------------ | -------------- |
| **Org Code**              | 6-digit code for SUPERVISOR registration               | Admin Settings |
| **Parental Code**         | 4-digit code for INTERN registration                   | Admin Settings |
| **Storage Configuration** | Cloud provider credentials & settings                  | Admin Settings |
| **Integrations**          | External API connections (Poly Pizza, Freesound, etc.) | Admin Settings |

> **Note:** All settings are stored in the database and can be updated without redeploying the application.

### Asset Management

- Single & bulk upload (up to 50 files, 100MB each)
- Categorization, tagging, search/filtering
- Thumbnail management
- Storage abstraction layer with public URL resolution

**Supported Asset Types:** 3D Models (.glb, .gltf), Images, Audio, PDF, JSON, ZIP

### Storage System

- **Implemented Providers:** AWS S3, Cloudflare R2, Google Cloud Storage, Azure Blob Storage, MinIO, Local
- **Features:** Dynamic switching, credential testing, database persistence

### Integrations System

- External API integrations with dynamic field mapping (Poly Pizza, Freesound, Sketchfab)
- Integration toggling & API key support

### Welcoming Space for Children

- Colorful(day,night), animated 3D environment designed for ages 6-12
- Intuitive navigation with child-friendly controls
- Quick access to Ideorama, Voxel Editor, and learning activities
- No complex menus

### 3D Ideorama Space

- 3D environment rendering, object placement, camera system
- Autosave support
- Asset loading, scene navigation and conifiguration, model importing
- Like system interns can appreciate each other's Ideoramas
- Collaborative viewing (view-only for non-creators)

### Voxel Model Editor

- Voxel editing system, camera controls, model manipulation
- Autosave support
- Save/load support

### Text Editor

- Child-friendly rich text editor built with Tiptap
- Autosave support: prevents data loss for young users
- Simple, distraction-free interface designed for ages 6-12
- Basic formatting options (bold, italic, lists,...)

### Organisation & Email

- Organisation & parental access codes for session control
- Welcome & password reset emails (Resend integration)

#### Social Interaction Features

| Feature                        | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| **User Following/Unfollowing** | Interns can follow other interns                |
| **Ideorama Likes**             | Like and appreciate community-created 3D spaces |

---

## 4. System Optimizations Required

### 4.1 Asset URL Management Optimization

- Improve asset URL handling across different storage providers
- Implement URL caching and CDN optimization
- Better error handling for broken asset links
- Support for versioned asset URLs
- Cross-provider URL consistency

### 4.2 3D Rendering Optimization (High Priority)

**Goal:** Maintain smooth FPS on low-end educational devices.

- Optimize GPU rendering pipeline (reduce draw calls, improve batching)
- Improve texture compression & shader usage
- Add Level of Detail (LOD) & instanced rendering
- Implement better scene culling

### 4.3 Particles Management

- Move particles to GPU-based processing
- Implement particle pooling & frustum culling
- Add dynamic particle limits & performance fallbacks

### 4.4 Gizmo Optimization (Ideorama)

- Optimize transform controls & object snapping
- Reduce unnecessary updates & improve raycasting
- Enhance mobile interaction handling
- Add preview thumbnail for each ideorama in the list (currently no visual preview, making element identification difficult)

### 4.5 Camera Management (Voxel Editor)

- Add smooth interpolation & better orbit controls
- Implement camera collision handling & zoom constraints
- Improve mobile-friendly controls & focus targeting
- Add preview thumbnail for each voxel model in the list (currently no visual preview, making element identification difficult)

### 4.6 Intern Idea Management

- Child-friendly UI with better project organization
- Improved saving system, idea categorization, session persistence

### 4.7 Email Service Improvements

- Add retry queue, status tracking, and fallback provider
- Improve transactional templates & monitoring/logging

### 4.8 Admin Code Security

- Hash admin codes with expiration & one-time invite system
- Add audit logs, rate limiting, and IP restrictions

### 4.9 More Avatars for Interns

- Add diverse, child-friendly, cartoon-style avatars
- Include educational themes and basic customization

---

## 5. Features Not Yet Implemented

### Communication & Collaboration

- Voice recording for interns
- Intern group joining
- Files & project sharing
- Team-based Ideorama spaces

### Group Management

- Supervisor-managed intern groups
- Classroom/group management, invitations, permissions

### Activity Tracking

- Intern activity monitoring & session history
- Learning progress analytics & participation metrics

### Notifications

- Real-time & email notifications
- Activity alerts for groups and supervisors

### Ideorama and Voxel Model Advanced Features

- Direct model modification inside Ideorama
- Custom triggers/actions for objects (interactive scripting)
- Ideorama-to-Ideorama transitions & portal systems
- Voxel model like system (Ideoramas have likes, but individual voxel models do not)

---

## 6. Technical Debt & Improvements

| Area         | Required Improvements                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **Frontend** | State management, reduce renders, mobile/responsive fixes, a11y                                        |
| **Backend**  | Service modularization, automated tests, better validation, logging                                    |
| **Database** | Query optimization, indexing, migration strategy, audit tables                                         |
| **DevOps**   | Improve CI/CD pipeline, staging env, automated backups, monitoring                                     |
| **Testing**  | Increase unit test coverage (currently very low due to time constraints). Add integration & E2E tests. |

---

## 7. Known Issues

| Issue                | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| Heavy 3D scenes      | FPS drops on low-end devices                                              |
| Particle overload    | Performance degrades in complex scenes                                    |
| Camera instability   | Some camera angles behave inconsistently                                  |
| Email delivery       | Not well define                                                           |
| Large asset uploads  | Potential timeout on weak connections                                     |
| Mobile interactions  | Certain 3D interactions are difficult on tablets                          |
| API pagination       | Certain APIs lack proper pagination for large datasets                    |
| Admin Settings       | Changing storage provider while assets exist may break existing file URLs |
| Integration settings | No validation for fieldMapping structure before saving                    |

---

## 8. Security Improvements Needed

- Two-factor authentication (2FA)
- Better session management & device tracking
- Admin audit logs
- API abuse detection & upload scanning
- Security headers hardening & token rotation

---

## 9. 3D Engine & Performance Notes

**Critical Constraints (Targeting children 6–12):**

- Many users have low-end devices or tablets
- Smooth camera movement & minimal UI complexity are essential
- Interactions must remain intuitive

**Recommendations:**

- Prefer lightweight models; avoid high-poly scenes
- Limit simultaneous particle effects
- Aggressively optimize memory usage
- Use progressive loading for large scenes

---

## 10. Recommended Next Priorities

| Phase | Focus                                                                                        |
| ----- | -------------------------------------------------------------------------------------------- |
| **1** | **Stabilization:** 3D rendering, camera systems, email reliability, mobile experience        |
| **2** | **Collaboration:** Intern group system, project sharing, team Ideorama spaces, notifications |
| **3** | **Educational Features:** Activity tracking, learning analytics, voice recording             |

---

## 11. Final Notes for Future Teams

The platform has a **strong foundation and core infrastructure**.

**Most important next steps:**

1.  Performance optimization (especially 3D/GPU)
2.  Child-friendly UX improvements
3.  Collaboration systems
4.  Better educational tooling
5.  Scalability improvements

**Always give special attention to:**

- Usability for children aged 6–12
- Low-end device compatibility
- Security of educational data
- Smooth 3D interactions

The architecture is **extensible** and can support future multiplayer, collaborative, and AI-assisted educational features with additional optimization and infrastructure improvements.
