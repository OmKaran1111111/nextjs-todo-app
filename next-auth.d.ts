import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: string[];
      deviceId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    deviceName?: string;
    appVersion?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: string[];
    deviceId?: string;
  }
}