import db from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface ExistingUserRow {
  id: string;
}

async function seed(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminName = process.env.ADMIN_NAME || "Admin";

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(adminEmail) as ExistingUserRow | undefined;

  if (existing) {
    console.log(`Admin user (${adminEmail}) already exists — skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO users (id, email, name, passwordHash, verified, role, createdAt)
    VALUES (?, ?, ?, ?, 1, 'admin', CURRENT_TIMESTAMP)
  `).run(id, adminEmail, adminName, passwordHash);

  console.log("✅ Admin user seeded.");
  console.log(`Login Email:    ${adminEmail}`);
  console.log(`Login Password: ${adminPassword}`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});