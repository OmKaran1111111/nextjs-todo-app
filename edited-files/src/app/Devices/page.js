import { auth } from "@/auth";
import {
  getDevicesForUser,
  getAllDevicesWithOwners,
  getDeviceStatus,
} from "@/lib/devices";
import { revokeDeviceAction } from "@/app/actions";
import PageShell from "@/components/PageShell";
import styles from "./page.module.css";

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
    <PageShell fullHeight>
      {devices.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No devices yet</p>
          <p className={styles.emptyText}>
            Signed-in devices will show up here.
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {isAdmin && <th className={styles.th}>User</th>}
                <th className={styles.th}>Device &amp; Browser</th>
                <th className={styles.th}>Version</th>
                <th className={styles.th}>First Seen</th>
                <th className={styles.th}>Last Active</th>
                <th className={styles.th}>Status</th>
                <th className={`${styles.th} ${styles.textRight}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const status = getDeviceStatus(device);

                return (
                  <tr
                    key={device.id}
                    className={device.revoked ? styles.rowRevoked : ""}
                  >
                    {isAdmin && (
                      <td className={styles.td}>
                        <div className={styles.userMeta}>
                          <span className={styles.userName}>
                            {device.ownerName || "—"}
                          </span>
                          <span className={styles.userEmail}>
                            {device.ownerEmail}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className={styles.td}>{device.deviceName}</td>
                    <td className={styles.td}>
                      {device.appVersion || device.browserVersion || "—"}
                    </td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatTimestamp(device.createdAt)}
                    </td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatTimestamp(device.lastActiveAt)}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.statusBadge} ${styles[`tone_${status.tone}`]}`}
                      >
                        <span className={styles.statusDot} />
                        {status.label}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.textRight}`}>
                      {device.revoked ? (
                        <span className={styles.revokedStamp}>Revoked</span>
                      ) : (
                        <form action={revokeDeviceAction}>
                          <input type="hidden" name="id" value={device.id} />
                          <button
                            type="submit"
                            className={styles.actionBtnRevoke}
                          >
                            Revoke
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
