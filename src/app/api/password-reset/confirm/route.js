import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { updateUserPassword } from "@/lib/users";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  const { email: rawEmail, code, newPassword } = await req.json();
  if (!rawEmail || !code || !newPassword) {
    return NextResponse.json(
      { error: "Email, code, and new password are required." },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const email = rawEmail.trim().toLowerCase();
  const pending = db.prepare("SELECT * FROM password_resets WHERE email = ?").get(email);

  if (!pending) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }
  if (new Date(pending.expiresAt) < new Date()) {
    db.prepare("DELETE FROM password_resets WHERE email = ?").run(email);
    return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    db.prepare("DELETE FROM password_resets WHERE email = ?").run(email);
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 429 },
    );
  }
  if (pending.code !== code) {
    db.prepare("UPDATE password_resets SET attempts = attempts + 1 WHERE email = ?").run(email);
    return NextResponse.json(
      { error: `Invalid code. ${MAX_ATTEMPTS - pending.attempts - 1} attempts remaining.` },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  updateUserPassword(email, passwordHash);
  db.prepare("DELETE FROM password_resets WHERE email = ?").run(email);

  return NextResponse.json({ message: "Password updated. You can now log in." }, { status: 200 });
}
