const TONE_TEXT = {
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  danger: "text-[var(--color-danger)]",
  info: "text-[var(--color-info)]",
  muted: "text-[var(--color-muted)]",
};

const TONE_FILLED = {
  accent: "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]",
  muted: "bg-[var(--color-surface-muted)] text-[var(--color-muted)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

export function DotBadge({ tone = "muted", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.35rem] whitespace-nowrap text-[0.78rem] font-semibold ${TONE_TEXT[tone]} ${className}`}
    >
      <span className="h-[0.4rem] w-[0.4rem] rounded-full bg-current" />
      {children}
    </span>
  );
}

export function PillBadge({ tone = "muted", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[0.6rem] py-[0.2rem] text-[0.72rem] font-semibold ${TONE_FILLED[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function RevokedStamp({ children = "Revoked", className = "" }) {
  return (
    <span
      className={`relative inline-block -rotate-[4deg] rounded-[0.2rem] border-2 border-[var(--color-danger)] px-[0.5rem] py-[0.15rem] text-[0.68rem] font-bold tracking-wide text-[var(--color-danger)] uppercase whitespace-nowrap before:absolute before:inset-[2px] before:rounded-[0.1rem] before:border before:border-[var(--color-danger)] before:opacity-50 ${className}`}
    >
      {children}
    </span>
  );
}
