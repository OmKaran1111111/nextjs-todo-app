"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./components.module.css";
import Logout from "./Logout";
import useIsDesktop from "@/hooks/useIsDesktop";

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const rowRefs = useRef({});
  const isDesktop = useIsDesktop();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => {
    if (!isPinned) setIsOpen(false);
  };

  const togglePin = () => {
    setIsPinned((prev) => !prev);
    setIsOpen(true);
  };

  const handleMouseEnter = () => {
    if (isDesktop) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isDesktop && !isPinned) setIsOpen(false);
  };

  useEffect(() => {
    if (!isDesktop) setIsPinned(false);
  }, [isDesktop]);

  const isActive = (path) => pathname === path;
  const isTaskSectionActive =
    pathname.startsWith("/tasklist") || pathname.startsWith("/addtask");

  useEffect(() => {
    if (isTaskSectionActive) setIsTaskMenuOpen(true);
  }, [isTaskSectionActive]);

  const links = [
    { path: "/", label: "Home" },
    { path: "/Dashboard", label: "DashBoard" },
  ];

  const taskMenu = {
    label: "Task",
    basePath: "/tasklist",
    children: [
      { path: "/tasklist", label: "All Tasks" },
      { path: "/addtask", label: "Add Task" },
    ],
  };

  const activeKey = isTaskSectionActive
    ? "task-menu"
    : links.find((l) => isActive(l.path))?.path;

  useEffect(() => {
    const node = rowRefs.current[activeKey];
    if (node) setIndicatorTop(node.offsetTop);
  }, [activeKey, isTaskMenuOpen]);

  useEffect(() => {
    const isSidebarActive = (isOpen || isPinned) && isDesktop;
    document.body.classList.toggle("sidebar-open", isSidebarActive);
    return () => document.body.classList.remove("sidebar-open");
  }, [isOpen, isPinned, isDesktop]);

  const hiddenRoutes = ["/login", "/sign-in", "/signup", "/sign-up"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <div>
      <header className={styles.topbarHeader}>
        <Link href="/" className={styles.wordmark}>
          Todo App
        </Link>
      </header>

      <button
        className={styles.sidebarToggle}
        onClick={toggleSidebar}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={isOpen || isPinned ? "Close menu" : "Open menu"}
      >
        <span className={styles.toggleGlyph}>{isOpen || isPinned ? "✕" : "☰"}</span>
      </button>

      <div className={styles.rightControls}>
        <ThemeToggle />
        <Link href="/tasklist" className={styles.searchButton} aria-label="Search tasks">
          🔍
        </Link>
      </div>

      <div
        className={`${styles.sidebar} ${
          isOpen || isPinned ? styles.sidebarOpen : styles.sidebarClosed
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isDesktop ? (
          <button
            className={`${styles.sidebarInnerToggle} ${isPinned ? styles.pinned : ""}`}
            onClick={togglePin}
            title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            aria-label={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
          >
            <Image
              src="./pushpin.svg"
              alt=""
              width={18}
              height={18}
              style={{
                transform: isPinned ? "rotate(-45deg)" : "none",
                transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
        ) : (
          <button className={styles.sidebarInnerToggle} onClick={toggleSidebar} aria-label="Close menu">
            {isOpen ? "✕" : "☰"}
          </button>
        )}

        <div className={styles.navRail}>
          <span
            className={styles.navIndicator}
            style={{ transform: `translateY(${indicatorTop}px)` }}
          />

          <ul className={styles.navList}>
            {links.map(({ path, label }) => (
              <li
                key={path}
                ref={(el) => (rowRefs.current[path] = el)}
                className={`${styles.navRow} ${isActive(path) ? styles.navRowActive : ""}`}
              >
                <Link
                  href={path}
                  onClick={closeSidebar}
                  className={styles.navRowLink}
                  aria-current={isActive(path) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}

            <li
              ref={(el) => (rowRefs.current["task-menu"] = el)}
              className={`${styles.navRow} ${isTaskSectionActive ? styles.navRowActive : ""}`}
            >
              <button
                className={styles.navRowToggle}
                onClick={() => setIsTaskMenuOpen((prev) => !prev)}
                aria-expanded={isTaskMenuOpen}
              >
                <span>{taskMenu.label}</span>
                <span
                  className={styles.chevron}
                  style={{ transform: isTaskMenuOpen ? "rotate(180deg)" : "none" }}
                >
                  ▾
                </span>
              </button>
            </li>

            {isTaskMenuOpen && (
              <ul className={styles.subNavList}>
                {taskMenu.children.map(({ path, label }) => (
                  <li key={path} className={styles.subNavRow}>
                    <Link
                      href={path}
                      onClick={closeSidebar}
                      className={`${styles.subNavLink} ${isActive(path) ? styles.subNavLinkActive : ""}`}
                      aria-current={isActive(path) ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ul>
        </div>

        <div className={styles.navFooter}>
          <Logout />
        </div>
      </div>

      {isOpen && !isDesktop && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export const TOPBAR_HEIGHT = 75;
export default TopBar;