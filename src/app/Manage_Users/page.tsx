import Link from "next/link";
import { getAllUsers, type PublicUser } from "@/lib/users";
import { getAllRoles } from "@/lib/permissions";
import {
  addUserAction,
  updateUserAction,
  deleteUserAction,
  toggleBanAction,
} from "@/app/actions";
import DynamicForm from "@/components/DynamicForm";
import { SplitLayout, FormPanel, PanelHeader } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableWrapper, Table, Th, Td, rowClasses } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { PillBadge, DotBadge, RevokedStamp } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const AVATAR_PALETTE = [
  { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
  { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
  { bg: "var(--color-warning-soft)", fg: "var(--color-warning)" },
  { bg: "var(--color-accent)", fg: "var(--color-accent-contrast)" },
  { bg: "var(--color-danger-soft)", fg: "var(--color-danger)" },
  { bg: "var(--color-primary)", fg: "var(--color-primary-contrast)" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFor(user: PublicUser): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatJoined(createdAt: string | null | undefined): string {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ManageUsersProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function Manage_Users({ searchParams }: ManageUsersProps) {
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
    <main className="page-shell page-shell--roomy page-shell--full-height">
      <div className="page-shell-inner">
        <SplitLayout>
          <FormPanel>
            <PanelHeader
              title={isEditing ? "Edit user" : "Add a user"}
              subtitle={isEditing ? editingUser!.name || editingUser!.email : null}
              onCloseHref={isEditing ? "/Manage_Users" : undefined}
            />

            <div key={isEditing ? editingUser!.id : "add"} className="animate-[fadeIn_0.2s_ease-out]">
              {isEditing ? (
                <DynamicForm
                  variant="panel"
                  action={updateUserAction}
                  submitLabel="Save changes"
                  cancelHref="/Manage_Users"
                  fields={[
                    { type: "hidden", name: "id", defaultValue: editingUser!.id },
                    {
                      type: "text",
                      name: "name",
                      label: "Name",
                      defaultValue: editingUser!.name || "",
                      placeholder: "User Name",
                    },
                    {
                      type: "email",
                      name: "email",
                      label: "Email",
                      defaultValue: editingUser!.email,
                      required: true,
                    },
                    {
                      type: "select",
                      name: "role",
                      label: "Role",
                      defaultValue: editingUser!.role || "user",
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
                    { type: "text", name: "name", label: "Name", placeholder: "User Name" },
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
              <p className="mt-3 text-[0.8rem] text-[var(--color-faint)]">
                Need a different set of permissions?{" "}
                <Link href="/Roles" className="font-semibold text-[var(--color-primary)]">
                  Manage roles
                </Link>
              </p>
            )}
          </FormPanel>

          <section className="min-w-0 flex-1">
            <PageHeader title="All users" meta={`${users.length} total`} />

            {users.length === 0 ? (
              <EmptyState title="No users yet" text="Accounts you add will show up here." />
            ) : (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Joined</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isBanned = user.isBanned == 1 || (user.isBanned as unknown) === true;
                      const isAdmin = user.role === "admin";
                      const palette = AVATAR_PALETTE[hashString(user.id) % AVATAR_PALETTE.length];
                      const isActiveRow = editingUser?.id === user.id;

                      return (
                        <tr
                          key={user.id}
                          className={rowClasses({ dimmed: isBanned, highlighted: isActiveRow })}
                        >
                          <Td>
                            <Link
                              href={`/tasks?userId=${user.id}&name=${encodeURIComponent(user.name || user.email)}`}
                              className="flex cursor-pointer items-center gap-[0.65rem] no-underline"
                            >
                              <Avatar
                                initials={initialsFor(user)}
                                bg={palette.bg}
                                fg={palette.fg}
                                ringed={isAdmin}
                              />
                              <div className="flex min-w-0 flex-col gap-[0.1rem]">
                                <span className="max-w-[220px] overflow-hidden text-[0.86rem] font-semibold text-ellipsis whitespace-nowrap text-[var(--color-heading)]">
                                  {user.name || "—"}
                                </span>
                                <span className="max-w-[220px] overflow-hidden text-[0.76rem] text-ellipsis whitespace-nowrap text-[var(--color-faint)]">
                                  {user.email}
                                </span>
                              </div>
                            </Link>
                          </Td>
                          <Td>
                            <PillBadge tone={isAdmin ? "accent" : "muted"}>
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                            </PillBadge>
                          </Td>
                          <Td>
                            {isBanned ? (
                              <RevokedStamp>Access revoked</RevokedStamp>
                            ) : (
                              <DotBadge tone="success" live>
                                Active
                              </DotBadge>
                            )}
                          </Td>
                          <Td className="whitespace-nowrap !text-[var(--color-muted)]">
                            {formatJoined(user.createdAt)}
                          </Td>
                          <Td align="right">
                            <div className="flex flex-wrap justify-end gap-[0.4rem]">
                              <ActionButton href={`?edit=${user.id}`} tone="neutral">
                                Edit
                              </ActionButton>
                              <form action={toggleBanAction}>
                                <input type="hidden" name="id" value={user.id} />
                                <SubmitButton
                                  tone={isBanned ? "success" : "warning"}
                                  pendingLabel={isBanned ? "Unbanning…" : "Banning…"}
                                >
                                  {isBanned ? "Unban" : "Ban"}
                                </SubmitButton>
                              </form>
                              <form action={deleteUserAction}>
                                <input type="hidden" name="id" value={user.id} />
                                <SubmitButton tone="danger" pendingLabel="Removing…">
                                  Remove
                                </SubmitButton>
                              </form>
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </section>
        </SplitLayout>
      </div>
    </main>
  );
}