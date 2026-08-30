interface EmptyStateProps {
  title: string;
  text?: string;
  className?: string;
}

export function EmptyState({ title, text, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-[1.25rem] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-6 py-10 text-center ${className}`}
    >
      <p className="m-0 mb-1 font-bold text-[var(--color-heading)]">{title}</p>
      {text && <p className="m-0 text-[0.9rem] text-[var(--color-faint)]">{text}</p>}
    </div>
  );
}