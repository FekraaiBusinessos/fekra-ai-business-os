import { integer, pgTable, serial, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tenants (المنشآت والمستأجرين - Multi-tenant Isolation)
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').notNull().unique(), // e.g. ten_01jk...
  businessName: text('business_name').notNull(),
  industry: text('industry').default('general'),
  brandLockScore: integer('brand_lock_score').default(100),
  activePhase: integer('active_phase').default(1),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Users (المستخدمين وربطهم مع Firebase Auth و Tenants)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  tenantId: text('tenant_id').references(() => tenants.tenantId),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('owner'), // owner, admin, agent_operator, viewer
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Cognitive Knowledge Base (الأساس الإدراكي وقاعدة المعرفة - Phase 1)
export const knowledgeEntries = pgTable('knowledge_entries', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  title: text('title').notNull(),
  category: text('category').default('general'), // policy, offer, psychology_rule, product, brand_voice
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Agent Skills Matrix & Behaviors (عقول الوكلاء والمحفزات النفسية)
export const agentCapabilities = pgTable('agent_capabilities', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  agentName: text('agent_name').notNull(), // sales_closer, negotiator, visual_director, analyst
  psychologicalTriggers: jsonb('psychological_triggers').$type<string[]>().default(['pain_amplification', 'authority', 'urgency']),
  skillMatrix: jsonb('skill_matrix').$type<Record<string, unknown>>().default({}),
  systemPromptPreset: text('system_prompt_preset'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Visual Productions & Generated Assets (توليدات الفيديو والصور)
export const visualProductions = pgTable('visual_productions', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  userId: text('user_id').references(() => users.uid),
  type: text('type').notNull(), // video, image, banner, story
  prompt: text('prompt').notNull(),
  assetUrl: text('asset_url').notNull(),
  aspectRatio: text('aspect_ratio').default('16:9'),
  metaInfo: jsonb('meta_info').$type<Record<string, unknown>>().default({}),
  isCommunityShowcase: boolean('is_community_showcase').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// PHASE 3: EXECUTION ENGINE (المحاسبة، المخزون، والـ ERP)
// ==========================================

// 6. Inventory Items & Stock Control (المخزون والمنتجات وتكلفة البضاعة)
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  category: text('category').default('general'),
  unitPrice: integer('unit_price').notNull(), // بالهللة/سنت لتجنب أخطاء الفاصلة
  costPrice: integer('cost_price').default(0), // تكلفة البضاعة COGS
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  reorderLevel: integer('reorder_level').default(5).notNull(), // حد التنبيه للنفاذ
  currency: text('currency').default('SAR').notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Invoices & Deals (الفواتير الضريبية وصفقات المحادثات)
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(), // e.g. INV-2026-001
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  subtotal: integer('subtotal').notNull(), // بالهللة
  taxAmount: integer('tax_amount').default(0).notNull(), // 15% VAT
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').default('SAR').notNull(),
  status: text('status').default('paid').notNull(), // draft, pending, paid, cancelled
  paymentMethod: text('payment_method').default('mada'), // mada, visa, cash, transfer
  sourceAgent: text('source_agent').default('sales_closer'), // الوكيل الذي أغلق الصفقة
  zatcaQrCode: text('zatca_qr_code'), // كود الفاتورة الضريبية ZATCA
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Invoice Line Items (بنود الفاتورة)
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  inventoryItemId: integer('inventory_item_id').references(() => inventoryItems.id),
  itemDescription: text('item_description').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: integer('unit_price').notNull(),
  lineTotal: integer('line_total').notNull(),
});

// 9. Financial Transactions (دفتر الأستاذ والتدفقات المالية اليومية)
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  type: text('type').notNull(), // revenue, expense, refund
  category: text('category').notNull(), // sales, supplier, marketing, operational
  amount: integer('amount').notNull(),
  currency: text('currency').default('SAR').notNull(),
  description: text('description').notNull(),
  transactionDate: timestamp('transaction_date').defaultNow().notNull(),
});

// 10. Social Media Integrations & Connections (شبكة ربط حسابات التواصل متعددة المنصات)
export const socialConnections = pgTable('social_connections', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  platformId: text('platform_id').notNull(), // instagram, tiktok, youtube, twitter, facebook, linkedin, pinterest, threads, whatsapp
  platformName: text('platform_name').notNull(),
  handle: text('handle').notNull(),
  username: text('username'),
  avatarUrl: text('avatar_url'),
  isConnected: boolean('is_connected').default(false).notNull(),
  autoSync: boolean('auto_sync').default(true).notNull(),
  autoReply: boolean('auto_reply').default(false).notNull(),
  accessTokenHint: text('access_token_hint'),
  metaPageId: text('meta_page_id'),
  metaAppId: text('meta_app_id'),
  wabaPhoneNumberId: text('waba_phone_number_id'),
  webhookVerifyToken: text('webhook_verify_token'),
  encryptedAccessToken: text('encrypted_access_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  followersCount: text('followers_count').default('0'),
  healthStatus: text('health_status').default('healthy'), // healthy, token_expired, warning
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Affiliates & Partner Program (نظام المسوقين والشراكة بالعمولة)
export const affiliates = pgTable('affiliates', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  referralCode: text('referral_code').notNull().unique(), // e.g. FEKRA-PRO-99
  commissionRatePercent: integer('commission_rate_percent').default(15).notNull(), // 15% default
  totalEarningsSar: integer('total_earnings_sar').default(0).notNull(), // in Halalas (cents)
  paidEarningsSar: integer('paid_earnings_sar').default(0).notNull(),
  pendingEarningsSar: integer('pending_earnings_sar').default(0).notNull(),
  status: text('status').default('active').notNull(), // active, suspended
  payoutMethod: text('payout_method').default('bank_transfer'), // bank_transfer, vodafone_cash, stc_pay
  payoutDetails: text('payout_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Referral Clicks & Session Attribution (تتبع نقرات الإحالة)
export const referralClicks = pgTable('referral_clicks', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  affiliateId: integer('affiliate_id').references(() => affiliates.id).notNull(),
  referralCode: text('referral_code').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sourceUrl: text('source_url'),
  converted: boolean('converted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Affiliate Commissions (سجل العمولات المستحقة للفواتير)
export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  affiliateId: integer('affiliate_id').references(() => affiliates.id).notNull(),
  invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  orderAmountSar: integer('order_amount_sar').notNull(), // Halalas
  commissionAmountSar: integer('commission_amount_sar').notNull(), // Halalas
  commissionPercent: integer('commission_percent').notNull(),
  status: text('status').default('pending').notNull(), // pending, approved, paid
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  users: many(users),
  knowledgeEntries: many(knowledgeEntries),
  agentCapabilities: many(agentCapabilities),
  visualProductions: many(visualProductions),
  inventoryItems: many(inventoryItems),
  invoices: many(invoices),
  financialTransactions: many(financialTransactions),
  socialConnections: many(socialConnections),
  affiliates: many(affiliates),
  tenantApiKeys: many(tenantApiKeys),
  tenantKnowledgeSources: many(tenantKnowledgeSources),
  customers: many(customers),
  marketingCampaigns: many(marketingCampaigns),
  apiVault: one(tenantApiVault),
  brandDna: one(brandDna),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.tenantId],
  }),
  visualProductions: many(visualProductions),
}));

export const knowledgeEntriesRelations = relations(knowledgeEntries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [knowledgeEntries.tenantId],
    references: [tenants.tenantId],
  }),
}));

