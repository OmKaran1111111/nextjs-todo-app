import type { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

interface TableWrapperProps {
  children: ReactNode;
  className?: string;
}

export function TableWrapper({ children, className = "" }: TableWrapperProps) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <table className={`w-full min-w-[680px] border-collapse ${className}`} {...props}>
      {children}
    </table>
  );
}

type Align = "left" | "right";

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: Align;
  className?: string;
}

export function Th({ children, align = "left", className = "", ...props }: ThProps) {
  return (
    <th
      className={`sticky top-0 whitespace-nowrap border-b border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3 text-[0.7rem] font-bold tracking-wide text-[var(--color-faint)] uppercase ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: Align;
  className?: string;
}

export function Td({ children, align = "left", className = "", ...props }: TdProps) {
  return (
    <td
      className={`border-b border-[var(--color-border-soft)] px-4 py-[0.7rem] align-middle text-[0.85rem] text-[var(--color-body)] group-last:border-b-0 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

interface RowClassesOptions {
  dimmed?: boolean;
  highlighted?: boolean;
}

export function rowClasses({ dimmed = false, highlighted = false }: RowClassesOptions = {}): string {
  return [
    "group",
    "hover:[&>td]:bg-[var(--color-surface-hover)]",
    dimmed ? "opacity-55" : "",
    highlighted ? "[&>td]:bg-[var(--color-info-soft)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}