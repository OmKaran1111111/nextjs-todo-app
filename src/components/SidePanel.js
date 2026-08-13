import Link from "next/link";
import styles from "./components.module.css";

export default function SidePanel({ title, subtitle, closeHref = "?", children }) {
  return (
    <aside className={styles.sidePanel}>
      <div className={styles.sidePanelHeader}>
        <div>
          <h4 className={styles.sidePanelTitle}>{title}</h4>
          {subtitle && <p className={styles.sidePanelSubtitle}>{subtitle}</p>}
        </div>
        <Link href={closeHref} className={styles.closeBtn} aria-label="Close">
          ✕
        </Link>
      </div>
      {children}
    </aside>
  );
}
