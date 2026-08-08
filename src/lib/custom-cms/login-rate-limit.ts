import "server-only";

import fsSync from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const STORAGE_DIR = path.join(process.cwd(), "storage", "custom-cms");
const SQLITE_PATH = path.join(STORAGE_DIR, "articles.sqlite");

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_SECONDS = 10 * 60;
const DEFAULT_BLOCK_SECONDS = 15 * 60;

type LoginAttemptRow = {
  client_key: string;
  failure_count: number;
  first_failed_at: string;
  blocked_until: string | null;
  updated_at: string;
};

type LoginRateLimitState = {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingAttempts: number;
};

let database: DatabaseSync | null = null;

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRateLimitConfig() {
  return {
    maxAttempts: readPositiveInteger(process.env.CMS_LOGIN_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS),
    windowSeconds: readPositiveInteger(process.env.CMS_LOGIN_WINDOW_SECONDS, DEFAULT_WINDOW_SECONDS),
    blockSeconds: readPositiveInteger(process.env.CMS_LOGIN_BLOCK_SECONDS, DEFAULT_BLOCK_SECONDS),
  };
}

function ensureDatabase() {
  if (database) {
    return database;
  }

  fsSync.mkdirSync(STORAGE_DIR, { recursive: true });

  const db = new DatabaseSync(SQLITE_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cms_login_attempts (
      client_key TEXT PRIMARY KEY,
      failure_count INTEGER NOT NULL,
      first_failed_at TEXT NOT NULL,
      blocked_until TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cms_login_attempts_updated_at ON cms_login_attempts(updated_at);
    CREATE INDEX IF NOT EXISTS idx_cms_login_attempts_blocked_until ON cms_login_attempts(blocked_until);
  `);

  database = db;
  return db;
}

function getNow() {
  return new Date();
}

function cleanupExpiredAttempts(db: DatabaseSync) {
  const { blockSeconds, windowSeconds } = getRateLimitConfig();
  const retentionMs = Math.max(blockSeconds, windowSeconds) * 1000 * 2;
  const threshold = new Date(Date.now() - retentionMs).toISOString();

  db.prepare(
    `
      DELETE FROM cms_login_attempts
      WHERE COALESCE(blocked_until, updated_at) < ?
    `,
  ).run(threshold);
}

function getAttemptRow(clientKey: string) {
  const db = ensureDatabase();
  cleanupExpiredAttempts(db);

  return (
    (db.prepare(
      `
        SELECT client_key, failure_count, first_failed_at, blocked_until, updated_at
        FROM cms_login_attempts
        WHERE client_key = ?
      `,
    ).get(clientKey) as LoginAttemptRow | undefined) || null
  );
}

function upsertAttemptRow(row: LoginAttemptRow) {
  const db = ensureDatabase();

  db.prepare(
    `
      INSERT INTO cms_login_attempts (client_key, failure_count, first_failed_at, blocked_until, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(client_key) DO UPDATE SET
        failure_count = excluded.failure_count,
        first_failed_at = excluded.first_failed_at,
        blocked_until = excluded.blocked_until,
        updated_at = excluded.updated_at
    `,
  ).run(row.client_key, row.failure_count, row.first_failed_at, row.blocked_until, row.updated_at);
}

export function getClientKeyFromRequest(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function checkCmsLoginRateLimit(clientKey: string): LoginRateLimitState {
  const { maxAttempts, windowSeconds } = getRateLimitConfig();
  const row = getAttemptRow(clientKey);

  if (!row) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: maxAttempts,
    };
  }

  const now = getNow();
  const nowMs = now.getTime();
  const blockedUntilMs = row.blocked_until ? new Date(row.blocked_until).getTime() : 0;

  if (blockedUntilMs > nowMs) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((blockedUntilMs - nowMs) / 1000)),
      remainingAttempts: 0,
    };
  }

  const firstFailedMs = new Date(row.first_failed_at).getTime();

  if (!Number.isFinite(firstFailedMs) || nowMs - firstFailedMs > windowSeconds * 1000) {
    clearCmsLoginRateLimit(clientKey);

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: maxAttempts,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: Math.max(0, maxAttempts - row.failure_count),
  };
}

export function recordFailedCmsLogin(clientKey: string) {
  const { maxAttempts, windowSeconds, blockSeconds } = getRateLimitConfig();
  const now = getNow();
  const nowIso = now.toISOString();
  const existing = getAttemptRow(clientKey);

  if (!existing) {
    upsertAttemptRow({
      client_key: clientKey,
      failure_count: 1,
      first_failed_at: nowIso,
      blocked_until: null,
      updated_at: nowIso,
    });

    return checkCmsLoginRateLimit(clientKey);
  }

  const firstFailedMs = new Date(existing.first_failed_at).getTime();
  const isWindowExpired = !Number.isFinite(firstFailedMs) || now.getTime() - firstFailedMs > windowSeconds * 1000;
  const nextFailureCount = isWindowExpired ? 1 : existing.failure_count + 1;
  const blockedUntil =
    nextFailureCount >= maxAttempts ? new Date(now.getTime() + blockSeconds * 1000).toISOString() : null;

  upsertAttemptRow({
    client_key: clientKey,
    failure_count: nextFailureCount,
    first_failed_at: isWindowExpired ? nowIso : existing.first_failed_at,
    blocked_until: blockedUntil,
    updated_at: nowIso,
  });

  return checkCmsLoginRateLimit(clientKey);
}

export function clearCmsLoginRateLimit(clientKey: string) {
  const db = ensureDatabase();
  db.prepare("DELETE FROM cms_login_attempts WHERE client_key = ?").run(clientKey);
}

export function formatRetryAfterMessage(retryAfterSeconds: number) {
  const minutes = Math.floor(retryAfterSeconds / 60);
  const seconds = retryAfterSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} detik`;
  }

  if (seconds === 0) {
    return `${minutes} menit`;
  }

  return `${minutes} menit ${seconds} detik`;
}
