import db from "@/lib/db";
import bcrypt from "bcryptjs";

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  verified: number;
  role: string;
  isBanned: number;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  verified: number;
  role: string;
  isBanned: number;
  createdAt: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

export interface InsertVerifiedUserInput {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  name: string | null;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface ExistingIdRow {
  id: string;
}

interface BanStatusRow {
  isBanned: number;
}

export function findUserByEmail(email: string): UserRecord | null {
  return (db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email) as
    | UserRecord
    | undefined) || null;
}

export async function verifyPassword(email: string, password: string): Promise<AuthenticatedUser | null> {
  const user = findUserByEmail(email);
  if (!user || !user.verified) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  if (user.isBanned) throw new Error("Banned");
  return { id: user.id, email: user.email, name: user.name };
}

export function insertVerifiedUser({ id, email, name, passwordHash }: InsertVerifiedUserInput): void {
  db.prepare(
    "INSERT INTO users (id, email, name, passwordHash, verified, createdAt) VALUES (?,?,?,?,1,?)"
  ).run(id, email.trim().toLowerCase(), name, passwordHash, new Date().toISOString());
}

export function updateUserPassword(email: string, passwordHash: string): boolean {
  const result = db
    .prepare("UPDATE users SET passwordHash = ? WHERE lower(email) = lower(?)")
    .run(passwordHash, email);
  return result.changes > 0;
}

export function getAllUsers(): PublicUser[] {
  return db
    .prepare("SELECT id, email, name, verified, role, isBanned, createdAt FROM users ORDER BY createdAt DESC")
    .all() as PublicUser[];
}

export async function createUser({ email, name, password, role = "user" }: CreateUserInput): Promise<void> {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO users (id, email, name, passwordHash, role, verified, isBanned, createdAt) VALUES (?, ?, ?, ?, ?, 1, 0, ?)"
  ).run(id, email.trim().toLowerCase(), name, passwordHash, role, createdAt);
}

export function getUserById(id: string): PublicUser | null {
  return (
    (db
      .prepare("SELECT id, email, name, verified, role, isBanned, createdAt FROM users WHERE id = ?")
      .get(id) as PublicUser | undefined) || null
  );
}

export function updateUser(id: string, { name, email, role }: UpdateUserInput): void {
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id) as ExistingIdRow | undefined;
  if (!existing) throw new Error("User not found.");

  if (email) {
    const clash = db
      .prepare("SELECT id FROM users WHERE lower(email) = lower(?) AND id != ?")
      .get(email, id) as ExistingIdRow | undefined;
    if (clash) throw new Error("Another user already has that email.");
  }

  db.prepare(
    "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?"
  ).run(name ?? null, email ? email.trim().toLowerCase() : null, role ?? null, id);
}

export function deleteUser(id: string): void {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function toggleBanUser(id: string): void {
  const user = db.prepare("SELECT isBanned FROM users WHERE id = ?").get(id) as BanStatusRow | undefined;
  if (!user) return;
  const newBanStatus = user.isBanned ? 0 : 1;
  db.prepare("UPDATE users SET isBanned = ? WHERE id = ?").run(newBanStatus, id);
}