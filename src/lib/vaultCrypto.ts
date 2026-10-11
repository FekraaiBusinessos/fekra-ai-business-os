import crypto from 'node:crypto';

const VAULT_MASTER_KEY = process.env.VAULT_ENCRYPTION_KEY || 'fekra_os_omnichannel_aes256_vault_key_32bytes!';
// Ensure 32 bytes key for AES-256
const KEY_BUFFER = crypto.createHash('sha256').update(VAULT_MASTER_KEY).digest();

export interface EncryptedVaultPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts sensitive API keys and secrets using AES-256-GCM
 */
export function encryptVaultSecret(plainText: string): EncryptedVaultPayload {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
  
  let encrypted = cipher.update(plainText, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypts AES-256-GCM ciphertext
 */
export function decryptVaultSecret(payload: EncryptedVaultPayload): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, Buffer.from(payload.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

/**
 * Produces a secure visual mask for secrets in UI
 */
export function maskVaultSecret(secret: string): string {
  if (!secret) return '••••••••';
  const clean = secret.trim();
  if (clean.length <= 8) return '••••' + clean.slice(-2);
  return `${clean.slice(0, 4)}••••••••${clean.slice(-4)}`;
}

/**
 * Encrypts a plain secret string into a single packed string: ciphertext:iv:authTag
 */
export function encryptPackedString(plainText: string): string {
  if (!plainText || !plainText.trim()) return '';
  const { ciphertext, iv, authTag } = encryptVaultSecret(plainText.trim());
  return `${ciphertext}:${iv}:${authTag}`;
}

/**
 * Decrypts a packed string formatted as ciphertext:iv:authTag
 */
export function decryptPackedString(packed: string): string {
  if (!packed) return '';
  const parts = packed.split(':');
  if (parts.length !== 3) return '';
  try {
    return decryptVaultSecret({
      ciphertext: parts[0],
      iv: parts[1],
      authTag: parts[2],
    });
  } catch (err) {
    console.error('Failed to decrypt vault secret:', err);
    return '';
  }
}

