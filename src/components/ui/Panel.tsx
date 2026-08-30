import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { TransitionLink } from "./TransitionLink";

interface SplitLayoutProps {
  children: ReactNode;
  className?: string;
}

export function SplitLayout({ children, className = "" }: SplitLayoutProps) {
  return (
    <div className={`flex flex-col gap-6 lg:flex-row lg:items-start ${className}`}>
      {children}
    </div>
  );
}

interface FormPanelProps {
  children: ReactNode;
  className?: string;
}

export function FormPanel({ children, className = "" }: FormPanelProps) {
  return (
    <aside
      className={`vt-panel w-full flex-shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-[100px] lg:w-[340px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto ${className}`}
    >
      {children}
    </aside>
  );
}

interface PanelHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onCloseHref?: string;
}

export function PanelHeader({ title, subtitle, onCloseHref }: PanelHeaderProps) {
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
        <TransitionLink
          href={onCloseHref}
          aria-label="Cancel edit"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-none bg-[var(--color-surface-muted)] text-[var(--color-heading)] no-underline transition-colors duration-150 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
        >
          <Icon name="close" />
        </TransitionLink>
      )}
    </div>
  );
}

interface SidePanelProps {
  children: ReactNode;
  className?: string;
}

export function SidePanel({ children, className = "" }: SidePanelProps) {
  return (
    <aside
      className={`vt-panel box-border mt-7 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 pt-5 pb-6 shadow-[var(--shadow-card)] md:mt-0 md:sticky md:top-[90px] md:w-[380px] md:max-w-[380px] md:flex-none ${className}`}
    >
      {children}
    </aside>
  );
}