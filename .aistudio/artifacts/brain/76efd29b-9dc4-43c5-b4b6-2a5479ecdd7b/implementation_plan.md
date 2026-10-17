# Architectural Reconstruction & Hyper-Engine Implementation Plan
## Fekra AI Business OS — Unified 6-Phase Cockpit & Zero-Hallucination Execution

### 1. Executive Summary & Directive Objectives
This plan outlines the systematic restructuring of the Fekra AI Business OS into a unified, zero-defect production platform aligned with the Master Protocol v5.0 and the mastermind's decisions:
- **Cockpit Architecture**: Single Unified 6-Phase Production Command Center with an instant mode switcher, eliminating the 14 fragmented studios and mobile viewport floating button collisions.
- **Tenant Adaptation & Super Admin**: Dynamic industry adaptation switcher (Restaurants, Clinics, Retail, Real Estate, Gyms) with tenant module toggles and role-based permissions.
- **Public QR-Ready Store/Menu**: Dedicated public routing (`/menu/:tenantId` and `/store/:tenantId`) with direct POS catalog pulls, Egyptian phone validation, interactive cart, table selection, and instant WhatsApp order routing with CRM auto-sync.
- **LEHGA Video & 15-Layer Visual DNA**: Real Google Imagen 3 synthesis pipeline coupled with authentic Egyptian dialect script generation (10 distinct psychological angles) and zero static fallback placeholders.
- **Zero-Error Gate Verification**: Resolving all TypeScript type mismatches in `server.ts` and `services/geminiService.ts`, verified via `tsc --noEmit`.

---

### 2. User Review & Architectural Decisions
- **Command Center Layout**: Unified 6-phase cockpit with instant mode switcher (AI Foundation -> Conversation Engine -> Execution Engine -> Marketing Engine -> Social Engine -> Business Brain).
- **Public Checkout Flow**: Instant WhatsApp order routing with background CRM & Google Sheets webhook sync.
- **Media Pipeline**: Complete 15-layer Visual DNA engine with authentic Egyptian dialect video scripts and Google Imagen 3 image generation.

---

### 3. Step-by-Step Implementation Steps

#### Step 1: Mobile Viewport & Collision Elimination
- **Files**: `App.tsx`, `components/Sidebar.tsx`, `components/MobileSidebarDrawer.tsx`
- **Actions**:
  - Remove redundant floating-action buttons (floating bag, lightning action, and overlay badges) that collide with the studio canvas on mobile screens.
  - Implement a clean, responsive bottom dock or cohesive header action bar that respects safe areas and prevents layout shifts.
  - Ensure 100% viewport compliance across mobile, tablet, and desktop viewports without z-index conflicts.

#### Step 2: The Real Super-Admin & Tenant Adaptation Hub
- **Files**: `components/SuperAdminControlRoom.tsx` (or refactored admin suite), `types.ts`, `server.ts`
- **Actions**:
  - Build granular Role-Based Access Control (SuperAdmin, Tenant Owner, Cashier, Courier, Branch Manager).
  - Implement dynamic industry switcher:
    - *Restaurants & Cafes*: Dine-in tables, QR digital menu, kitchen ticket system, delivery zones.
    - *Clinics & Medical*: Patient appointments, doctor schedules, consultation notes.
    - *Retail & Fashion*: Barcode scanning, SKU inventory, sizes/colors, loyalty points.
    - *Real Estate*: Property listings, unit booking, lead qualification pipeline.
    - *Gyms & Fitness*: Membership tiers, trainer booking, attendance tracking.
  - Add tenant module switches allowing instant activation/deactivation of POS, Public Menu, LEHGA Video, and Delivery Dispatch per tenant.

#### Step 3: Instant Public Digital Store & Menu (QR-Ready)
- **Files**: `components/PublicDigitalStore.tsx`, `App.tsx`, `server.ts`
- **Actions**:
  - Implement public view router handling `/menu/:tenantId` and `/store/:tenantId`.
  - Fetch active menu/catalog directly from POS inventory and tenant settings.
  - Interactive cart with Dine-in table selector, Takeaway, and Home Delivery modes.
  - Egyptian phone number validation regex (`^01[0125][0-9]{8}$`).
  - Order dispatch button generating pre-formatted WhatsApp order messages to the merchant with line items, total, and customer delivery coordinates, while automatically creating a lead/order in the CRM backend.

#### Step 4: Real LEHGA Video & 15-Layer Visual DNA Pipeline
- **Files**: `services/geminiService.ts`, `services/masterCinematicPipeline.ts`, `server.ts`
- **Actions**:
  - Fix Google Imagen 3 image synthesis parameters in `server.ts` and `geminiService.ts`, ensuring resilient API key rotation and error recovery.
  - Eliminate all hardcoded static image fallbacks (e.g. static watch image), replacing them with dynamic 15-layer cinematic compositing when generating assets.
  - Enhance LEHGA dialect engine with 10 commercial angles in authentic Egyptian colloquial Arabic (تضخيم الألم، استعراض الميزات، السخرية الذكية، الشهادة الحقيقية، المفاجأة السريعة، الصدمة الإيجابية، الإحراج اللطيف، التحدي، العرض الذي لا يرفض، الإلحاح الشديد).
  - Provide a live playable preview interface for generated scenes and audio narration timings.

#### Step 5: Verification & Zero-Defect Codebase
- **Files**: `server.ts`, `services/geminiService.ts`
- **Actions**:
  - Fix type errors in `server.ts` where Drizzle schema columns (`totalSpentCents`, `cryptographicStamp`, `invoiceNumber`) had mismatches.
  - Fix type errors in `services/geminiService.ts` (`imageUrl` property on `ImageFile`).
  - Run `npm run lint` (`tsc --noEmit`) to verify 0 errors.
  - Run `compile_applet` to confirm a successful build.

---

### 4. Verification & Testing Criteria
1. **Compilation**: `npm run lint` passes with exit code 0.
2. **Viewport Test**: Zero floating collisions on mobile viewports; clean layout without clipped containers.
3. **Public Store Test**: Direct access to `/menu/demo-tenant` renders responsive menu with working WhatsApp checkout.
4. **Media Pipeline Test**: Studio synthesis invokes real Imagen 3 / 15-layer engine without dummy fallback triggers.
