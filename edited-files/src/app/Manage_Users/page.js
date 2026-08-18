import Link from "next/link";
import { getAllUsers } from "@/lib/users";
import { getAllRoles } from "@/lib/permissions";
import {
  addUserAction,
  updateUserAction,
  deleteUserAction,
  toggleBanAction,
} from "@/app/actions";
import DynamicForm from "@/components/DynamicForm";
import PageShell from "@/components/PageShell";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const AVATAR_PALETTE = [
  { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
  { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
  { bg: "var(--color-warning-soft)", fg: "var(--color-warning)" },
  { bg: "var(--color-accent)", fg: "var(--color-accent-contrast)" },
  { bg: "var(--color-danger-soft)", fg: "var(--color-danger)" },
  { bg: "var(--color-primary)", fg: "var(--color-primary-contrast)" },
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFor(user) {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatJoined(createdAt) {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Manage_Users({ searchParams }) {
  const users = getAllUsers();
  const roles = getAllRoles();

  const params = await searchParams;
  const editingUserId = params?.edit;
  const editingUser = editingUserId
    ? users.find((u) => u.id === editingUserId)
    : null;
  const isEditing = Boolean(editingUser);

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
  }));

  return (
    <PageShell fullHeight>
      <div className={styles.layout}>
        <aside className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                {isEditing ? "Edit user" : "Add a user"}
              </h2>
              {isEditing && (
                <p className={styles.sidePanelSubtitle}>
                  {editingUser.name || editingUser.email}
                </p>
              )}
            </div>
            {isEditing && (
              <Link
                href="/Manage_Users"
                className={styles.closeBtn}
                aria-label="Cancel edit"
              >
                ✕
              </Link>
            )}
          </div>

          <div
            key={isEditing ? editingUser.id : "add"}
            className={styles.formCardBody}
          >
            {isEditing ? (
              <DynamicForm
                variant="panel"
                action={updateUserAction}
                submitLabel="Save changes"
                cancelHref="/Manage_Users"
                fields={[
                  { type: "hidden", name: "id", defaultValue: editingUser.id },
                  {
                    type: "text",
                    name: "name",
                    label: "Name",
                    defaultValue: editingUser.name || "",
                    placeholder: "User Name",
                  },
                  {
                    type: "email",
                    name: "email",
                    label: "Email",
                    defaultValue: editingUser.email,
                    required: true,
                  },
                  {
                    type: "select",
                    name: "role",
                    label: "Role",
                    defaultValue: editingUser.role || "user",
                    options: roleOptions,
                  },
                ]}
              />
            ) : (
              <DynamicForm
                variant="panel"
                action={addUserAction}
                submitLabel="Add user"
                fields={[
                  {
                    type: "text",
                    name: "name",
                    label: "Name",
                    placeholder: "User Name",
                  },
                  {
                    type: "email",
                    name: "email",
                    label: "Email",
                    placeholder: "user@example.com",
                    required: true,
                  },
                  {
                    type: "password",
                    name: "password",
                    label: "Password",
                    placeholder: "password",
                    required: true,
                  },
                  {
                    type: "select",
                    name: "role",
                    label: "Role",
                    defaultValue: "user",
                    options: roleOptions,
                  },
                ]}
              />
            )}
          </div>

          {!isEditing && (
            <p className={styles.rosterCount} style={{ marginTop: "0.75rem" }}>
              Need a different set of permissions?{" "}
              <Link
                href="/Roles"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Manage roles
              </Link>
            </p>
          )}
        </aside>

        <section className={styles.rosterSection}>
          <div className={styles.rosterHeaderRow}>
            <h2 className={styles.cardTitle}>All users</h2>
            <span className={styles.rosterCount}>{users.length} total</span>
          </div>

          {users.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No users yet</p>
              <p className={styles.emptyText}>
                Accounts you add will show up here.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>User</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Joined</th>
                    <th className={`${styles.th} ${styles.textRight}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isBanned =
                      user.isBanned == 1 || user.isBanned === true;
                    const isAdmin = user.role === "admin";
                    const palette =
                      AVATAR_PALETTE[
                        hashString(user.id) % AVATAR_PALETTE.length
                      ];
                    const isActiveRow = editingUser?.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        className={`${isBanned ? styles.rowBanned : ""} ${isActiveRow ? styles.rowActive : ""}`}
                      >
                        <td className={styles.td}>
                          <Link
                            href={`/tasks?userId=${user.id}&name=${encodeURIComponent(user.name || user.email)}`}
                            className={styles.userCell}
                          >
                            <span
                              className={`${styles.avatar} ${isAdmin ? styles.avatarAdmin : ""}`}
                              style={{
                                backgroundColor: palette.bg,
                                color: palette.fg,
                              }}
                            >
                              {initialsFor(user)}
                            </span>
                            <div className={styles.userMeta}>
                              <span className={styles.userName}>
                                {user.name || "—"}
                              </span>
                              <span className={styles.userEmail}>
                                {user.email}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={
                              isAdmin
                                ? styles.roleBadgeAdmin
                                : styles.roleBadgeUser
                            }
                          >
                            {user.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : "User"}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {isBanned ? (
                            <span className={styles.revokedStamp}>
                              Access revoked
                            </span>
                          ) : (
                            <span className={styles.statusActive}>
                              <span className={styles.statusDot} />
                              Active
                            </span>
                          )}
                        </td>
                        <td className={`${styles.td} ${styles.joinedCell}`}>
                          {formatJoined(user.createdAt)}
                        </td>
                        <td className={`${styles.td} ${styles.textRight}`}>
                          <div className={styles.actionGroup}>
                            <Link
                              href={`?edit=${user.id}`}
                              className={styles.actionBtnEdit}
                            >
                              Edit
                            </Link>
                            <form action={toggleBanAction}>
                              <input type="hidden" name="id" value={user.id} />
                              <button
                                type="submit"
                                className={
                                  isBanned
                                    ? styles.actionBtnUnban
                                    : styles.actionBtnBan
                                }
                              >
                                {isBanned ? "Unban" : "Ban"}
                              </button>
                            </form>

                            <form action={deleteUserAction}>
                              <input type="hidden" name="id" value={user.id} />
                              <button
                                type="submit"
                                className={styles.actionBtnDelete}
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
