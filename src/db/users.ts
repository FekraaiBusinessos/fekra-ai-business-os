import { db } from './index.ts';
import { users, tenants } from './schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

export async function getOrCreateTenant(tenantId: string, businessName: string = 'Fekra Business Unit') {
  try {
    const existing = await db.select().from(tenants).where(eq(tenants.tenantId, tenantId));
    if (existing.length > 0) return existing[0];

    const inserted = await db.insert(tenants).values({
      tenantId,
      businessName,
      brandLockScore: 100,
      activePhase: 1,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to get or create tenant:', error);
    throw new Error('Tenant operation failed', { cause: error });
  }
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string, tenantId?: string) {
  try {
    // 1. Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    // 2. New user: generate a brand new unique isolated tenant ID with empty records
    const cleanUid = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'usr';
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const resolvedTenantId = tenantId || `ten_${cleanUid}_${randomSuffix}`;

    await getOrCreateTenant(resolvedTenantId, displayName ? `${displayName}'s Enterprise` : `${email.split('@')[0]}'s Workspace`);

    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        tenantId: resolvedTenantId,
        role: 'owner',
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to create user and isolated tenant:', error);
    throw new Error('User operation failed', { cause: error });
  }
}
