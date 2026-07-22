import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js|jsx|ts|tsx|ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|map)).*)',
  ],
};