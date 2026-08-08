import { createHmac, timingSafeEqual } from "node:crypto";

export const CMS_SESSION_COOKIE_NAME = "cms_session";
const CMS_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type CmsAuthConfig = {
  username: string;
  password: string;
  secret: string;
};

type CmsSessionPayload = {
  username: string;
  expiresAt: number;
};

function readConfig(): CmsAuthConfig | null {
  const username = process.env.CMS_ADMIN_USERNAME?.trim();
  const password = process.env.CMS_ADMIN_PASSWORD?.trim();
  const secret = process.env.CMS_AUTH_SECRET?.trim();

  if (!username || !password || !secret) {
    return null;
  }

  return { username, password, secret };
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isCmsAuthConfigured() {
  return Boolean(readConfig());
}

export function getCmsSessionMaxAgeSeconds() {
  return CMS_SESSION_MAX_AGE_SECONDS;
}

export function validateCmsCredentials(username: string, password: string) {
  const config = readConfig();

  if (!config) {
    return false;
  }

  return username === config.username && password === config.password;
}

export function createCmsSessionToken(username: string) {
  const config = readConfig();

  if (!config) {
    throw new Error("Autentikasi CMS belum dikonfigurasi.");
  }

  const payload = JSON.stringify({
    username,
    expiresAt: Date.now() + CMS_SESSION_MAX_AGE_SECONDS * 1000,
  } satisfies CmsSessionPayload);

  const encodedPayload = toBase64Url(payload);
  const signature = signPayload(encodedPayload, config.secret);

  return `${encodedPayload}.${signature}`;
}

export function readCmsSessionToken(token?: string | null): CmsSessionPayload | null {
  const config = readConfig();

  if (!config || !token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload, config.secret);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (!timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as CmsSessionPayload;

    if (!payload.username || payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
