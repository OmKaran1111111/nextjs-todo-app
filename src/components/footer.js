"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const linkClass = (path) =>
    `block py-2 px-5 rounded-full text-base cursor-pointer self-center transition-colors ${
      isActive(path)
        ? "bg-accent text-accent-contrast font-bold"
        : "bg-transparent text-accent"
    }`;

  const hiddenRoutes = ["/login", "/sign-in", "/signup", "/sign-up"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <footer
      className="fixed bottom-0 left-0 w-full z-[9998] min-h-[70px] flex items-center justify-between bg-transparent px-5 py-6"
    >
      <div className="flex-1" />

      <div className="fixed z-[101] bottom-[15px] left-1/2 -translate-x-1/2">
        <Link
          href="/tasklist"
          className={linkClass("/tasklist")}
          aria-current={isActive("/tasklist") ? "page" : undefined}
        >
          Load All Tasks
        </Link>
      </div>

      <div className="fixed z-[101] bottom-[15px] right-[15px] text-[30px]">
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
