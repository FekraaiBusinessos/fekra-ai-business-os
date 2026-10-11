import { db } from '../src/db/index.ts';
import { tenants, users, knowledgeEntries, agentCapabilities, visualProductions } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function runForensicEndToEndTest() {
  console.log('====================================================');
  console.log('🧪 FEKRA AI OS - COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(title: string, condition: boolean, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      if (detail) console.log(`   └─ ${detail}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (detail) console.error(`   └─ Error: ${detail}`);
    }
  }

  // 1. Cloud SQL PostgreSQL Connectivity & Schema Integrity
  console.log('\n[TEST 1] Testing Cloud SQL & Tables Existence...');
  try {
    const tenantsList = await db.select().from(tenants);
    assert('Cloud SQL DB Connection & Query', tenantsList.length > 0, `Found ${tenantsList.length} tenants. Active tenant: ${tenantsList[0]?.tenantId}`);
  } catch (err: any) {
    assert('Cloud SQL DB Connection & Query', false, err.message);
  }

  // 2. Multi-Tenant Knowledge Base Verification (Phase 1 AI Foundation)
  console.log('\n[TEST 2] Verifying Cognitive Knowledge Base (AI Foundation)...');
  try {
    const knowledge = await db.select().from(knowledgeEntries).where(eq(knowledgeEntries.tenantId, 'ten_mastermind'));
    assert('Knowledge Entries Isolation', knowledge.length >= 2, `Retrieved ${knowledge.length} knowledge items for ten_mastermind.`);
    const hasBrandLock = knowledge.some(k => k.category === 'brand_voice' || k.title.includes('Brand Lock'));
    assert('Brand Lock Protocol Present', hasBrandLock, 'Found Brand Lock Protocol in cognitive foundation.');
  } catch (err: any) {
    assert('Knowledge Entries Isolation', false, err.message);
  }

  // 3. Agent Capabilities & Psychological Triggers (Phase 2 Conversation Engine)
  console.log('\n[TEST 3] Verifying Agent Capabilities & Psychological Triggers...');
  try {
    const agents = await db.select().from(agentCapabilities).where(eq(agentCapabilities.tenantId, 'ten_mastermind'));
    assert('Agent Capabilities in Cloud SQL', agents.length >= 2, `Found ${agents.length} agent specifications.`);
    const salesCloser = agents.find(a => a.agentName === 'sales_closer');
    const hasTriggers = salesCloser && salesCloser.psychologicalTriggers?.includes('pain_amplification');
    assert('Sales Closer Pain Amplification Trigger', Boolean(hasTriggers), `Triggers: ${JSON.stringify(salesCloser?.psychologicalTriggers)}`);
  } catch (err: any) {
    assert('Agent Capabilities', false, err.message);
  }

  // 4. Visual Productions Pipeline & Tenant Isolation
  console.log('\n[TEST 4] Verifying Visual Productions & Persistence Pipeline...');
  try {
    const testAsset = await db.insert(visualProductions).values({
      tenantId: 'ten_mastermind',
      type: 'image',
      prompt: 'Automated E2E Verification Asset - Luxury Cinematic Showcase',
      assetUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601',
      aspectRatio: '16:9',
      metaInfo: { verificationRun: true, timestamp: Date.now() },
      isCommunityShowcase: true
    }).returning();

    assert('Visual Production Cloud SQL Write', testAsset.length > 0 && !!testAsset[0].id, `Inserted production ID: ${testAsset[0]?.id}`);

    // Verify Read
    const retrieved = await db.select().from(visualProductions).where(eq(visualProductions.id, testAsset[0].id));
    assert('Visual Production Cloud SQL Read', retrieved.length === 1 && retrieved[0].prompt === testAsset[0].prompt, 'Data matched exactly.');
  } catch (err: any) {
    assert('Visual Production Cloud SQL Persistence', false, err.message);
  }

  // 5. REST API Health & Endpoints
  console.log('\n[TEST 5] Testing Local REST API (Port 3000)...');
  try {
    const res = await fetch('http://localhost:3000/api/health');
    const health = await res.json();
    assert('REST /api/health responding', res.status === 200 && health.status === 'ok', `Engine: ${health.engine}, Region: ${health.region}`);

    const resK = await fetch('http://localhost:3000/api/knowledge');
    const kData = await resK.json();
    assert('REST /api/knowledge responding', resK.status === 200 && Array.isArray(kData) && kData.length > 0, `Returned ${kData.length} entries`);

    const resC = await fetch('http://localhost:3000/api/agent-capabilities');
    const cData = await resC.json();
    assert('REST /api/agent-capabilities responding', resC.status === 200 && Array.isArray(cData) && cData.length > 0, `Returned ${cData.length} capabilities`);

    // Execution Engine
    const resInv = await fetch('http://localhost:3000/api/execution/inventory');
    const invData = await resInv.json();
    assert('REST /api/execution/inventory responding', resInv.status === 200 && Array.isArray(invData), `Returned ${invData.length} inventory items`);

    // Social Engine (Phase 5)
    console.log('\n[TEST 6] Testing Social Omnichannel Engine Endpoints...');
    const resSoc = await fetch('http://localhost:3000/api/social/accounts');
    const socData = await resSoc.json();
    assert('REST /api/social/accounts returning platforms', resSoc.status === 200 && Array.isArray(socData) && socData.length === 9, `Retrieved ${socData.length} managed social platforms`);

    const resPing = await fetch('http://localhost:3000/api/social/test-ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platformId: 'instagram' }),
    });
    const pingData = await resPing.json();
    assert('REST /api/social/test-ping live latency check', resPing.status === 200 && pingData.status === 'healthy', `Ping Latency: ${pingData.latencyMs}ms, Webhook Active: ${pingData.webhookActive}`);
  } catch (err: any) {
    assert('REST API Endpoints', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runForensicEndToEndTest().catch((err) => {
  console.error('Fatal Test Runner Failure:', err);
  process.exit(1);
});
