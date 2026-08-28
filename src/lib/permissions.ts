import db from "@/lib/db";

export interface Permission {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

export interface Role {
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  permissions: string[];
}

export interface RoleWithUserCount extends Role {
  userCount: number;
}

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  permissions?: string | string[];
}

export interface UpdateRoleInput {
  description?: string | null;
  permissions?: string | string[];
}

export type DeleteRoleResult = { ok: true } | { ok: false; error: string };

interface RoleRow {
  name: string;
  description: string | null;
  isSystem: number;
  createdAt: string;
}

interface RolePermissionRow {
  role: string;
  permission: string;
}

interface UserCountRow {
  role: string;
  count: number;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "users",
    label: "Users",
    permissions: [
      { key: "users:view", label: "View users", description: "See the list of user accounts." },
      {
        key: "users:manage",
        label: "Manage users",
        description: "Add, edit, ban/unban and delete user accounts.",
      },
    ],
  },
  {
    id: "roles",
    label: "Roles & permissions",
    permissions: [
      {
        key: "roles:manage",
        label: "Manage roles",
        description: "Create, edit and delete roles and their permissions.",
      },
    ],
  },
  {
    id: "tasks",
    label: "Tasks",
    permissions: [
      { key: "tasks:view_own", label: "View own tasks", description: "See tasks that belong to them." },
      {
        key: "tasks:manage_own",
        label: "Manage own tasks",
        description: "Create, edit, complete and delete their own tasks.",
      },
      {
        key: "tasks:view_all",
        label: "View all tasks",
        description: "See every user's tasks (used by the admin dashboard).",
      },
    ],
  },
  {
    id: "devices",
    label: "Devices",
    permissions: [
      { key: "devices:view_own", label: "View own devices", description: "See their own signed-in devices." },
      {
        key: "devices:manage_own",
        label: "Manage own devices",
        description: "Pair and revoke their own devices.",
      },
      {
        key: "devices:manage_all",
        label: "Manage all devices",
        description: "View and revoke devices belonging to any user.",
      },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((group) => group.permissions);
const VALID_PERMISSION_KEYS = new Set(ALL_PERMISSIONS.map((p) => p.key));

export function getAllRoles(): RoleWithUserCount[] {
  const roles = db.prepare("SELECT name, description, isSystem, createdAt FROM roles ORDER BY name ASC").all() as RoleRow[];
  const perms = db.prepare("SELECT role, permission FROM role_permissions").all() as RolePermissionRow[];
  const userCounts = db
    .prepare("SELECT role, COUNT(*) AS count FROM users GROUP BY role")
    .all() as UserCountRow[];

  const permsByRole: Record<string, string[]> = {};
  for (const { role, permission } of perms) {
    (permsByRole[role] ||= []).push(permission);
  }
  const countByRole: Record<string, number> = {};
  for (const { role, count } of userCounts) countByRole[role] = count;

  return roles.map((role) => ({
    ...role,
    isSystem: !!role.isSystem,
    permissions: (permsByRole[role.name] || []).sort(),
    userCount: countByRole[role.name] || 0,
  }));
}

export function getRoleByName(name: string | null | undefined): Role | null {
  if (!name) return null;
  const role = db.prepare("SELECT name, description, isSystem, createdAt FROM roles WHERE name = ?").get(name) as
    | RoleRow
    | undefined;
  if (!role) return null;
  const perms = (db
    .prepare("SELECT permission FROM role_permissions WHERE role = ?")
    .all(name) as { permission: string }[])
    .map((p) => p.permission);
  return { ...role, isSystem: !!role.isSystem, permissions: perms.sort() };
}

export function getPermissionsForRole(name: string | null | undefined): string[] {
  if (!name) return [];
  return (db
    .prepare("SELECT permission FROM role_permissions WHERE role = ?")
    .all(name) as { permission: string }[])
    .map((p) => p.permission);
}

function sanitizePermissions(permissions: string | string[] | null | undefined): string[] {
  const list = Array.isArray(permissions) ? permissions : [permissions].filter(Boolean) as string[];
  return [...new Set(list.filter((key) => VALID_PERMISSION_KEYS.has(key)))];
}

export function createRole({ name, description, permissions }: CreateRoleInput): Role | null {
  const cleanName = (name || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (!cleanName) throw new Error("Role name is required.");

  const existing = db.prepare("SELECT name FROM roles WHERE name = ?").get(cleanName);
  if (existing) throw new Error(`A role named "${cleanName}" already exists.`);

  const cleanPerms = sanitizePermissions(permissions);
  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare("INSERT INTO roles (name, description, isSystem, createdAt) VALUES (?, ?, 0, ?)").run(
      cleanName,
      description || null,
      now
    );
    const insertPerm = db.prepare("INSERT INTO role_permissions (role, permission) VALUES (?, ?)");
    for (const perm of cleanPerms) insertPerm.run(cleanName, perm);
  })();

  return getRoleByName(cleanName);
}

export function updateRole(name: string, { description, permissions }: UpdateRoleInput): Role | null {
  const role = db.prepare("SELECT name FROM roles WHERE name = ?").get(name);
  if (!role) throw new Error("Role not found.");

  const cleanPerms = sanitizePermissions(permissions);

  db.transaction(() => {
    if (description !== undefined) {
      db.prepare("UPDATE roles SET description = ? WHERE name = ?").run(description || null, name);
    }
    db.prepare("DELETE FROM role_permissions WHERE role = ?").run(name);
    const insertPerm = db.prepare("INSERT INTO role_permissions (role, permission) VALUES (?, ?)");
    for (const perm of cleanPerms) insertPerm.run(name, perm);
  })();

  return getRoleByName(name);
}

export function deleteRole(name: string): DeleteRoleResult {
  const role = db.prepare("SELECT name, isSystem FROM roles WHERE name = ?").get(name) as
    | { name: string; isSystem: number }
    | undefined;
  if (!role) return { ok: false, error: "Role not found." };
  if (role.isSystem) return { ok: false, error: "Built-in roles can't be deleted." };

  const inUse = (db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = ?").get(name) as { count: number })
    .count;
  if (inUse > 0) {
    return { ok: false, error: `${inUse} user(s) still have this role. Reassign them first.` };
  }

  db.prepare("DELETE FROM roles WHERE name = ?").run(name);
  return { ok: true };
}

export function roleHasPermission(roleName: string | null | undefined, permission: string): boolean {
  return getPermissionsForRole(roleName).includes(permission);
}