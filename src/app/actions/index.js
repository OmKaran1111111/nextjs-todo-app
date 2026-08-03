"use server";

import { signIn, signOut } from "@/auth";
import { createUser, deleteUser, toggleBanUser } from "@/lib/users";
import { revalidatePath } from "next/cache";

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  await signIn(action, { redirectTo: "/" });
}

export async function doLogout() {
  await signOut({ redirectTo: "/login" });
}

export async function addUserAction(formData) {
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const role = formData.get("role") || "user";

  if (!email || !password) return;

  await createUser({ email, name, password, role });
  revalidatePath("/Manage_Users");
}

export async function deleteUserAction(formData) {
  const id = formData.get("id");
  if (!id) return;

  await deleteUser(id);
  revalidatePath("/Manage_Users");
}


export async function toggleBanAction(formData) {
  const id = formData.get("id");
  if (!id) return;
  await toggleBanUser(id);
  revalidatePath("/Manage_Users");
}