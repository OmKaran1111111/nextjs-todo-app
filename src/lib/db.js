import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "src", "data", "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT,
    passwordHash TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    email TEXT PRIMARY KEY,
    name TEXT,
    passwordHash TEXT,
    code TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    attempts INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    attempts INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    windowStart TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    priority INTEGER DEFAULT 4,
    completed INTEGER DEFAULT 0,
    completedAt TEXT,
    deadline TEXT,
    subtasks TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId);

`);

// Migration: rebuild users table with case-insensitive email uniqueness
// if upgrading from an older schema (SQLite can't ALTER a column's collation).
const usersTableSql = db
  .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
  .get();
if (usersTableSql && !usersTableSql.sql.includes("COLLATE NOCASE")) {
  db.exec(`
    BEGIN TRANSACTION;
    ALTER TABLE users RENAME TO users_old;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name TEXT,
      passwordHash TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    INSERT INTO users (id, email, name, passwordHash, verified, createdAt)
      SELECT id, email, name, passwordHash, verified, createdAt FROM users_old;
    DROP TABLE users_old;
    COMMIT;
  `);
}

const hasAttemptsColumn = db
  .prepare("PRAGMA table_info(verification_codes)")
  .all()
  .some((col) => col.name === "attempts");
if (!hasAttemptsColumn) {
  db.exec("ALTER TABLE verification_codes ADD COLUMN attempts INTEGER DEFAULT 0");
}

export default db;