import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function SidePanel({ title, subtitle, closeHref = "?", children }) {
  return (
    <aside className="w-full mt-7 animate-[fadeIn_0.25s_ease-out] bg-bg-elevated rounded-2xl p-6 border border-border-strong shadow-card-lg md:w-[420px] md:shrink-0 md:mt-0 md:sticky md:top-[100px] md:max-h-[calc(100vh-130px)] md:overflow-y-auto">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-xl font-bold text-heading m-0 mb-1">{title}</h4>
          {subtitle && (
            <p className="text-sm text-faint m-0 mb-5 break-words">{subtitle}</p>
          )}
        </div>
        <Link
          href={closeHref}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-heading transition-all duration-200 cursor-pointer border-0 no-underline hover:bg-danger-soft hover:text-danger"
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </Link>
      </div>
      {children}
    </aside>
  );
}
