import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/users";
import { getAllRoles } from "@/lib/permissions";
import { updateUserAction } from "@/app/actions";
import styles from "../../page.module.css";

export const dynamic = "force-dynamic";

export default async function EditUser({ params }) {
  const { id } = await params;
  const user = getUserById(id);
  if (!user) notFound();

  const roles = getAllRoles();

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <p className={styles.eyebrow}>Manage users</p>
          <h1 className={styles.pageTitle}>Edit user</h1>
          <p className={styles.pageSubtitle}>
            Changing a user&apos;s role changes the permissions they have immediately.
          </p>
        </div>

        <section className={styles.formCard} style={{ maxWidth: 420 }}>
          <h2 className={styles.cardTitle}>{user.name || user.email}</h2>
          <form action={updateUserAction} className={styles.formGrid}>
            <input type="hidden" name="id" value={user.id} />
            <label className={styles.fieldLabel}>
              Name
              <input
                type="text"
                name="name"
                defaultValue={user.name || ""}
                placeholder="User Name"
                className={styles.input}
              />
            </label>
            <label className={styles.fieldLabel}>
              Email
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className={styles.input}
              />
            </label>
            <label className={styles.fieldLabel}>
              Role
              <select name="role" defaultValue={user.role || "user"} className={styles.select}>
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.actionGroup} style={{ justifyContent: "flex-start" }}>
              <button type="submit" className={styles.btnPrimary}>
                Save changes
              </button>
              <Link href="/Manage_Users" className={styles.actionBtnBan}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}