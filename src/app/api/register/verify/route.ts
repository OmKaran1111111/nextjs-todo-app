import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db, { type VerificationCode } from "@/lib/db";
import { insertVerifiedUser } from "@/lib/users";

interface VerifyBody {
  email?: string;
  code?: string;
}

export async function POST(req: NextRequest) {
  const { email: rawEmail, code }: VerifyBody = await req.json();
  const email = rawEmail?.trim().toLowerCase();
  const pending = db
    .prepare("SELECT * FROM verification_codes WHERE email = ?")
    .get(email) as VerificationCode | undefined;

  if (!pending) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }
  if (new Date(pending.expiresAt) < new Date()) {
    db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
    return NextResponse.json({ error: "Code expired." }, { status: 400 });
  }
  const MAX_ATTEMPTS = 5;
  if (pending.attempts >= MAX_ATTEMPTS) {
    db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please register again." },
      { status: 429 },
    );
  }
  if (pending.code !== code) {
    db.prepare("UPDATE verification_codes SET attempts = attempts + 1 WHERE email = ?").run(email);
    return NextResponse.json(
      { error: `Invalid code. ${MAX_ATTEMPTS - pending.attempts - 1} attempts remaining.` },
      { status: 400 },
    );
  }

  if (!pending.passwordHash) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  insertVerifiedUser({
    id: crypto.randomUUID(),
    email: pending.email,
    name: pending.name,
    passwordHash: pending.passwordHash,
  });
  db.prepare("DELETE FROM verification_codes WHERE email = ?").run(email);

  return NextResponse.json({ message: "Account verified." }, { status: 201 });
}
