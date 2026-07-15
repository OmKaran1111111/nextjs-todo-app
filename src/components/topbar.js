"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navLinkClasses = `
  text-xl font-bold cursor-pointer p-[15px] rounded-2xl text-center text-heading
  bg-surface border border-border
  shadow-card
  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
  hover:-translate-y-[3px] hover:scale-[1.02] hover:bg-surface-hover
  hover:shadow-card-lg
`;

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isActive = (path) => pathname === path;

  const itemClass = (path) =>
    isActive(path) ? "!bg-accent !border-accent !text-accent-contrast" : "";

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
      <header
        className="bg-transparent px-5 py-6
        fixed top-0 left-0 w-full z-[9998] min-h-[70px] flex items-center justify-center p-5"
      >
        <header className="text-heading text-center text-[30px] font-bold -mt-2.5">
          <Link href="/">Todo App</Link>
        </header>
      </header>

      <button
        className="fixed z-[9999] py-[7px] px-[15px] bg-transparent border-none
          cursor-pointer top-[15px] left-[15px] text-heading text-[30px]"
        onClick={toggleSidebar}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div className="fixed z-[9999] flex items-center gap-2 top-[15px] right-[15px]">
        <ThemeToggle />
        <Link
          href="/search"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full
            bg-transparent border-none text-accent text-xl cursor-pointer"
        >
          🔍
        </Link>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-[260px] z-[10000] pt-20
          bg-surface-strong backdrop-blur-[30px] backdrop-saturate-[200%]
          border-r border-border shadow-card
          text-heading transition-transform duration-[400ms]
          ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className="fixed z-[101] py-[7px] px-[15px] bg-transparent border-none
          cursor-pointer top-[15px] left-[15px] text-heading text-[30px]"
          onClick={toggleSidebar}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        <ul className="list-none px-[15px] flex flex-col gap-[15px]">
          {links.map(({ path, label }) => (
            <li key={path} className={`${navLinkClasses} ${itemClass(path)}`}>
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
            className={`${navLinkClasses} cursor-pointer`}
            onClick={() => {
              closeSidebar();
              signOut({ redirectUrl: "/" });
            }}
          >
            Log Out
          </li>
        </ul>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[9996] backdrop-blur-[2px]"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};
export const TOPBAR_HEIGHT = 75;
export default TopBar;
