import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "src", "data", "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
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
    expiresAt TEXT NOT NULL
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

export default db;