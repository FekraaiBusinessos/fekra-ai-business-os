import crypto from 'node:crypto';

// Secret key for HMAC token signing
const SESSION_SECRET = process.env.SESSION_SECRET || 'fekra_os_omnichannel_secret_vault_2026_production_key';

export interface SessionTokenPayload {
  uid: string;
  email: string;
  displayName?: string;
  tenantId: string;
  role?: string;
  exp: number; // Unix timestamp in ms
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function signSessionToken(payload: Omit<SessionTokenPayload, 'exp'> & { exp?: number }): string {
  const fullPayload: SessionTokenPayload = {
    ...payload,
    exp: payload.exp || Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days validity
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const raw = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload: SessionTokenPayload = JSON.parse(raw);

    // Verify expiry
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
