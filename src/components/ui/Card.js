export function Card({ children, className = "" }) {
  return (
    <div
      className={`w-full rounded-[1.25rem] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card-lg)] backdrop-blur-2xl backdrop-saturate-200 ${className}`}
    >
      {children}
    </div>
  );
}
