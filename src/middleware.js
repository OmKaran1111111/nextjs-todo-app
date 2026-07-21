import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js|jsx|ts|tsx|ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|map)).*)',
  ],
};