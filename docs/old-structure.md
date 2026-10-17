# OLD SYSTEM ARCHITECTURE AUDIT & RESTRUCTURING MANIFESTO
**Generated on**: 2026-10-16
**Status**: Deprecated & Consolidated into Fekra Unified 6-Phase Architecture

## 1. Identified Redundancies & Fragmented Studios
Prior to Master Protocol v8.0 restructuring, the codebase suffered from studio fragmentation across 14-18 disparate views and conflicting floating UI overlays:

### Fragmented Studio List (Old):
1. `creator_studio` (Creator Studio V4)
2. `omni_crm_studio` (Omni CRM Studio)
3. `photoshoot_director` (Photoshoot Director)
4. `prompt_studio` (Prompt Studio)
5. `voice_over_studio` (Voice Over Studio)
6. `campaign_studio` (Campaign Studio)
7. `plan_studio` (Plan Studio)
8. `edit_studio` (Edit Studio)
9. `storyboard_studio` (Storyboard Studio)
10. `marketing_studio` (Marketing Studio)
11. `controller_studio` (Controller Studio)
12. `video_flow_studio` (Video Flow Studio)
13. `social_hub_studio` (Social Hub Studio)
14. `community_brain_studio` (Community Brain Studio)
15. `execution_erp_studio` (Execution ERP Studio)
16. `business_brain_studio` (Business Brain Studio)
17. `integrations_vault_studio` (Integrations Vault Studio)
18. `branding_studio` (Branding Studio)

### UI Collisions & Overlapping Floating Overlays:
- `FloatingQuickNav.tsx` rendered at the bottom center, directly colliding with mobile bottom navigation bar (`App.tsx` lines 1490-1555).
- Redundant floating lightning/bag action buttons covering the studio canvas on mobile viewports.
- Duplicated sidebar navigation: `components/Sidebar.tsx` (desktop collapsed/expanded) vs `components/MobileSidebarDrawer.tsx` (mobile sheet) vs `components/UniversalNavBar.tsx` vs `TabBar.tsx`.

## 2. Target Unified 6-Phase Architectural Standard (Protocol v8.0):
The entire platform is unified into 6 coherent phases where **Registration = Interface Navigation = Backend Execution = Operating Units**:

- **Phase 1: AI Foundation (الأساس الإدراكي)**
  - Organization identity, Logo geometry, 3-color Brand DNA (1 Primary, 1 Secondary, 1 Neutral), Tenant ID, AES-256 Vault.
- **Phase 2: Conversation & Sales (محرك المحادثة والتفاوض)**
  - Dialect selection (Egyptian, Saudi, Khaleeji, Levantine), Face-Lock for commercial presenter (Sarah, Faisal, or custom biometrics).
- **Phase 3: Execution ERP & POS (ذراع التنفيذ والمخزون)**
  - Inventory items, ZATCA Phase 2 E-Invoicing with QR code, POS Cashier, Public QR Digital Store & Menu (`/menu/:tenantId`, `/store/:tenantId`).
- **Phase 4: Marketing & Production (محرك التسويق والإنتاج)**
  - Omni Studio with true Product-Lock: Main Product + Style Reference + Flow Veo 3.1 Video Engine + 15-Layer Visual DNA + 3D Typography Sticker.
- **Phase 5: Social Engine (المحرك الاجتماعي والنشر)**
  - 9 Platform Connectors (Meta, Instagram, TikTok, YouTube, X, LinkedIn, Pinterest, Threads, WhatsApp) + Webhook Vault + Autopilot Scheduler.
- **Phase 6: Business Brain & Super Admin (العقل الاستراتيجي والإدارة العليا)**
  - Unified Command Center Dashboard, Super Admin Multi-tenant Control, Role-Based Access (SuperAdmin, Tenant, Cashier, Courier), Forensics Audit Log.