export const visualProductionsRelations = relations(visualProductions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [visualProductions.tenantId],
    references: [tenants.tenantId],
  }),
  user: one(users, {
    fields: [visualProductions.userId],
    references: [users.uid],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [inventoryItems.tenantId],
    references: [tenants.tenantId],
  }),
  invoiceItems: many(invoiceItems),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.tenantId],
  }),
  items: many(invoiceItems),
  transactions: many(financialTransactions),
  commissions: many(commissions),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [invoiceItems.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [financialTransactions.tenantId],
    references: [tenants.tenantId],
  }),
  invoice: one(invoices, {
    fields: [financialTransactions.invoiceId],
    references: [invoices.id],
  }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  tenant: one(tenants, {
    fields: [socialConnections.tenantId],
    references: [tenants.tenantId],
  }),
}));

export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [affiliates.tenantId],
    references: [tenants.tenantId],
  }),
  clicks: many(referralClicks),
  commissions: many(commissions),
}));

export const referralClicksRelations = relations(referralClicks, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [referralClicks.affiliateId],
    references: [affiliates.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [commissions.affiliateId],
    references: [affiliates.id],
  }),
  invoice: one(invoices, {
    fields: [commissions.invoiceId],
    references: [invoices.id],
  }),
}));

// 12. Tenant API Keys & Integrations Vault (AES-256 Encrypted)
export const tenantApiKeys = pgTable('tenant_api_keys', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  serviceName: text('service_name').notNull(), // 'gemini' | 'telegram' | 'meta' | 'whatsapp'
  keyIdentifier: text('key_identifier'), // masked preview e.g. "AIza...W1E"
  encryptedSecret: text('encrypted_secret').notNull(), // AES-256-GCM ciphertext
  iv: text('iv').notNull(), // hex IV
  authTag: text('auth_tag').notNull(), // hex GCM tag
  extraConfig: jsonb('extra_config').$type<Record<string, unknown>>().default({}),
  status: text('status').default('active'), // 'active' | 'untested' | 'revoked'
  lastTestedAt: timestamp('last_tested_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Tenant Knowledge Sources & Google Drive Hub
export const tenantKnowledgeSources = pgTable('tenant_knowledge_sources', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  sourceType: text('source_type').notNull(), // 'drive' | 'text' | 'file'
  title: text('title').notNull(),
  driveFolderId: text('drive_folder_id'),
  driveFileId: text('drive_file_id'),
  extractedText: text('extracted_text'),
  chunksCount: integer('chunks_count').default(1),
  syncStatus: text('sync_status').default('synced'), // 'synced' | 'syncing' | 'failed'
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tenantApiKeysRelations = relations(tenantApiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantApiKeys.tenantId],
    references: [tenants.tenantId],
  }),
}));

