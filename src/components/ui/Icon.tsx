import type { ReactNode, SVGProps } from "react";

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconName =
  | "menu"
  | "close"
  | "search"
  | "sun"
  | "moon"
  | "pin"
  | "eye"
  | "pencil"
  | "trash"
  | "download"
  | "plus"
  | "calendar"
  | "check"
  | "chevronLeft"
  | "mail"
  | "lock"
  | "eyeOff";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className = "", ...props }: IconProps) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg {...base} width={size} height={size} className={className} aria-hidden="true" {...props}>
      {paths}
    </svg>
  );
}

const ICONS: Record<IconName, ReactNode> = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  pin: <><path d="M12 2v6" /><path d="M7 9h10l-1.2 5.5H8.2L7 9Z" /><path d="M12 14.5V22" /></>,
  eye: <><path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  pencil: <><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M13.5 8 16 10.5" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /><path d="M10 11v6M14 11v6" /></>,
  download: <><path d="M12 3v13" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3 6 9 7 9-7" /></>,
  lock: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.6 13.6 0 0 1-3.2 3.9M6.5 6.6C3.9 8.3 2 11 2 11s4 7 11 7a10.4 10.4 0 0 0 4.2-.9" /><path d="M9.9 10a3 3 0 0 0 4.1 4.1" /></>,
};

export default Icon;