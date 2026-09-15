import Database from "better-sqlite3";
import { mkdirSync, chmodSync } from "node:fs";
import path from "node:path";

const connections = new Map<string, Database.Database>();
export function accountDb() {
  // Runtime storage is provisioned on the server, never bundled with source files.
  const filename = path.resolve(/* turbopackIgnore: true */ process.env.ACCOUNT_DB_PATH || ".account-data/accounts.sqlite");
  if (connections.has(filename)) return connections.get(filename)!;
  const publicPath = path.resolve("public");
  if (filename === publicPath || filename.startsWith(publicPath + path.sep)) throw new Error("Account storage must be private");
  mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new Database(filename);
  chmodSync(filename, 0o600);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, yandex_id TEXT NOT NULL UNIQUE,
      fullname TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      digest TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS oauth_intents (
      state_hash TEXT PRIMARY KEY, binding_hash TEXT NOT NULL, verifier TEXT NOT NULL,
      next_path TEXT NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS account_visits (
      record_id INTEGER PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      datetime TEXT NOT NULL, services TEXT NOT NULL, service_slugs TEXT NOT NULL, master TEXT NOT NULL,
      price_min REAL NOT NULL, price_max REAL NOT NULL
    );
    CREATE INDEX IF NOT EXISTS account_visits_user ON account_visits(user_id, datetime);
  `);
  connections.set(filename, db);
  return db;
}

export function closeAccountDatabases() {
  for (const db of connections.values()) db.close();
  connections.clear();
}
