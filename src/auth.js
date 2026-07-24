import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/users";
import { authConfig } from "@/auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

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

        // Count this call against the window up front, so a flood of
        // concurrent requests can't all sneak in under the cap at once.
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
});