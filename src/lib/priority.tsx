export type Tone = "danger" | "warning" | "info" | "muted";

export interface Priority {
  id: number;
  label: string;
  shortLabel: string;
  tone: Tone;
}

export const PRIORITIES: Priority[] = [
  { id: 1, label: "Priority 1", shortLabel: "P1 · Urgent", tone: "danger" },
  { id: 2, label: "Priority 2", shortLabel: "P2 · High", tone: "warning" },
  { id: 3, label: "Priority 3", shortLabel: "P3 · Medium", tone: "info" },
  { id: 4, label: "No priority", shortLabel: "No priority", tone: "muted" },
];

export function getPriority(id: number): Priority {
  return PRIORITIES.find((p) => p.id === id) || PRIORITIES[3];
}

export const TONE_DOT: Record<Tone, string> = {
  danger: "bg-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]",
  info: "bg-[var(--color-info)]",
  muted: "bg-[var(--color-faint)]",
};

export const TONE_TEXT: Record<Tone, string> = {
  danger: "text-[var(--color-danger)]",
  warning: "text-[var(--color-warning)]",
  info: "text-[var(--color-info)]",
  muted: "text-[var(--color-faint)]",
};

export const TONE_BADGE: Record<Tone, string> = {
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
  muted: "bg-[var(--color-surface-muted)] text-[var(--color-faint)]",
};

export interface PriorityDotProps {
  tone: Tone;
  className?: string;
}

export function PriorityDot({ tone, className = "" }: PriorityDotProps) {
  return <span className={`inline-block h-2 w-2 rounded-full ${TONE_DOT[tone]} ${className}`} />;
}