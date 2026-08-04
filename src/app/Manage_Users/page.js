import Link from "next/link";
import { getAllUsers } from "@/lib/users";
import { addUserAction, deleteUserAction, toggleBanAction } from "@/app/actions";
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

export default function Manage_Users() {
  const users = getAllUsers();

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.layout}>
          <section className={styles.formCard}>
            <h2 className={styles.cardTitle}>Add a user</h2>
            <form action={addUserAction} className={styles.formGrid}>
              <label className={styles.fieldLabel}>
                Name
                <input type="text" name="name" placeholder="User Name" className={styles.input} />
              </label>
              <label className={styles.fieldLabel}>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.fieldLabel}>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.fieldLabel}>
                Role
                <select name="role" defaultValue="user" className={styles.select}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button type="submit" className={styles.btnPrimary}>
                Add user
              </button>
            </form>
          </section>

          <section className={styles.rosterSection}>
            <div className={styles.rosterHeaderRow}>
              <h2 className={styles.cardTitle}>All users</h2>
              <span className={styles.rosterCount}>{users.length} total</span>
            </div>

            {users.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No users yet</p>
                <p className={styles.emptyText}>Accounts you add will show up here.</p>
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
                      <th className={`${styles.th} ${styles.textRight}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isBanned = user.isBanned == 1 || user.isBanned === true;
                      const isAdmin = user.role === "admin";
                      const palette = AVATAR_PALETTE[hashString(user.id) % AVATAR_PALETTE.length];

                      return (
                        <tr key={user.id} className={isBanned ? styles.rowBanned : ""}>
                          <td className={styles.td}>
                            <Link
                              href={`/tasks?userId=${user.id}&name=${encodeURIComponent(user.name || user.email)}`}
                              className={styles.userCell}
                            >
                              <span
                                className={`${styles.avatar} ${isAdmin ? styles.avatarAdmin : ""}`}
                                style={{ backgroundColor: palette.bg, color: palette.fg }}
                              >
                                {initialsFor(user)}
                              </span>
                              <div className={styles.userMeta}>
                                <span className={styles.userName}>{user.name || "—"}</span>
                                <span className={styles.userEmail}>{user.email}</span>
                              </div>
                            </Link>
                          </td>
                          <td className={styles.td}>
                            <span className={isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser}>
                              {isAdmin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {isBanned ? (
                              <span className={styles.revokedStamp}>Access revoked</span>
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
                              <form action={toggleBanAction}>
                                <input type="hidden" name="id" value={user.id} />
                                <button
                                  type="submit"
                                  className={isBanned ? styles.actionBtnUnban : styles.actionBtnBan}
                                >
                                  {isBanned ? "Unban" : "Ban"}
                                </button>
                              </form>

                              <form action={deleteUserAction}>
                                <input type="hidden" name="id" value={user.id} />
                                <button type="submit" className={styles.actionBtnDelete}>
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
      </div>
    </main>
  );
}