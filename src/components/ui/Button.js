// Small pill-style action buttons used in table rows (Edit / Ban / Delete /
// Revoke...) plus a primary filled button for forms. All styling lives here
// so a page never needs its own CSS module for a button variant.

const ACTION_HOVER = {
  neutral: "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-info-soft)]",
  warning: "hover:border-[var(--color-warning)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-soft)]",
  success: "hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-soft)]",
  danger: "hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]",
};

export function ActionButton({ tone = "neutral", children, className = "", ...props }) {
  const Comp = props.href ? "a" : "button";
  return (
    <Comp
      className={`inline-flex cursor-pointer items-center rounded-[0.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[0.65rem] py-[0.3rem] text-[0.75rem] font-semibold text-[var(--color-body)] no-underline transition-all duration-150 ease-out ${ACTION_HOVER[tone]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function PrimaryButton({ children, className = "", href, ...props }) {
  const Comp = href ? "a" : "button";
  return (
    <Comp
      href={href}
      className={`mt-1 inline-flex cursor-pointer items-center rounded-[0.7rem] border-none bg-[var(--color-primary)] px-4 py-[0.65rem] text-[0.9rem] font-semibold text-[var(--color-primary-contrast)] no-underline transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--color-primary-hover)] active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
