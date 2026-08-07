import db from "@/lib/db";
import bcrypt from "bcryptjs";

export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email) || null;
}

export async function verifyPassword(email, password) {
  const user = findUserByEmail(email);
  if (!user || !user.verified) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  if (user.isBanned) throw new Error("Banned");
  return { id: user.id, email: user.email, name: user.name };
}

export function insertVerifiedUser({ id, email, name, passwordHash }) {
  db.prepare(
    "INSERT INTO users (id, email, name, passwordHash, verified, createdAt) VALUES (?,?,?,?,1,?)"
  ).run(id, email.trim().toLowerCase(), name, passwordHash, new Date().toISOString());
}

export function updateUserPassword(email, passwordHash) {
  const result = db
    .prepare("UPDATE users SET passwordHash = ? WHERE lower(email) = lower(?)")
    .run(passwordHash, email);
  return result.changes > 0;
}
export function getAllUsers() {
  return db
    .prepare("SELECT id, email, name, verified, role, isBanned, createdAt FROM users ORDER BY createdAt DESC")
    .all();
}
export async function createUser({ email, name, password, role = "user" }) {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO users (id, email, name, passwordHash, role, verified, isBanned, createdAt) VALUES (?, ?, ?, ?, ?, 1, 0, ?)"
  ).run(id, email.trim().toLowerCase(), name, passwordHash, role, createdAt);
}
export function getUserById(id) {
  return (
    db
      .prepare("SELECT id, email, name, verified, role, isBanned, createdAt FROM users WHERE id = ?")
      .get(id) || null
  );
}

export function updateUser(id, { name, email, role }) {
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!existing) throw new Error("User not found.");

  if (email) {
    const clash = db
      .prepare("SELECT id FROM users WHERE lower(email) = lower(?) AND id != ?")
      .get(email, id);
    if (clash) throw new Error("Another user already has that email.");
  }

  db.prepare(
    "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?"
  ).run(name ?? null, email ? email.trim().toLowerCase() : null, role ?? null, id);
}

export function deleteUser(id) {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
export function toggleBanUser(id) {
  const user = db.prepare("SELECT isBanned FROM users WHERE id = ?").get(id);
  if (!user) return;
  const newBanStatus = user.isBanned ? 0 : 1;
  db.prepare("UPDATE users SET isBanned = ? WHERE id = ?").run(newBanStatus, id);
}