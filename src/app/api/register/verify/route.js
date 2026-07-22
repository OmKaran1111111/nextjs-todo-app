import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { insertVerifiedUser } from "@/lib/users";

export async function POST(req) {
  const { email, code } = await req.json();
  const pending = db.prepare("SELECT * FROM verification_codes WHERE email = ?").get(email);

  if (!pending || pending.code !== code) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }
  if (new Date(pending.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Code expired." }, { status: 400 });
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