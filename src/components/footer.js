"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./components.module.css";

const Footer = () => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const linkClass = (path) =>
    `${styles.link} ${isActive(path) ? styles.linkActive : ""}`;

  const hiddenRoutes = ["/login", "/sign-in", "/signup", "/sign-up"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.spacer} />

      <div className={styles.centerLink}>
        <Link
          href="/tasklist"
          className={linkClass("/tasklist")}
          aria-current={isActive("/tasklist") ? "page" : undefined}
        >
          Load All Tasks
        </Link>
      </div>

      <div className={styles.rightLink}>
        <Link
          href="/addtask"
          className={linkClass("/addtask")}
          aria-current={isActive("/addtask") ? "page" : undefined}
        >
          ➕
        </Link>
      </div>
    </footer>
  );
};

export const FOOTER_HEIGHT = 70;
export default Footer;