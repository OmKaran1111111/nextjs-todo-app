import { auth } from "@/auth";
import {
  getDevicesForUser,
  getAllDevicesWithOwners,
  getDeviceStatus,
} from "@/lib/devices";
import { revokeDeviceAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableWrapper, Table, Th, Td, rowClasses } from "@/components/ui/Table";
import { DotBadge, RevokedStamp } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function formatTimestamp(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function Devices() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const devices = isAdmin
    ? getAllDevicesWithOwners()
    : getDevicesForUser(session.user.id);

  return (
    <main className="page-shell page-shell--roomy page-shell--full-height">
      <div className="page-shell-inner">
        <PageHeader title="Devices" meta={`${devices.length} total`} />

        {devices.length === 0 ? (
          <EmptyState
            title="No devices yet"
            text="Signed-in devices will show up here."
          />
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  {isAdmin && <Th>User</Th>}
                  <Th>Device &amp; Browser</Th>
                  <Th>Version</Th>
                  <Th>First Seen</Th>
                  <Th>Last Active</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const status = getDeviceStatus(device);

                  return (
                    <tr
                      key={device.id}
                      className={rowClasses({ dimmed: device.revoked })}
                    >
                      {isAdmin && (
                        <Td>
                          <div className="flex min-w-0 flex-col gap-[0.1rem]">
                            <span className="max-w-[220px] overflow-hidden text-[0.86rem] font-semibold text-ellipsis whitespace-nowrap text-[var(--color-heading)]">
                              {device.ownerName || "—"}
                            </span>
                            <span className="max-w-[220px] overflow-hidden text-[0.76rem] text-ellipsis whitespace-nowrap text-[var(--color-faint)]">
                              {device.ownerEmail}
                            </span>
                          </div>
                        </Td>
                      )}
                      <Td>{device.deviceName}</Td>
                      <Td>{device.appVersion || device.browserVersion || "—"}</Td>
                      <Td className="whitespace-nowrap !text-[var(--color-muted)]">
                        {formatTimestamp(device.createdAt)}
                      </Td>
                      <Td className="whitespace-nowrap !text-[var(--color-muted)]">
                        {formatTimestamp(device.lastActiveAt)}
                      </Td>
                      <Td>
                        <DotBadge tone={status.tone}>{status.label}</DotBadge>
                      </Td>
                      <Td align="right">
                        {device.revoked ? (
                          <RevokedStamp />
                        ) : (
                          <form action={revokeDeviceAction}>
                            <input type="hidden" name="id" value={device.id} />
                            <ActionButton tone="danger" type="submit">
                              Revoke
                            </ActionButton>
                          </form>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </main>
  );
}
