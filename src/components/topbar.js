"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinkClasses = `
  text-xl font-bold cursor-pointer p-[15px] rounded-[14px] text-center
  bg-white/18 border border-white/40
  shadow-[0_4px_10px_rgba(0,0,0,0.03),inset_1px_1px_1px_rgba(255,255,255,0.6)]
  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
  hover:-translate-y-[3px] hover:scale-[1.02] hover:bg-white/35
  hover:shadow-[0_10px_20px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.8)]
`;

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isActive = (path) => pathname === path;

  const itemClass = (path) =>
    isActive(path) ? "!bg-[#8a5a5a] !border-[#8a5a5a] !text-white" : "";

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
        className={`
      bg-transparent px-5 py-6
      fixed top-0 left-0 w-full z-[9998] min-h-[70px] flex items-center justify-center p-5`}
      >
        <header
          style={{ marginTop: "-10px" }}
          className={`text-[beige] text-center
          text-[30px] font-bold`}
        >
          <Link href="/">Todo App</Link>
        </header>
      </header>

      <button
        className={`fixed z-[9999] py-[7px] px-[15px] bg-transparent border-none
          cursor-pointer top-[15px] left-[15px] text-white text-[30px]`}
        onClick={toggleSidebar}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div
        className={`fixed z-[9999] py-[7px] px-[15px] bg-transparent border-none
          cursor-pointer top-[15px] right-[15px] text-[30px]`}
      >
        <Link
          href="/search"
          className={`bg-transparent border-none text-[#edcccc] py-2 px-5
            text-base cursor-pointer self-center`}
        >
          🔍
        </Link>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[260px] z-[10000] pt-20
          bg-white/25 backdrop-blur-[30px] backdrop-saturate-[200%]
          border-r border-white/45 shadow-[5px_0_25px_rgba(0,0,0,0.05)]
          text-[#1d1d1f] transition-transform duration-[400ms]
          ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          className={`fixed z-[101] py-[7px] px-[15px] bg-transparent border-none
          cursor-pointer top-[15px] left-[15px] text-white text-[30px]`}
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
            className={navLinkClasses}
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
          className="fixed inset-0 bg-transparent z-[9996] backdrop-blur-[2px]"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};
export const TOPBAR_HEIGHT = 75;
export default TopBar;