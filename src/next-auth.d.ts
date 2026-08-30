import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    permissions?: string[];
    deviceName?: string;
    appVersion?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      permissions: string[];
      deviceId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    permissions?: string[];
    deviceId?: string;
  }
}