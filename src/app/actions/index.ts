"use server";

import { signIn, signOut, auth } from "@/auth";
import {
  createUser,
  deleteUser,
  toggleBanUser,
  updateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/users";
import {
  createRole,
  updateRole,
  deleteRole,
  getRoleByName,
} from "@/lib/permissions";
import { createPairingCode, revokeDevice } from "@/lib/devices";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

function formString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function formStringList(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string");
}

export async function doSocialLogin(formData: FormData): Promise<void> {
  const action = formString(formData, "action");
  if (!action) return;
  await signIn(action, { redirectTo: "/" });
}

export async function doLogout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

async function requirePermission(permission: string): Promise<Session> {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const allowed = isAdmin || session?.user?.permissions?.includes(permission);
  if (!allowed || !session) throw new Error("You don't have permission to do that.");
  return session;
}

export async function addUserAction(formData: FormData): Promise<void> {
  await requirePermission("users:manage");

  const email = formString(formData, "email");
  const name = formString(formData, "name");
  const password = formString(formData, "password");
  const role = formString(formData, "role") || "user";

  if (!email || !password) return;
  if (!getRoleByName(role)) throw new Error("Unknown role.");

  const input: CreateUserInput = { email, name, password, role };
  await createUser(input);
  revalidatePath("/Manage_Users");
}

export async function updateUserAction(formData: FormData): Promise<void> {
  await requirePermission("users:manage");

  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const email = formString(formData, "email");
  const role = formString(formData, "role");
  if (!id) return;
  if (role && !getRoleByName(role)) throw new Error("Unknown role.");

  const updates: UpdateUserInput = { name, email, role };
  updateUser(id, updates);
  revalidatePath("/Manage_Users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  await requirePermission("users:manage");

  const id = formString(formData, "id");
  if (!id) return;

  await deleteUser(id);
  revalidatePath("/Manage_Users");
}

export async function toggleBanAction(formData: FormData): Promise<void> {
  await requirePermission("users:manage");

  const id = formString(formData, "id");
  if (!id) return;
  await toggleBanUser(id);
  revalidatePath("/Manage_Users");
}

export async function createRoleAction(formData: FormData): Promise<void> {
  await requirePermission("roles:manage");

  const name = formString(formData, "name");
  const description = formString(formData, "description");
  const permissions = formStringList(formData, "permissions");

  if (!name) throw new Error("Role name is required.");

  createRole({ name, description, permissions });
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function updateRoleAction(formData: FormData): Promise<void> {
  await requirePermission("roles:manage");

  const name = formString(formData, "name");
  const description = formString(formData, "description");
  const permissions = formStringList(formData, "permissions");
  if (!name) return;

  updateRole(name, { description, permissions });
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function deleteRoleAction(formData: FormData): Promise<void> {
  await requirePermission("roles:manage");

  const name = formString(formData, "name");
  if (!name) return;

  deleteRole(name);
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function generatePairingCodeAction(): Promise<{
  code: string;
  expiresAt: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to connect a new device.");
  }
  return createPairingCode(session.user.id);
}

export async function revokeDeviceAction(formData: FormData): Promise<void> {
  const id = formString(formData, "id");
  if (!id) return;

  const session = await auth();
  if (!session?.user?.id) return;

  revokeDevice(id, session.user.id, session.user.role === "admin");
  revalidatePath("/Devices");
}