import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex bg-bg">
      <div className="hidden lg:flex lg:w-[42%] lg:flex-col lg:justify-between bg-primary text-primary-contrast px-12 py-10">
        <Link href="/" className="text-xl font-bold tracking-tight no-underline text-primary-contrast [font-family:var(--font-display)]">
          Todo
        </Link>
        <div>
          <p className="text-[1.6rem] leading-snug font-bold [font-family:var(--font-display)] max-w-xs">
            Plan the day. Trust the list.
          </p>
          <p className="mt-3 max-w-xs text-sm text-primary-contrast/75">
            Tasks, priorities, and deadlines for you and your team — all in one quiet place.
          </p>
        </div>
        <p className="text-xs text-primary-contrast/60">© {new Date().getFullYear()} Todo App</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            className="mb-8 inline-block text-lg font-bold tracking-tight text-heading no-underline lg:hidden [font-family:var(--font-display)]"
          >
            Todo
          </Link>
          <h1 className="mb-1 text-[1.5rem] font-bold text-heading [font-family:var(--font-display)]">
            {title}
          </h1>
          {subtitle && <p className="mb-7 text-sm text-muted">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}