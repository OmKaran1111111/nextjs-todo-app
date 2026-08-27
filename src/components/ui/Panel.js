import Link from "next/link";
import { Icon } from "./Icon";

// A sticky side card, e.g. the "Add / Edit" form next to a roster table.
// Use SplitLayout as the parent to get the responsive row/column switch.
export function SplitLayout({ children, className = "" }) {
  return (
    <div className={`flex flex-col gap-6 lg:flex-row lg:items-start ${className}`}>
      {children}
    </div>
  );
}

export function FormPanel({ children, className = "" }) {
  return (
    <aside
      className={`w-full flex-shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-[100px] lg:w-[340px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto ${className}`}
    >
      {children}
    </aside>
  );
}

export function PanelHeader({ title, subtitle, onCloseHref }) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h2 className="m-0 text-[1.05rem] font-bold text-[var(--color-heading)]">
          {title}
        </h2>
        {subtitle && (
          <p className="m-0 mt-[0.2rem] text-[0.85rem] break-words text-[var(--color-faint)]">
            {subtitle}
          </p>
        )}
      </div>
      {onCloseHref && (
        <Link
          href={onCloseHref}
          aria-label="Cancel edit"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-none bg-[var(--color-surface-muted)] text-[var(--color-heading)] no-underline transition-colors duration-150 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
        >
          <Icon name="close" />
        </Link>
      )}
    </div>
  );
}


export function SidePanel({ children, className = "" }) {
  return (
    <aside
      className={`box-border mt-7 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 pt-5 pb-6 shadow-[var(--shadow-card)] md:mt-0 md:sticky md:top-[90px] md:w-[380px] md:max-w-[380px] md:flex-none ${className}`}
    >
      {children}
    </aside>
  );
}
