import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * TOTP (RFC 6238): the six-digit codes an authenticator app shows.
 *
 * Nothing is ever sent to the phone. The server and the app hold the same
 * secret, both divide the clock into 30-second steps, and both compute
 * HMAC-SHA1(secret, step) over it. Matching codes prove the app holds the
 * same secret; that is the whole mechanism.
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Authenticator apps exchange secrets in base32, not hex or base64. */
export function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function fromBase32(secret: string): Buffer {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of secret.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base32 character: ${char}`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/** A fresh 20-byte secret, the size RFC 4226 recommends, in base32. */
export function generateSecret(): string {
  return toBase32(randomBytes(20));
}

/**
 * The code for one time step.
 *
 * "Dynamic truncation" is the odd-looking part: the low nibble of the last
 * HMAC byte picks where in the digest to read four bytes from. Reading from a
 * varying offset means no fixed slice of the digest is ever exposed.
 */
export function generateCode(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));

  const digest = createHmac("sha1", fromBase32(secret))
    .update(counter)
    .digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function currentStep(now: number = Date.now()): number {
  return Math.floor(now / 1000 / STEP_SECONDS);
}

/**
 * Checks a submitted code, allowing one step either side.
 *
 * The window exists because phone and server clocks drift, and because
 * someone reading a code aloud may submit it just after it rolls over. One
 * step each way is the usual compromise: a wider window is easier to guess
 * against, a narrower one rejects honest users.
 *
 * Returns the matched step so the caller can refuse to accept it twice: a
 * code shoulder-surfed or phished is otherwise replayable for its full
 * lifetime.
 */
export function verifyCode(
  secret: string,
  code: string,
  now: number = Date.now(),
): { valid: boolean; step: number } {
  const submitted = code.replace(/\D/g, "");
  if (submitted.length !== DIGITS) return { valid: false, step: 0 };

  const step = currentStep(now);

  for (const candidate of [step, step - 1, step + 1]) {
    const expected = generateCode(secret, candidate);
    // Constant-time: a length-independent compare would leak how much of the
    // code was right through timing.
    if (
      timingSafeEqual(Buffer.from(expected), Buffer.from(submitted))
    ) {
      return { valid: true, step: candidate };
    }
  }

  return { valid: false, step: 0 };
}

/** The otpauth:// URI an authenticator app reads out of a QR code. */
export function otpauthUri(secret: string, account: string, issuer: string) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
