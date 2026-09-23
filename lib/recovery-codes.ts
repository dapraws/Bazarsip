import bcrypt from "bcrypt";
import { randomInt } from "crypto";

// Same alphabet as order numbers: no 0/O, 1/I/L or U, because these get
// written on paper and read back months later under pressure.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const GROUPS = 2;
const GROUP_LENGTH = 5;
const COUNT = 8;

/** A batch of one-time codes, e.g. "K4M2X-9PTRW". */
export function generateRecoveryCodes(): string[] {
  return Array.from({ length: COUNT }, () =>
    Array.from({ length: GROUPS }, () =>
      Array.from(
        { length: GROUP_LENGTH },
        () => ALPHABET[randomInt(ALPHABET.length)],
      ).join(""),
    ).join("-"),
  );
}

/**
 * Hashed for storage. These bypass the second factor entirely, so they are
 * treated exactly like a password: the plaintext is shown once at setup and
 * never recoverable afterwards.
 */
export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

/**
 * Finds and consumes a matching code.
 *
 * Returns the remaining hashes so the caller can store them back — a
 * recovery code that still worked after being used would not be a recovery
 * code, it would be a second password.
 */
export async function consumeRecoveryCode(
  submitted: string,
  hashes: string[] | null,
): Promise<{ matched: boolean; remaining: string[] }> {
  const normalized = submitted.trim().toUpperCase();
  const stored = hashes ?? [];

  for (let i = 0; i < stored.length; i++) {
    if (await bcrypt.compare(normalized, stored[i])) {
      return {
        matched: true,
        remaining: stored.filter((_, index) => index !== i),
      };
    }
  }

  return { matched: false, remaining: stored };
}
