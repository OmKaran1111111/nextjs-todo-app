const path = require("path");
const Database = require("better-sqlite3");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

const db = new Database(path.join(process.cwd(), "src", "data", "app.db"));
const result = db
  .prepare("UPDATE users SET role = 'admin' WHERE lower(email) = lower(?)")
  .run(email);

if (result.changes === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.log(`${email} is now an admin.`);