export const tenantKnowledgeSourcesRelations = relations(tenantKnowledgeSources, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantKnowledgeSources.tenantId],
    references: [tenants.tenantId],
  }),
}));

// 14. Tenant API Vault (P0 Production - Encrypted Multi-Tenant API Hub)
export const tenantApiVault = pgTable('tenant_api_vault', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull().unique(),
  geminiApiKeyEncrypted: text('gemini_api_key_encrypted'),
  telegramBotTokenEncrypted: text('telegram_bot_token_encrypted'),
  metaAccessTokenEncrypted: text('meta_access_token_encrypted'),
  metaPageId: text('meta_page_id'),
  wabaPhoneNumberId: text('waba_phone_number_id'),
  webhookSecret: text('webhook_secret').notNull(),
  geminiStatus: text('gemini_status').default('untested'), // 'connected' | 'untested' | 'failed'
  telegramStatus: text('telegram_status').default('untested'),
  metaStatus: text('meta_status').default('untested'),
  wabaStatus: text('waba_status').default('untested'),
  lastTestedAt: timestamp('last_tested_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantApiVaultRelations = relations(tenantApiVault, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantApiVault.tenantId],
    references: [tenants.tenantId],
  }),
}));

// ==========================================
// PHASE 4 & CRM: OMNICHANNEL MARKETING & CUSTOMER MANAGEMENT
// ==========================================

// 15. Customers (إدارة العملاء وتجزئة الشرائح - Multi-Tenant CRM)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  channel: text('channel').default('whatsapp'), // whatsapp, telegram, instagram, web
  segment: text('segment').default('lead').notNull(), // 'vip' | 'lead' | 'cart_abandoned' | 'loyal'
  tags: jsonb('tags').$type<string[]>().default([]),
  totalSpentCents: integer('total_spent_cents').default(0).notNull(), // in Halalas/cents
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.tenantId],
  }),
}));

// 16. Marketing Campaigns (حملات التسويق الموحدة، الفيديوهات، والكتابة الإعلانية)
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  name: text('name').notNull(),
  targetSegment: text('target_segment').default('all').notNull(), // 'all' | 'vip' | 'lead' | 'cart_abandoned' | 'loyal'
  productId: integer('product_id').references(() => inventoryItems.id),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  copyText: text('copy_text'),
  hooksJson: jsonb('hooks_json').$type<Record<string, unknown> | Array<unknown>>().default({}),
  pricingTiersJson: jsonb('pricing_tiers_json').$type<Record<string, unknown> | Array<unknown>>().default({}),
  status: text('status').default('draft').notNull(), // 'draft' | 'published' | 'dispatched'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const marketingCampaignsRelations = relations(marketingCampaigns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [marketingCampaigns.tenantId],
    references: [tenants.tenantId],
  }),
  product: one(inventoryItems, {
    fields: [marketingCampaigns.productId],
    references: [inventoryItems.id],
  }),
}));

// ==========================================
// PHASE 6 & SELF-EVOLUTION: AUTONOMOUS CONSCIOUSNESS & STABLE RELEASES
// ==========================================

