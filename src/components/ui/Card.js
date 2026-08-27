export function Card({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-7 shadow-[var(--shadow-card-lg)] ${className}`}
    >
      {children}
    </div>
  );
}
