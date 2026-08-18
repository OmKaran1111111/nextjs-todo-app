import { notFound } from "next/navigation";
import { getUserById } from "@/lib/users";
import { getAllRoles } from "@/lib/permissions";
import { updateUserAction } from "@/app/actions";
import DynamicForm from "@/components/DynamicForm";
import styles from "../../page.module.css";

export const dynamic = "force-dynamic";

export default async function EditUser({ params }) {
  const { id } = await params;
  const user = getUserById(id);
  if (!user) notFound();

  const roles = getAllRoles();

  return (
    <main className="page-shell page-shell--roomy page-shell--full-height">
      <div className="page-shell-inner">
        <div className="page-header">
          <p className="page-header-eyebrow">Manage users</p>
          <h1 className="page-header-title">Edit user</h1>
          <p className="page-header-subtitle">
            Changing a user&apos;s role changes the permissions they have
            immediately.
          </p>
        </div>

        <section className={styles.formCard} style={{ maxWidth: 420 }}>
          <h2 className={styles.cardTitle}>{user.name || user.email}</h2>
          <DynamicForm
            variant="panel"
            action={updateUserAction}
            submitLabel="Save changes"
            cancelHref="/Manage_Users"
            fields={[
              { type: "hidden", name: "id", defaultValue: user.id },
              {
                type: "text",
                name: "name",
                label: "Name",
                defaultValue: user.name || "",
                placeholder: "User Name",
              },
              {
                type: "email",
                name: "email",
                label: "Email",
                defaultValue: user.email,
                required: true,
              },
              {
                type: "select",
                name: "role",
                label: "Role",
                defaultValue: user.role || "user",
                options: roles.map((role) => ({
                  value: role.name,
                  label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
                })),
              },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
