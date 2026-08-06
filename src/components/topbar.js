"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./components.module.css";
import Logout from "./Logout";
import useIsDesktop from "@/hooks/useIsDesktop";
import { useSearch } from "@/components/SearchContext";

const TopBar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const searchInputRef = useRef(null);
  const rowRefs = useRef({});
  const isDesktop = useIsDesktop();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";
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

  const navConfig = [
    { type: "link", path: "/", label: "Home" },
    { type: "link", path: "/Dashboard", label: "DashBoard" },
    { type: "link", path: "/Devices", label: "Devices"},
    { type: "link", path: "/tasks", label: "Task" },
    ...(isAdmin ? [{ type: "link", path: "/Manage_Users", label: "Users" }] : []),
  ];

  const isGroupActive = (group) => group.children.some((child) => isActive(child.path));
  const getKey = (item) => (item.type === "group" ? item.id : item.path);

  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (id) => setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    navConfig.forEach((item) => {
      if (item.type === "group" && isGroupActive(item)) {
        setExpandedGroups((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
      }
    });
  }, [pathname]);

  const activeItem = navConfig.find((item) =>
    item.type === "group" ? isGroupActive(item) : isActive(item.path)
  );
  const activeKey = activeItem ? getKey(activeItem) : undefined;

  useEffect(() => {
    const node = rowRefs.current[activeKey];
    if (node) setIndicatorTop(node.offsetTop);
  }, [activeKey, expandedGroups]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearchIconClick = () => {
    if (isSearchOpen) {
      setSearchTerm("");
      setIsSearchOpen(false);
      return;
    }
    setIsSearchOpen(true);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

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

      {isDesktop ? (

        <div
          className={styles.sidebarHoverZone}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-hidden="true"
        />
      ) : (
        <button
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className={styles.toggleGlyph}>{isOpen ? "✕" : "☰"}</span>
        </button>
      )}

      <div className={styles.rightControls}>
        <ThemeToggle />
        <div className={styles.searchExpandWrapper}>
          {isSearchOpen && (
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => {
                if (!searchTerm.trim()) setIsSearchOpen(false);
              }}
              placeholder="Search this page..."
              className={styles.searchExpandInput}
              aria-label="Search this page"
            />
          )}
          <button
            type="button"
            className={styles.searchButton}
            aria-label={isSearchOpen ? "Close search" : "Search this page"}
            onClick={handleSearchIconClick}
          >
            {isSearchOpen && searchTerm.trim() ? "✕" : "🔍"}
          </button>
        </div>
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
            {navConfig.map((item) => {
              if (item.type === "group") {
                const expanded = !!expandedGroups[item.id];
                return (
                  <li
                    key={item.id}
                    ref={(el) => (rowRefs.current[item.id] = el)}
                    className={`${styles.navRow} ${
                      isGroupActive(item) ? styles.navRowActive : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.navRowToggle}
                      onClick={() => toggleGroup(item.id)}
                      aria-expanded={expanded}
                    >
                      <span>{item.label}</span>
                      <span
                        className={styles.chevron}
                        style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ▸
                      </span>
                    </button>

                    {expanded && (
                      <ul className={styles.subNavList}>
                        {item.children.map((child) => (
                          <li key={child.path} className={styles.subNavRow}>
                            <Link
                              href={child.path}
                              onClick={closeSidebar}
                              className={`${styles.subNavLink} ${
                                isActive(child.path) ? styles.subNavLinkActive : ""
                              }`}
                              aria-current={isActive(child.path) ? "page" : undefined}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li
                  key={item.path}
                  ref={(el) => (rowRefs.current[item.path] = el)}
                  className={`${styles.navRow} ${isActive(item.path) ? styles.navRowActive : ""}`}
                >
                  <Link
                    href={item.path}
                    onClick={closeSidebar}
                    className={styles.navRowLink}
                    aria-current={isActive(item.path) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
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