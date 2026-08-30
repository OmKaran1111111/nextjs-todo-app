"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearch } from "../SearchContext";
import { Icon } from "@/components/ui/Icon";

const Footer = () => {
  const pathname = usePathname();
  const { requestAddTask } = useSearch();

  const isActive = (path: string) => pathname === path;

  const baseLinkClass =
    "block py-2 px-5 rounded-full text-base cursor-pointer self-center transition-colors duration-150 bg-transparent text-accent no-underline";
  const activeLinkClass = "bg-accent text-accent-contrast font-bold";

  const linkClass = (path: string) =>
    `${baseLinkClass} ${isActive(path) ? activeLinkClass : ""}`;

  const hiddenRoutes = ["/login", "/sign-in", "/signup", "/sign-up", "/forgot-password"];
  if (pathname && hiddenRoutes.includes(pathname)) {
    return null;
  }

  const handleAddClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/tasks") {
      e.preventDefault();
      requestAddTask();
    }
  };

  return (
    <footer className="app-footer fixed bottom-0 left-0 w-full z-[9998] min-h-[70px] flex items-center justify-between bg-transparent py-6 px-5">
      <div className="flex-1" />

      <div className="fixed z-[101] bottom-[15px] left-1/2 -translate-x-1/2">
        <Link
          href="/tasks"
          className={linkClass("/tasks")}
          aria-current={isActive("/tasks") ? "page" : undefined}
        >
          Load All Tasks
        </Link>
      </div>

      <div className="fixed z-[101] bottom-[15px] right-[15px]">
        <Link
          href="/tasks?add=1"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-card-lg no-underline transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
          aria-label="Add task"
          onClick={handleAddClick}
        >
          <Icon name="plus" size={20} />
        </Link>
      </div>
    </footer>
  );
};

export const FOOTER_HEIGHT = 70;
export default Footer;