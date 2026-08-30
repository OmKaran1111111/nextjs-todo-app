import { getAllRoles, PERMISSION_GROUPS } from "@/lib/permissions";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/app/actions";
import DynamicForm, { type FormFieldConfig } from "@/components/DynamicForm";
import { SidePanel, PanelHeader } from "@/components/ui/Panel";
import { TableWrapper, Table, Th, Td } from "@/components/ui/Table";
import { PillBadge } from "@/components/ui/Badge";
import { ActionButton, PrimaryButton } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PERMISSION_FIELD_GROUPS = PERMISSION_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  options: group.permissions,
}));

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

interface RolesProps {
  searchParams: Promise<{ add?: string; edit?: string }>;
}

export default async function Roles({ searchParams }: RolesProps) {
  const roles = getAllRoles();

  const params = await searchParams;

  const isAdding = params?.add === "true";
  const editingRoleSlug = params?.edit;
  const editingRole = roles.find(
    (role) => slugify(role.name) === editingRoleSlug,
  );

  const showSidePanel = isAdding || editingRole;

  const roleFormFields: FormFieldConfig[] = [
    ...(editingRole
      ? [{ type: "hidden", name: "name", defaultValue: editingRole.name } as const]
      : []),
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
          } as const,
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
  ];

  return (
    <main className="page-shell page-shell--roomy page-shell--full-height">
      <div
        className={`page-shell-inner ${showSidePanel ? "page-shell-inner--split" : ""}`}
      >
        <section className={`min-w-0 flex-1 ${showSidePanel ? "[&_table]:min-w-[420px] [&_th]:px-[0.6rem] [&_th]:py-[0.45rem] [&_th]:text-[0.78rem] [&_td]:px-[0.6rem] [&_td]:py-[0.45rem] [&_td]:text-[0.78rem]" : ""}`}>
          <PageHeader
            title="All roles"
            action={
              <PrimaryButton href="?add=true" className="mt-0">
                New role
              </PrimaryButton>
            }
          />

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Role</Th>
                  <Th>Description</Th>
                  <Th>Users</Th>
                  <Th>Permissions</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.name} className="group hover:[&>td]:bg-[var(--color-surface-hover)]">
                    <Td>
                      <span className="flex items-center gap-2 text-base font-bold text-[var(--color-heading)]">
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        {role.isSystem && (
                          <PillBadge tone="muted" className="text-[0.65rem] tracking-wide uppercase">
                            Built-in
                          </PillBadge>
                        )}
                      </span>
                    </Td>
                    <Td>{role.description || "No description yet."}</Td>
                    <Td>{role.userCount}</Td>
                    <Td>{role.permissions.length}</Td>
                    <Td align="right">
                      <div className="flex flex-wrap justify-end gap-[0.4rem]">
                        <ActionButton href={`?edit=${slugify(role.name)}`} tone="neutral">
                          Edit
                        </ActionButton>
                        {!role.isSystem && (
                          <form action={deleteRoleAction}>
                            <input type="hidden" name="name" value={role.name} />
                            <SubmitButton
                              tone="danger"
                              pendingLabel="Deleting…"
                              disabled={role.userCount > 0}
                              title={
                                role.userCount > 0
                                  ? "Reassign users before deleting"
                                  : undefined
                              }
                              className="disabled:hover:border-[var(--color-border)] disabled:hover:bg-[var(--color-surface-muted)] disabled:hover:text-[var(--color-body)]"
                            >
                              Delete
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </section>

        {showSidePanel && (
          <SidePanel>
            <div className="mb-4 border-b border-[var(--color-border-soft)] pb-[0.85rem]">
              <PanelHeader
                title={isAdding ? "Create a Role" : "Edit Role"}
                subtitle={editingRole ? editingRole.name : null}
                onCloseHref="?"
              />
            </div>

            <DynamicForm
              variant="panel"
              action={isAdding ? createRoleAction : updateRoleAction}
              submitLabel={isAdding ? "Create Role" : "Save Changes"}
              cancelHref="?"
              fields={roleFormFields}
            />
          </SidePanel>
        )}
      </div>
    </main>
  );
}