import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isPublicPage =
        pathname === "/login" ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password");

      if (isPublicPage) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      const permissions = auth?.user?.permissions || [];
      const isAdmin = auth?.user?.role === "admin";

      if (pathname.startsWith("/Manage_Users")) {
        return (
          isAdmin ||
          permissions.includes("users:manage") ||
          permissions.includes("users:view")
        );
      }

      if (pathname.startsWith("/Roles")) {
        return isAdmin || permissions.includes("roles:manage");
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions as string[]) || [];
      }
      return session;
    },
  },
};