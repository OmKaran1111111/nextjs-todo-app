"use client";

import { useState, useEffect } from "react";
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
    if (isDesktop) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop && !isPinned) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isDesktop) {
      setIsPinned(false);
    }
  }, [isDesktop]);

  const isActive = (path) => pathname === path;

  const itemClass = (path) => (isActive(path) ? styles.navLinkActive : "");

  const links = [
    { path: "/", label: "Home" },
    { path: "/Dashboard", label: "DashBoard" },
    { path: "/addtask", label: "Add Task" },
    { path: "/search", label: "Search Task" },
    { path: "/tasklist", label: "Tasks" },
  ];

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
        <header className={styles.titleHeader}>
          <Link href="/">Todo App</Link>
        </header>
      </header>

      <button
        className={styles.sidebarToggle}
        onClick={toggleSidebar}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isOpen || isPinned ? "X" : "☰"}
      </button>

      <div className={styles.rightControls}>
        <ThemeToggle />
        <Link href="/search" className={styles.searchButton}>
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
            className={`${styles.sidebarInnerToggle} ${
              isPinned ? styles.pinned : ""
            }`}
            onClick={togglePin}
            title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            aria-label={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
          >
            <Image
              src="./pushpin.svg"
              alt="Pin Sidebar"
              width={20}
              height={20}
              style={{
                transform: isPinned ? "rotate(-45deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            />
          </button>
        ) : (
          <button className={styles.sidebarInnerToggle} onClick={toggleSidebar}>
            {isOpen ? "✕" : "☰"}
          </button>
        )}

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
            }}
          >
            <Logout />
          </li>
        </ul>
      </div>

      {isOpen && !isDesktop && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export const TOPBAR_HEIGHT = 75;
export default TopBar;