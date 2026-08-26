"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
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
  const permissions = session?.user?.permissions || [];
  const canManageUsers = isAdmin || permissions.includes("users:manage") || permissions.includes("users:view");
  const canManageRoles = isAdmin || permissions.includes("roles:manage");
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
    { path: "/", label: "Home" },
    { path: "/Dashboard", label: "DashBoard" },
    { path: "/Devices", label: "Devices" },
    { path: "/tasks", label: "Task" },
    ...(canManageUsers ? [{ path: "/Manage_Users", label: "Users" }] : []),
    ...(canManageRoles ? [{ path: "/Roles", label: "Roles" }] : []),
  ];

  const activeItem = navConfig.find((item) => isActive(item.path));
  const activeKey = activeItem?.path;

  useEffect(() => {
    const node = rowRefs.current[activeKey];
    if (node) setIndicatorTop(node.offsetTop);
  }, [activeKey]);

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
      <header className="fixed top-0 left-0 right-0 z-[9998] h-16 flex items-center justify-center pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto italic font-semibold text-2xl tracking-[0.01em] text-heading no-underline [font-family:var(--font-display)]"
        >
          Todo App
        </Link>
      </header>

      {isDesktop ? (
        <div
          className="fixed top-0 left-0 h-screen w-6 z-[9999]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-hidden="true"
        />
      ) : (
        <button
          className="fixed z-[9999] top-3.5 left-4 w-10 h-10 inline-flex items-center justify-center bg-transparent border-0 rounded-[10px] cursor-pointer text-heading transition-colors transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-muted hover:-translate-y-px"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className="text-xl leading-none">{isOpen ? "✕" : "☰"}</span>
        </button>
      )}

      <div className="fixed z-[9999] flex items-center gap-2 top-3.5 right-4">
        <ThemeToggle />
        <div className="flex items-center">
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
              className="h-10 w-[200px] -mr-px py-0 px-3 border border-border rounded-l-[10px] rounded-r-none bg-surface text-heading text-sm outline-none focus:border-accent transition-[width,opacity,padding] duration-200"
              aria-label="Search this page"
            />
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-transparent border-0 text-accent text-[1.1rem] cursor-pointer no-underline transition-colors transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-muted hover:-translate-y-px"
            aria-label={isSearchOpen ? "Close search" : "Search this page"}
            onClick={handleSearchIconClick}
          >
            {isSearchOpen && searchTerm.trim() ? "✕" : "🔍"}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-[260px] z-[10000] pt-20 pb-6 flex flex-col bg-surface-strong backdrop-blur-2xl [backdrop-filter:blur(24px)_saturate(180%)] border-r border-border-soft text-heading transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          isOpen || isPinned ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isDesktop ? (
          <button
            className={`absolute z-[9999] top-3.5 left-4 w-10 h-10 inline-flex items-center justify-center bg-transparent border-0 rounded-[10px] cursor-pointer text-heading transition-colors transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-muted hover:-translate-y-px ${
              isPinned ? "bg-surface-muted" : ""
            }`}
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
          <button
            className="fixed z-[9999] top-3.5 left-4 w-10 h-10 inline-flex items-center justify-center bg-transparent border-0 rounded-[10px] cursor-pointer text-heading transition-colors transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-muted hover:-translate-y-px"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        )}

        <div className="relative flex-1 px-3">
          <span
            className="absolute left-3 top-0 w-[3px] h-11 rounded-sm bg-accent transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateY(${indicatorTop}px)` }}
          />

          <ul className="list-none m-0 p-0 flex flex-col">
            {navConfig.map((item) => (
              <li
                key={item.path}
                ref={(el) => (rowRefs.current[item.path] = el)}
                className="relative"
              >
                <Link
                  href={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between w-full h-11 pl-5 font-sans text-[0.95rem] no-underline bg-transparent border-0 cursor-pointer text-left transition-colors duration-[250ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:text-heading ${
                    isActive(item.path)
                      ? "text-heading font-semibold"
                      : "text-muted font-medium"
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 px-5 border-t border-border-soft">
          <Logout />
        </div>
      </div>

      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-[9996] bg-black/30 backdrop-blur-[2px]"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export const TOPBAR_HEIGHT = 75;
export default TopBar;