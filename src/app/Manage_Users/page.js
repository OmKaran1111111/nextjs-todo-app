
import { getAllUsers } from "@/lib/users";
import { addUserAction, deleteUserAction, toggleBanAction } from "@/app/actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default function Manage_Users() {
  const users = getAllUsers();

  return (
    <main className={styles.container}>
      <section className={styles.formSection}>
        <h2 className={styles.title}>Add New User</h2>
        <form action={addUserAction} className={styles.formGrid}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className={styles.input}
          />
          <button type="submit" className={styles.btnPrimary}>
            Add User
          </button>
        </form>
      </section>

      <section>
        <h1 className={styles.title}>All Users ({users.length})</h1>

        {users.length === 0 ? (
          <p className={styles.emptyText}>No users found.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={`${styles.th} ${styles.textRight}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isBanned = user.isBanned == 1 || user.isBanned === true;

                  return (
                    <tr key={user.id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.idText}`}>{user.id}</td>
                      <td className={styles.td}>{user.email}</td>
                      <td className={styles.td}>
                        <span className={styles.roleBadge}>
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {isBanned ? (
                          <span className={styles.statusBanned}>Banned</span>
                        ) : (
                          <span className={styles.statusActive}>Active</span>
                        )}
                      </td>
                      <td className={`${styles.td} ${styles.textRight}`}>
                        <div className={styles.actionGroup}>
                          <form action={toggleBanAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <button
                              type="submit"
                              className={isBanned ? styles.btnUnban : styles.btnBan}
                            >
                              {isBanned ? "Unban" : "Ban"}
                            </button>
                          </form>

                          <form action={deleteUserAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <button type="submit" className={styles.btnDelete}>
                              Delete
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
    </main>
  );
}