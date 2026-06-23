import crypto from "node:crypto";

const iterations = 210000;
const keyLength = 32;
const digest = "sha256";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

  return `pbkdf2$${iterations}$${salt}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, rawIterations, salt, hash] = storedHash.split("$");

  if (scheme !== "pbkdf2" || !rawIterations || !salt || !hash) {
    return false;
  }

  const parsedIterations = Number(rawIterations);

  if (!Number.isInteger(parsedIterations) || parsedIterations <= 0) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = crypto.pbkdf2Sync(password, salt, parsedIterations, expected.length, digest);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
