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
  return { id: user.id, email: user.email, name: user.name };
}

export function insertVerifiedUser({ id, email, name, passwordHash }) {
  db.prepare(
    "INSERT INTO users (id, email, name, passwordHash, verified, createdAt) VALUES (?,?,?,?,1,?)"
  ).run(id, email, name, passwordHash, new Date().toISOString());
}