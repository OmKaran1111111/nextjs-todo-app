import { getAllRoles, PERMISSION_GROUPS } from "@/lib/permissions";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "@/app/actions";
import DynamicForm from "@/components/DynamicForm";
import styles from "./page.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TOTAL_PERMISSIONS = PERMISSION_GROUPS.reduce((sum, group) => sum + group.permissions.length, 0);

const PERMISSION_FIELD_GROUPS = PERMISSION_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  options: group.permissions,
}));

function slugify(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default async function Roles({ searchParams }) {
  const roles = getAllRoles();
  const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
  
  const params = await searchParams;
  
  const isAdding = params?.add === "true";
  const editingRoleSlug = params?.edit;
  const editingRole = roles.find(role => slugify(role.name) === editingRoleSlug);
  
  const showSidePanel = isAdding || editingRole;

  return (
    <main className={styles.container}>
      <div className={`${styles.inner} ${showSidePanel ? styles.layoutSplit : ""}`}>

        <section className={styles.rosterSection}>
          <div className={styles.rosterHeaderRow}>
            <h2 className={styles.cardTitle}>All roles</h2>
            <Link href="?add=true" className={styles.btnPrimary}>
              New role
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Users</th>
                  <th className={styles.th}>Permissions</th>
                  <th className={`${styles.th} ${styles.textRight}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.name}>
                    <td className={styles.td}>
                      <span className={styles.roleName}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        {role.isSystem && <span className={styles.systemBadge}>Built-in</span>}
                      </span>
                    </td>
                    <td className={styles.td}>{role.description || "No description yet."}</td>
                    <td className={styles.td}>{role.userCount}</td>
                    <td className={styles.td}>{role.permissions.length}</td>
                    <td className={`${styles.td} ${styles.textRight}`}>
                      <div className={styles.actionGroup}>
                        <Link
                          href={`?edit=${slugify(role.name)}`}
                          className={styles.actionBtnEdit}
                        >
                          Edit
                        </Link>
                        {!role.isSystem && (
                          <form action={deleteRoleAction}>
                            <input type="hidden" name="name" value={role.name} />
                            <button
                              type="submit"
                              className={styles.actionBtnDelete}
                              disabled={role.userCount > 0}
                              title={role.userCount > 0 ? "Reassign users before deleting" : undefined}
                            >
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {showSidePanel && (
          <aside className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <div>
                <h4 className={styles.sidePanelTitle}>
                  {isAdding ? "Create a Role" : "Edit Role"}
                </h4>
                {editingRole && (
                  <p className={styles.sidePanelSubtitle}>{editingRole.name}</p>
                )}
              </div>
              <Link href="?" className={styles.closeBtn} aria-label="Close">
                ✕
              </Link>
            </div>

            <DynamicForm
              variant="panel"
              action={isAdding ? createRoleAction : updateRoleAction}
              submitLabel={isAdding ? "Create Role" : "Save Changes"}
              cancelHref="?"
              fields={[
                ...(editingRole ? [{ type: "hidden", name: "name", defaultValue: editingRole.name }] : []),
                ...(isAdding
                  ? [
                      {
                        type: "text",
                        name: "name",
                        label: "Role name",
                        placeholder: "e.g. editor",
                        required: true,
                        pattern: "[A-Za-z0-9_ ]+",
                        title: "Letters, numbers, spaces and underscores only",
                      },
                    ]
                  : []),
                {
                  type: "text",
                  name: "description",
                  label: "Description",
                  defaultValue: editingRole?.description || "",
                  placeholder: "What is this role for?",
                },
                {
                  type: "checkbox-group",
                  name: "permissions",
                  label: "Permissions",
                  groups: PERMISSION_FIELD_GROUPS,
                  checkedKeys: editingRole?.permissions || [],
                },
              ]}
            />
          </aside>
        )}
      </div>
    </main>
  );
}