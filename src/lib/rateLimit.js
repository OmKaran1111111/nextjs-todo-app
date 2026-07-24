import db from "@/lib/db";

export function checkRateLimit(key, { maxRequests, windowMs }) {
  const now = Date.now();
  const row = db.prepare("SELECT * FROM rate_limits WHERE key = ?").get(key);

  if (!row) {
    db.prepare(
      "INSERT INTO rate_limits (key, count, windowStart) VALUES (?, 1, ?)",
    ).run(key, new Date(now).toISOString());
    return { allowed: true, retryAfterMs: 0 };
  }

  const windowStart = new Date(row.windowStart).getTime();
  const windowElapsed = now - windowStart;

  if (windowElapsed > windowMs) {
    db.prepare(
      "UPDATE rate_limits SET count = 1, windowStart = ? WHERE key = ?",
    ).run(new Date(now).toISOString(), key);
    return { allowed: true, retryAfterMs: 0 };
  }

  if (row.count >= maxRequests) {
    return { allowed: false, retryAfterMs: windowMs - windowElapsed };
  }

  db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key) {
  db.prepare("DELETE FROM rate_limits WHERE key = ?").run(key);
}
