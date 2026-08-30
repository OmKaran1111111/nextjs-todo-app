interface AvatarProps {
  initials: string;
  bg: string;
  fg: string;
  ringed?: boolean;
  className?: string;
}

export function Avatar({ initials, bg, fg, ringed = false, className = "" }: AvatarProps) {
  return (
    <span
      className={`flex h-[2.15rem] w-[2.15rem] flex-shrink-0 items-center justify-center rounded-full text-[0.72rem] font-bold tracking-wide ${
        ringed
          ? "shadow-[0_0_0_2px_var(--color-bg-elevated),0_0_0_4px_var(--color-accent)]"
          : ""
      } ${className}`}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials}
    </span>
  );
}