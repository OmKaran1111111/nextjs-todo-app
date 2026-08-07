import Database from "better-sqlite3";
import path from "path";

let _db = null;

function initDb() {
  const db = new Database(path.join(process.cwd(), "src", "data", "app.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      deviceName TEXT,
      browserName TEXT,
      browserVersion TEXT,
      os TEXT,
      appVersion TEXT,
      userAgent TEXT,
      createdAt TEXT NOT NULL,
      lastActiveAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      revoked INTEGER DEFAULT 0,
      revokedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_devices_userId ON devices(userId);

    CREATE TABLE IF NOT EXISTS pairing_codes (
      code TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roles (
      name TEXT PRIMARY KEY,
      description TEXT,
      isSystem INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission),
      FOREIGN KEY (role) REFERENCES roles(name) ON DELETE CASCADE
    );
  `);

  db.pragma("foreign_keys = OFF");

  const usersTableSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (usersTableSql && !usersTableSql.sql.includes("COLLATE NOCASE")) {
    db.transaction(() => {
      const oldExists = db
        .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users_old'")
        .get();
      if (oldExists) {
        db.exec("DROP TABLE users_old");
      }

      db.exec(`
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
      `);
    })();
  }

  const tasksTableSql = db
    .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'")
    .get();

  if (tasksTableSql && tasksTableSql.sql.includes("users_old")) {
    db.transaction(() => {
      db.exec(`
        ALTER TABLE tasks RENAME TO tasks_old;

        CREATE TABLE tasks (
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

        INSERT INTO tasks SELECT * FROM tasks_old;
        DROP TABLE tasks_old;
      `);
    })();
  }

  db.pragma("foreign_keys = ON");

  const hasAttemptsColumn = db
    .prepare("PRAGMA table_info(verification_codes)")
    .all()
    .some((col) => col.name === "attempts");

  if (!hasAttemptsColumn) {
    db.exec("ALTER TABLE verification_codes ADD COLUMN attempts INTEGER DEFAULT 0");
  }

  const hasRoleColumn = db
    .prepare("PRAGMA table_info(users)")
    .all()
    .some((col) => col.name === "role");

  if (!hasRoleColumn) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
  }

  const hasBannedColumn = db
    .prepare("PRAGMA table_info(users)")
    .all()
    .some((col) => col.name === "isBanned");

  if (!hasBannedColumn) {
    db.exec("ALTER TABLE users ADD COLUMN isBanned INTEGER DEFAULT 0");
  }

  seedDefaultRoles(db);

  return db;
}

const ALL_PERMISSION_KEYS = [
  "users:view",
  "users:manage",
  "roles:manage",
  "tasks:view_own",
  "tasks:manage_own",
  "tasks:view_all",
  "devices:view_own",
  "devices:manage_own",
  "devices:manage_all",
];

const DEFAULT_USER_PERMISSIONS = [
  "tasks:view_own",
  "tasks:manage_own",
  "devices:view_own",
  "devices:manage_own",
];

function seedDefaultRoles(db) {
  const roleCount = db.prepare("SELECT COUNT(*) AS count FROM roles").get().count;
  if (roleCount > 0) {

    const distinctRoles = db
      .prepare("SELECT DISTINCT role FROM users WHERE role IS NOT NULL AND role != ''")
      .all()
      .map((r) => r.role);

    const insertRole = db.prepare(
      "INSERT OR IGNORE INTO roles (name, description, isSystem, createdAt) VALUES (?, ?, 0, ?)"
    );
    const insertPerm = db.prepare(
      "INSERT OR IGNORE INTO role_permissions (role, permission) VALUES (?, ?)"
    );

    db.transaction(() => {
      for (const roleName of distinctRoles) {
        insertRole.run(roleName, null, new Date().toISOString());
        const hasPerms = db
          .prepare("SELECT COUNT(*) AS count FROM role_permissions WHERE role = ?")
          .get(roleName).count;
        if (hasPerms === 0) {
          for (const perm of DEFAULT_USER_PERMISSIONS) insertPerm.run(roleName, perm);
        }
      }
    })();
    return;
  }

  const now = new Date().toISOString();
  const insertRole = db.prepare(
    "INSERT INTO roles (name, description, isSystem, createdAt) VALUES (?, ?, ?, ?)"
  );
  const insertPerm = db.prepare(
    "INSERT INTO role_permissions (role, permission) VALUES (?, ?)"
  );

  db.transaction(() => {
    insertRole.run("admin", "Full access to every module, including user and role management.", 1, now);
    for (const perm of ALL_PERMISSION_KEYS) insertPerm.run("admin", perm);

    insertRole.run("user", "Standard member with access to their own tasks and devices.", 1, now);
    for (const perm of DEFAULT_USER_PERMISSIONS) insertPerm.run("user", perm);
  })();
}

function getDb() {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}

const dbProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const real = getDb();
      const value = real[prop];
      return typeof value === "function" ? value.bind(real) : value;
    },
  }
);

export default dbProxy;