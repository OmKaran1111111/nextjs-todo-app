import db from "./db.js";
import bcrypt from "bcryptjs";

async function seed() {

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (email, password, is_verified, created_at)
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
  `);

  stmt.run("testuser@example.com", hashedPassword);

  console.log("✅ Seed complete!");
  console.log("Test Login Email:    testuser@example.com");
  console.log("Test Login Password: Password123!");
}

seed().catch(console.error);