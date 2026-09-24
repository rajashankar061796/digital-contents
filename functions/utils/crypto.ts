import { DownloadTokenPayload } from '../types';

// Convert ArrayBuffer to Base64URL string
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert Base64URL string to Uint8Array bytes
function base64UrlToBytes(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Signs a short-lived download authorization token using HMAC-SHA256.
 * 
 * @param orderId Cashfree order ID
 * @param secret Secret key for HMAC signing
 * @param expiresInMinutes Duration before token expires (default 15 minutes)
 * @returns Serialized token format: `<payloadBase64Url>.<signatureBase64Url>`
 */
export async function signDownloadToken(
  orderId: string,
  secret: string,
  expiresInMinutes: number = 15
): Promise<string> {
  const encoder = new TextEncoder();
  const now = Date.now();
  const exp = now + expiresInMinutes * 60 * 1000;

  const payload: DownloadTokenPayload = {
    orderId,
    iat: now,
    exp,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = bufferToBase64Url(encoder.encode(payloadJson).buffer);

  // Import HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Generate HMAC signature
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadEncoded)
  );

  const signatureEncoded = bufferToBase64Url(signatureBuffer);

  return `${payloadEncoded}.${signatureEncoded}`;
}

/**
 * Verifies an HMAC-SHA256 download authorization token and checks expiration.
 * 
 * @param token Serialized token string
 * @param secret Secret key used to sign the token
 * @returns Payload if valid and non-expired; null otherwise.
 */
export async function verifyDownloadToken(
  token: string,
  secret: string
): Promise<DownloadTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadEncoded, signatureEncoded] = parts;
    const encoder = new TextEncoder();

    // Import HMAC key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert signature back to bytes directly (no corrupting string transforms)
    const expectedSigBytes = base64UrlToBytes(signatureEncoded);

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      expectedSigBytes as BufferSource,
      encoder.encode(payloadEncoded)
    );

    if (!isValid) {
      console.warn('HMAC token signature mismatch');
      return null;
    }

    // Decode payload
    const payloadBytes = base64UrlToBytes(payloadEncoded);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    const payload: DownloadTokenPayload = JSON.parse(payloadJson);

    // Verify expiration
    if (!payload.exp || Date.now() > payload.exp) {
      console.warn('HMAC token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying download token:', error);
    return null;
  }
}

/**
 * Verifies a Cashfree Webhook Signature.
 * 
 * Cashfree computes the signature using HMAC-SHA256 on `timestamp + rawBody` with the client secret.
 * 
 * @param rawBody The raw text body received from Cashfree
 * @param timestamp The `x-webhook-timestamp` header value
 * @param signature The `x-webhook-signature` header value
 * @param secret The `CASHFREE_SECRET_KEY`
 */
export async function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const dataToSign = `${timestamp}${rawBody}`;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const computedBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataToSign)
    );

    // Cashfree uses standard base64 for webhook signatures
    const bytes = new Uint8Array(computedBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const computedBase64 = btoa(binary);

    return computedBase64 === signature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}
