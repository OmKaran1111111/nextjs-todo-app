import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { findUserByEmail } from "@/lib/users";
import { sendPasswordResetCode } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset code.";

interface RequestBody {
  email?: string;
}

export async function POST(req: NextRequest) {
  const { email: rawEmail }: RequestBody = await req.json();
  if (!rawEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();

  const cooldown = checkRateLimit(`password-reset:cooldown:${email}`, {
    maxRequests: 1,
    windowMs: 60 * 1000,
  });
  if (!cooldown.allowed) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }
  const dailyCap = checkRateLimit(`password-reset:daily:${email}`, {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!dailyCap.allowed) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const user = findUserByEmail(email);
  if (!user || !user.verified || !user.passwordHash) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO password_resets (email, code, expiresAt, attempts)
    VALUES (?,?,?,0)
    ON CONFLICT(email) DO UPDATE SET code=excluded.code, expiresAt=excluded.expiresAt, attempts=0
  `).run(email, code, expiresAt);

  try {
    await sendPasswordResetCode(email, code);
  } catch (err) {
    console.error("Password reset mail send failed:", err);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
