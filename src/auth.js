import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/users";
import { authConfig } from "@/auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import db from "@/lib/db";
import crypto from "crypto";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const limitKey = `login:${email}`;

        const { allowed } = checkRateLimit(limitKey, {
          maxRequests: LOGIN_MAX_ATTEMPTS,
          windowMs: LOGIN_WINDOW_MS,
        });
        if (!allowed) {
          throw new Error("Too many failed login attempts. Please try again later.");
        }

        const user = await verifyPassword(email, credentials.password);
        if (user) {
          resetRateLimit(limitKey);
        }
        return user;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (token?.email) {
        const email = token.email.trim().toLowerCase();

        let dbUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

        if (!dbUser) {
          const userId = user?.id || token.sub || crypto.randomUUID();
          const userName = user?.name || token.name || "";
          const createdAt = new Date().toISOString();

          db.prepare(
            `INSERT INTO users (id, email, name, passwordHash, verified, createdAt)
             VALUES (?, ?, ?, 'OAUTH_ACCOUNT', 1, ?)`
          ).run(userId, email, userName, createdAt);

          dbUser = { id: userId };
        }

        token.id = dbUser.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});