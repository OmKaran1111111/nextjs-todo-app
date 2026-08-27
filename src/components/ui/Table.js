export function TableWrapper({ children, className = "" }) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Table({ children, className = "" }) {
  return (
    <table className={`w-full min-w-[680px] border-collapse ${className}`}>
      {children}
    </table>
  );
}

export function Th({ children, align = "left", className = "" }) {
  return (
    <th
      className={`sticky top-0 whitespace-nowrap border-b border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3 text-[0.7rem] font-bold tracking-wide text-[var(--color-faint)] uppercase ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className = "" }) {
  return (
    <td
      className={`border-b border-[var(--color-border-soft)] px-4 py-[0.7rem] align-middle text-[0.85rem] text-[var(--color-body)] group-last:border-b-0 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}


export function rowClasses({ dimmed = false, highlighted = false } = {}) {
  return [
    "group",
    "hover:[&>td]:bg-[var(--color-surface-hover)]",
    dimmed ? "opacity-55" : "",
    highlighted ? "[&>td]:bg-[var(--color-info-soft)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
