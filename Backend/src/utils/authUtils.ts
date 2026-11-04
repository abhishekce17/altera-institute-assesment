import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'todo_app_sde1_assessment_secure_secret_key_2025';
const DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Hash a plain password using native scrypt with a random 16-byte salt.
 * Formatted as: salt:derivedKeyHex
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plain password against stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;

    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Encode an object to base64url.
 */
function base64UrlEncode(obj: Record<string, any>): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decode base64url to JSON object.
 */
function base64UrlDecode<T = any>(str: string): T | null {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a standard RFC 7519 HMAC-SHA256 JWT using native node:crypto.
 */
export function createToken(payload: { userId: string; email: string }, expiresInSeconds = DEFAULT_EXPIRATION_SECONDS): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 JWT.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const expectedSigBuf = Buffer.from(expectedSignature);
    const providedSigBuf = Buffer.from(signatureB64);

    if (expectedSigBuf.length !== providedSigBuf.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(expectedSigBuf, providedSigBuf)) {
      return null;
    }

    const payload = base64UrlDecode<TokenPayload>(payloadB64);
    if (!payload) return null;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

