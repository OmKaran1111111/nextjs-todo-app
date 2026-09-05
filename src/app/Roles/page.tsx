import { getAllRoles, PERMISSION_GROUPS } from "@/lib/permissions";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/app/actions";
import DynamicForm, { type FormFieldConfig } from "@/components/ui/forms/DynamicForm";
import { SidePanel, PanelHeader } from "@/components/ui/Panel";
import { PillBadge } from "@/components/ui/Badge";
import { ActionButton, PrimaryButton } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Icon } from "@/components/ui/Icon";
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

function titleCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
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
        <section className="min-w-0 flex-1">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6">
            <div>
              <h1 className="page-header-title">Roles</h1>
            </div>
            <PrimaryButton href="?add=true" className="mt-0">
              <Icon name="plus" size={14} className="mr-1.5 inline-block align-[-2px]" />
              New role
            </PrimaryButton>
          </div>

          {roles.length === 0 ? (
            <div className="rounded-[1.1rem] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-6 py-14 text-center">
              <p className="m-0 text-lg font-bold text-heading [font-family:var(--font-display)]">
                No roles yet
              </p>
              <p className="m-0 mt-1 text-sm text-faint">
                Create your first role to start assigning permissions.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                showSidePanel ? "" : "xl:grid-cols-3"
              }`}
            >
              {roles.map((role, index) => {
                const slug = slugify(role.name);
                const isActiveRow = editingRole?.name === role.name;

                return (
                  <article
                    key={role.name}
                    className={`group relative flex flex-col gap-3 rounded-[1.1rem] border-2 bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-card)] transition-transform duration-150 hover:-translate-y-[3px] hover:shadow-[var(--shadow-card-lg)] ${
                      isActiveRow
                        ? "border-[var(--color-primary)]"
                        : "border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span className="pointer-events-none absolute top-4 right-5 text-[0.7rem] font-mono text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="pr-8">
                      <h3 className="m-0 text-[1.15rem] font-bold text-heading [font-family:var(--font-display)]">
                        {titleCase(role.name)}
                      </h3>
                      {role.isSystem && (
                        <PillBadge tone="muted" className="mt-1.5 text-[0.65rem] tracking-wide uppercase">
                          Built-in
                        </PillBadge>
                      )}
                    </div>

                    <p className="m-0 min-h-[2.6em] flex-1 text-[0.88rem] leading-snug text-muted">
                      {role.description || "No description yet."}
                    </p>

                    <div className="flex items-center gap-2.5 text-[0.78rem] font-semibold text-faint">
                      <span>{role.userCount} member{role.userCount === 1 ? "" : "s"}</span>
                      <span aria-hidden="true" className="text-[var(--color-border-strong)]">
                        ·
                      </span>
                      <span>{role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}</span>
                    </div>

                    <div className="flex flex-wrap gap-[0.4rem] border-t border-[var(--color-border-soft)] pt-3.5">
                      <ActionButton href={`?edit=${slug}`} tone="neutral">
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
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {showSidePanel && (
          <>
            <a
              href="?"
              aria-label="Close panel"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] md:hidden"
            />

            <div className="fixed inset-x-4 top-1/2 z-50 max-h-[85vh] -translate-y-1/2 overflow-y-auto md:static md:inset-auto md:top-auto md:z-auto md:max-h-none md:translate-y-0 md:overflow-visible">
              <SidePanel>
                <div className="mb-4 border-b border-[var(--color-border-soft)] pb-[0.85rem]">
                  <PanelHeader
                    title={
                      <span className="[font-family:var(--font-display)]">
                        {isAdding ? "Create a role" : "Edit role"}
                      </span>
                    }
                    subtitle={editingRole ? titleCase(editingRole.name) : null}
                    onCloseHref="?"
                  />
                </div>

                <DynamicForm
                  variant="panel"
                  action={isAdding ? createRoleAction : updateRoleAction}
                  submitLabel={isAdding ? "Create role" : "Save changes"}
                  cancelHref="?"
                  fields={roleFormFields}
                />
              </SidePanel>
            </div>
          </>
        )}
      </div>
    </main>
  );
}