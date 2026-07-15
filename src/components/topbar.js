"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./components.module.css";

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isActive = (path) => pathname === path;

  const itemClass = (path) =>
    isActive(path) ? styles.navLinkActive : "";

  const links = [
    { path: "/", label: "Home" },
    { path: "/Dashboard", label: "DashBoard" },
    { path: "/addtask", label: "Add Task" },
    { path: "/search", label: "Search Task" },
    { path: "/tasklist", label: "Tasks" },
  ];

  const hiddenRoutes = ["/login", "/sign-in", "/signup", "/sign-up"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <div>
      <header className={styles.topbarHeader}>
        <header className={styles.titleHeader}>
          <Link href="/">Todo App</Link>
        </header>
      </header>

      <button className={styles.sidebarToggle} onClick={toggleSidebar}>
        {isOpen ? "✕" : "☰"}
      </button>

      <div className={styles.rightControls}>
        <ThemeToggle />
        <Link href="/search" className={styles.searchButton}>
          🔍
        </Link>
      </div>

      <div
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <button className={styles.sidebarInnerToggle} onClick={toggleSidebar}>
          {isOpen ? "✕" : "☰"}
        </button>

        <ul className={styles.navList}>
          {links.map(({ path, label }) => (
            <li key={path} className={`${styles.navLink} ${itemClass(path)}`}>
              <Link
                href={path}
                onClick={closeSidebar}
                className="block w-full h-full"
                aria-current={isActive(path) ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li
            className={styles.navLink}
            onClick={() => {
              closeSidebar();
              signOut({ redirectUrl: "/" });
            }}
          >
            Log Out
          </li>
        </ul>
      </div>

      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}
    </div>
  );
};

export const TOPBAR_HEIGHT = 75;
export default TopBar;