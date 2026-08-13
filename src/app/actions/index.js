"use server";

import { signIn, signOut, auth } from "@/auth";
import { createUser, deleteUser, toggleBanUser, updateUser } from "@/lib/users";
import { createRole, updateRole, deleteRole, getRoleByName } from "@/lib/permissions";
import { createPairingCode, revokeDevice } from "@/lib/devices";
import { revalidatePath } from "next/cache";

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  await signIn(action, { redirectTo: "/" });
}

export async function doLogout() {
  await signOut({ redirectTo: "/login" });
}

async function requirePermission(permission) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const allowed = isAdmin || session?.user?.permissions?.includes(permission);
  if (!allowed) throw new Error("You don't have permission to do that.");
  return session;
}

export async function addUserAction(formData) {
  await requirePermission("users:manage");

  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const role = formData.get("role") || "user";

  if (!email || !password) return;
  if (!getRoleByName(role)) throw new Error("Unknown role.");

  await createUser({ email, name, password, role });
  revalidatePath("/Manage_Users");
}

export async function updateUserAction(formData) {
  await requirePermission("users:manage");

  const id = formData.get("id");
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");
  if (!id) return;
  if (role && !getRoleByName(role)) throw new Error("Unknown role.");

  updateUser(id, { name, email, role });
  revalidatePath("/Manage_Users");
}

export async function deleteUserAction(formData) {
  await requirePermission("users:manage");

  const id = formData.get("id");
  if (!id) return;

  await deleteUser(id);
  revalidatePath("/Manage_Users");
}


export async function toggleBanAction(formData) {
  await requirePermission("users:manage");

  const id = formData.get("id");
  if (!id) return;
  await toggleBanUser(id);
  revalidatePath("/Manage_Users");
}

export async function createRoleAction(formData) {
  await requirePermission("roles:manage");

  const name = formData.get("name");
  const description = formData.get("description");
  const permissions = formData.getAll("permissions");

  createRole({ name, description, permissions });
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function updateRoleAction(formData) {
  await requirePermission("roles:manage");

  const name = formData.get("name");
  const description = formData.get("description");
  const permissions = formData.getAll("permissions");
  if (!name) return;

  updateRole(name, { description, permissions });
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function deleteRoleAction(formData) {
  await requirePermission("roles:manage");

  const name = formData.get("name");
  if (!name) return;

  deleteRole(name);
  revalidatePath("/Roles");
  revalidatePath("/Manage_Users");
}

export async function generatePairingCodeAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to connect a new device.");
  }
  return createPairingCode(session.user.id);
}

export async function revokeDeviceAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  const session = await auth();
  if (!session?.user?.id) return;

  revokeDevice(id, session.user.id, session.user.role === "admin");
  revalidatePath("/Devices");
}