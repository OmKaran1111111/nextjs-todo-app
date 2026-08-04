import db from "@/lib/db";
import crypto from "crypto";

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;
const MIN_SUPPORTED_APP_VERSION = "2.0";

function parseUserAgent(ua = "") {
  if (!ua) return { browserName: "Unknown", browserVersion: "", os: "Unknown" };

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browserName = "Unknown";
  let browserVersion = "";
  let match;
  if ((match = ua.match(/Edg\/([\d.]+)/))) {
    browserName = "Edge";
    browserVersion = match[1];
  } else if ((match = ua.match(/OPR\/([\d.]+)/))) {
    browserName = "Opera";
    browserVersion = match[1];
  } else if ((match = ua.match(/Firefox\/([\d.]+)/))) {
    browserName = "Firefox";
    browserVersion = match[1];
  } else if (/Edg\//.test(ua) === false && (match = ua.match(/Chrome\/([\d.]+)/))) {
    browserName = "Chrome";
    browserVersion = match[1];
  } else if (/Safari\//.test(ua) && (match = ua.match(/Version\/([\d.]+)/))) {
    browserName = "Safari";
    browserVersion = match[1];
  }

  const parts = browserVersion.split(".");
  const shortVersion = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : browserVersion;

  return { browserName, browserVersion: shortVersion, os };
}

function resolveDeviceName({ deviceName, browserName, os }) {
  if (deviceName && deviceName.trim()) return deviceName.trim();
  if (browserName === "Unknown" && os === "Unknown") return "Unknown device";
  return `${browserName} on ${os}`;
}

function isOutdatedAppVersion(appVersion) {
  if (!appVersion) return false;
  const toParts = (v) =>
    v
      .replace(/^v/i, "")
      .split(".")
      .map((n) => parseInt(n, 10) || 0);
  const [major, minor] = toParts(appVersion);
  const [minMajor, minMinor] = toParts(MIN_SUPPORTED_APP_VERSION);
  if (major !== minMajor) return major < minMajor;
  return minor < minMinor;
}

export function createDeviceSession({ userId, userAgent, deviceName, appVersion }) {
  const { browserName, browserVersion, os } = parseUserAgent(userAgent);
  const id = crypto.randomUUID();
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS).toISOString();

  db.prepare(
    `INSERT INTO devices
      (id, userId, deviceName, browserName, browserVersion, os, appVersion, userAgent, createdAt, lastActiveAt, expiresAt, revoked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(
    id,
    userId,
    resolveDeviceName({ deviceName, browserName, os }),
    browserName,
    browserVersion,
    os,
    appVersion || null,
    userAgent || "",
    nowIso,
    nowIso,
    expiresAt,
  );

  return id;
}

export function getDeviceById(id) {
  return db.prepare("SELECT * FROM devices WHERE id = ?").get(id) || null;
}

export function touchDeviceLastActive(id) {
  if (!id) return;
  db.prepare("UPDATE devices SET lastActiveAt = ? WHERE id = ?").run(new Date().toISOString(), id);
}

export function getDevicesForUser(userId) {
  return db.prepare("SELECT * FROM devices WHERE userId = ? ORDER BY lastActiveAt DESC").all(userId);
}

export function getAllDevicesWithOwners() {
  return db
    .prepare(
      `SELECT devices.*, users.email AS ownerEmail, users.name AS ownerName
       FROM devices
       JOIN users ON users.id = devices.userId
       ORDER BY devices.lastActiveAt DESC`,
    )
    .all();
}

export function revokeDevice(id, requestingUserId, isAdmin) {
  const device = getDeviceById(id);
  if (!device) return false;
  if (!isAdmin && device.userId !== requestingUserId) return false;
  db.prepare("UPDATE devices SET revoked = 1, revokedAt = ? WHERE id = ?").run(
    new Date().toISOString(),
    id,
  );
  return true;
}

export function getDeviceStatus(device) {
  if (device.revoked) return { label: "Revoked", tone: "danger" };
  if (new Date(device.expiresAt) < new Date()) return { label: "Expired", tone: "warning" };
  if (isOutdatedAppVersion(device.appVersion)) return { label: "Outdated app version", tone: "warning" };
  return { label: "Active", tone: "success" };
}

export function createPairingCode(userId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS).toISOString();

  db.prepare(
    `INSERT INTO pairing_codes (code, userId, expiresAt, used, createdAt)
     VALUES (?, ?, ?, 0, ?)`,
  ).run(code, userId, expiresAt, new Date().toISOString());

  return { code, expiresAt };
}

export function consumePairingCode(code) {
  return db.transaction(() => {
    const record = db.prepare("SELECT * FROM pairing_codes WHERE code = ?").get(code);
    if (!record) return null;
    if (record.used) return null;
    if (new Date(record.expiresAt) < new Date()) return null;
    db.prepare("UPDATE pairing_codes SET used = 1 WHERE code = ?").run(code);
    return record;
  })();
}
