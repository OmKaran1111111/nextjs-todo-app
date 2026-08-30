import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { findUserByEmail } from "@/lib/users";
import { sendVerificationCode } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string | null;
}

export async function POST(req: NextRequest) {
  const { email: rawEmail, password, name }: RegisterBody = await req.json();
  if (!rawEmail || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "Account already exists." }, { status: 400 });
  }

  const cooldown = checkRateLimit(`register:cooldown:${email}`, {
    maxRequests: 1,
    windowMs: 60 * 1000,
  });
  if (!cooldown.allowed) {
    return NextResponse.json(
      { error: "Please wait a bit before requesting another code." },
      { status: 429 },
    );
  }
  const dailyCap = checkRateLimit(`register:daily:${email}`, {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!dailyCap.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts today. Please try again tomorrow." },
      { status: 429 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO verification_codes (email, name, passwordHash, code, expiresAt, attempts)
    VALUES (?,?,?,?,?,0)
    ON CONFLICT(email) DO UPDATE SET name=excluded.name, passwordHash=excluded.passwordHash,
      code=excluded.code, expiresAt=excluded.expiresAt, attempts=0
  `).run(email, name || null, passwordHash, code, expiresAt);

  try {
    await sendVerificationCode(email, code);
  } catch (err) {
    console.error("Mail send failed:", err);
    return NextResponse.json({ error: "Could not send verification email." }, { status: 500 });
  }

  return NextResponse.json({ message: "Verification code sent." }, { status: 200 });
}
