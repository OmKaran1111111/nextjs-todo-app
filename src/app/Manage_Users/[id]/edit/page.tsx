import { notFound } from "next/navigation";
import { getUserById } from "@/lib/users";
import { getAllRoles } from "@/lib/permissions";
import { updateUserAction } from "@/app/actions";
import DynamicForm, { type FormFieldConfig } from "@/components/ui/forms/DynamicForm";
import { FormPanel } from "@/components/ui/Panel";

export const dynamic = "force-dynamic";

interface EditUserProps {
  params: Promise<{ id: string }>;
}

export default async function EditUser({ params }: EditUserProps) {
  const { id } = await params;
  const user = getUserById(id);
  if (!user) notFound();

  const roles = getAllRoles();

  const fields: FormFieldConfig[] = [
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
  ];

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

        <FormPanel className="max-w-[420px] lg:static lg:max-h-none lg:w-full lg:overflow-visible">
          <h2 className="m-0 text-[1.05rem] font-bold text-[var(--color-heading)]">
            {user.name || user.email}
          </h2>
          <DynamicForm
            variant="panel"
            action={updateUserAction}
            submitLabel="Save changes"
            cancelHref="/Manage_Users"
            fields={fields}
          />
        </FormPanel>
      </div>
    </main>
  );
}