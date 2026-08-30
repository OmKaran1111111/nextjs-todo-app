import NextAuth, { type User } from "next-auth";
import { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { verifyPassword } from "@/lib/users";
import { getPermissionsForRole } from "@/lib/permissions";
import { authConfig } from "@/auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import {
  createDeviceSession,
  getDeviceById,
  consumePairingCode,
} from "@/lib/devices";
import db from "@/lib/db";
import crypto from "crypto";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const PAIRING_MAX_ATTEMPTS = 5;
const PAIRING_WINDOW_MS = 10 * 60 * 1000;

interface DbUserRow {
  id: string;
  role: string;
}

interface BannedRow {
  isBanned: 0 | 1;
}

class BannedError extends CredentialsSignin {
  code = "banned";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials): Promise<User | null> => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;
        const limitKey = `login:${email}`;

        const { allowed } = checkRateLimit(limitKey, {
          maxRequests: LOGIN_MAX_ATTEMPTS,
          windowMs: LOGIN_WINDOW_MS,
        });
        if (!allowed) {
          throw new Error(
            "Too many failed login attempts. Please try again later.",
          );
        }

        let user;
        try {
          user = await verifyPassword(email, password);
        } catch (err) {
          if ((err as Error).message === "Banned") throw new BannedError();
          throw err;
        }
        if (user) {
          resetRateLimit(limitKey);
        }
        return user;
      },
    }),
    Credentials({
      id: "pairing-code",
      name: "Pairing Code",
      credentials: { code: {}, deviceName: {}, appVersion: {} },
      authorize: async (credentials, request): Promise<User | null> => {
        const code = credentials?.code?.toString().trim();
        if (!code) return null;

        const ip = request?.headers?.get("x-forwarded-for") || "unknown";
        const { allowed } = checkRateLimit(`pairing:${ip}`, {
          maxRequests: PAIRING_MAX_ATTEMPTS,
          windowMs: PAIRING_WINDOW_MS,
        });
        if (!allowed) {
          throw new Error("Too many attempts. Please try again later.");
        }

        const record = consumePairingCode(code);
        if (!record) return null;

        const user = db
          .prepare("SELECT id, email, name FROM users WHERE id = ?")
          .get(record.userId) as
          | { id: string; email: string; name: string }
          | undefined;
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          deviceName: credentials?.deviceName?.toString() || undefined,
          appVersion: credentials?.appVersion?.toString() || undefined,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const email = user.email?.trim().toLowerCase();
        if (email) {
          const dbUser = db
            .prepare("SELECT isBanned FROM users WHERE email = ?")
            .get(email) as BannedRow | undefined;
          if (dbUser?.isBanned) {
            return false;
          }
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const headerList = await headers();
        const userAgent = headerList.get("user-agent") || "";
        token.deviceId = createDeviceSession({
          userId: user.id,
          userAgent,
          deviceName: user.deviceName,
          appVersion: user.appVersion,
        });
      }

      if (token?.deviceId) {
        const device = getDeviceById(token.deviceId);
        if (!device || device.revoked) {
          return null;
        }
      }

      if (token?.email) {
        const email = token.email.trim().toLowerCase();

        let dbUser = db
          .prepare("SELECT id, role FROM users WHERE email = ?")
          .get(email) as DbUserRow | undefined;

        if (!dbUser) {
          const userId = user?.id || token.sub || crypto.randomUUID();
          const userName = user?.name || token.name || "";
          const createdAt = new Date().toISOString();

          db.prepare(
            `INSERT INTO users (id, email, name, passwordHash, verified, createdAt, role)
             VALUES (?, ?, ?, 'OAUTH_ACCOUNT', 1, ?, 'user')`,
          ).run(userId, email, userName, createdAt);

          dbUser = { id: userId, role: "user" };
        }

        token.id = dbUser.id;
        token.role = dbUser.role || "user";
        token.permissions = getPermissionsForRole(token.role);
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.user.permissions = token.permissions || [];
        session.user.deviceId = token.deviceId;
      }
      return session;
    },
  },
});