// 17. Autonomous Evolution Cycles (سجل التطور الذاتي والتحسين التلقائي للوكلاء)
export const evolutionCycles = pgTable('evolution_cycles', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  cycleType: text('cycle_type').default('auto_optimization').notNull(), // 'auto_optimization' | 'sentiment_recalibration' | 'prompt_tuning'
  triggerReason: text('trigger_reason').notNull(),
  optimizationsApplied: jsonb('optimizations_applied').$type<Record<string, unknown> | Array<unknown>>().default([]),
  consciousnessScoreBefore: integer('consciousness_score_before').default(88).notNull(),
  consciousnessScoreAfter: integer('consciousness_score_after').default(96).notNull(),
  status: text('status').default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const evolutionCyclesRelations = relations(evolutionCycles, ({ one }) => ({
  tenant: one(tenants, {
    fields: [evolutionCycles.tenantId],
    references: [tenants.tenantId],
  }),
}));

// 18. Continuous Stable Releases & Snapshots (تصدير النسخ المستقرة ولقطات النظام)
export const systemReleases = pgTable('system_releases', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  versionTag: text('version_tag').notNull(), // e.g. v5.1.0-STABLE
  releaseTitle: text('release_title').notNull(),
  changelog: text('changelog'),
  stabilityScore: integer('stability_score').default(99).notNull(), // 0-100%
  snapshotData: jsonb('snapshot_data').$type<Record<string, unknown>>().default({}),
  isGoldenRelease: boolean('is_golden_release').default(true).notNull(),
  checksum: text('checksum').notNull(),
  exportedAt: timestamp('exported_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// FORENSIC AUDIT TRAIL: IMMUTABLE EVIDENCE CHAIN (الأدلة الجنائية الرقمية المشفرة)
// ==========================================

// 19. Forensic Audit Logs (سجل الأدلة الجنائية الرقمية المشفر وسلسلة النزاهة غير القابلة للتلاعب)
export const forensicAuditLogs = pgTable('forensic_audit_logs', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull(),
  eventType: text('event_type').notNull(), // 'AGENT_CONVERSATION_CLOSING' | 'ZATCA_INVOICE_GENERATION' | 'AUTONOMOUS_MUTATION' | 'VAULT_ACCESS' | 'VOICE_NEGOTIATION_CALL' | 'GOLDEN_RELEASE_CREATION' | 'SOCIAL_LEAD_CONVERSION' | 'CHAIN_GENESIS'
  actor: text('actor').notNull(), // 'Sales Closer Agent' | 'Omni-Council Executive' | 'ZATCA Tax Sentinel' | 'Autonomous Scheduler' | 'Voice Negotiator'
  evidencePayload: jsonb('evidence_payload').$type<Record<string, unknown>>().default({}),
  prevHash: text('prev_hash').notNull(), // Hash chaining for forensic proof (SHA-256 of preceding block)
  recordHash: text('record_hash').notNull(), // SHA-256 of (prevHash + eventType + actor + canonicalPayload + timestamp)
  signature: text('signature').notNull(), // Cryptographic signature / proof seal (HMAC-SHA256)
  verificationStatus: text('verification_status').default('VERIFIED_UNALTERED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forensicAuditLogsRelations = relations(forensicAuditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [forensicAuditLogs.tenantId],
    references: [tenants.tenantId],
  }),
}));

// 20. Brand DNA & Visual Constitution (الهوية البصرية والدستور اللوني وقفل الوجوه والأنماط)
export const brandDna = pgTable('brand_dna', {
  id: serial('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.tenantId).notNull().unique(),
  brandName: text('brand_name').notNull(),
  industry: text('industry').default('general').notNull(),
  logoUrl: text('logo_url'),
  decorImages: jsonb('decor_images').$type<string[]>().default([]),
  primaryColor: text('primary_color').default('#06B6D4').notNull(),
  secondaryColor: text('secondary_color').default('#8B5CF6').notNull(),
  neutralColor: text('neutral_color').default('#0F172A').notNull(),
  colorGradingFilter: text('color_grading_filter').default('contrast(1.05) saturate(1.1) brightness(1.02)').notNull(),
  brandPersonality: text('brand_personality').default('Elite Professional, Dynamic, High Conversion').notNull(),
  typographyPreset: text('typography_preset').default('Sticker-Style Arabic Bold').notNull(),
  faceLockProfile: jsonb('face_lock_profile').$type<Record<string, unknown>>().default({}),
  dnaSummary: jsonb('dna_summary').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const brandDnaRelations = relations(brandDna, ({ one }) => ({
  tenant: one(tenants, {
    fields: [brandDna.tenantId],
    references: [tenants.tenantId],
  }),
}));



