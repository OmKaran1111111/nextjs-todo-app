"use client";

import type { ImgHTMLAttributes } from "react";
import { useIsDarkMode } from "@/hooks/useTheme";

export type IconName =
  | "menu" | "close" | "search" | "sun" | "moon" | "pin" | "eye" | "eyeOff"
  | "pencil" | "trash" | "download" | "plus" | "calendar" | "check"
  | "chevronLeft" | "mail" | "lock";

const PAIRED_ICONS: Partial<Record<IconName, { dark: string; light: string }>> = {
  menu: { dark: "/menu-dark.svg", light: "/menu-light.svg" },
  close: { dark: "/x-dark.svg", light: "/x-light.svg" },
  pencil: { dark: "/pencil-dark.svg", light: "/pencil-light.svg" },
  trash: { dark: "/trash-dark.svg", light: "/trash-light.svg" },
  download: { dark: "/download-dark.svg", light: "/download-light.svg" },
  plus: { dark: "/plus-dark.svg", light: "/plus-light.svg" },
  calendar: { dark: "/calendar-dark.svg", light: "/calendar-light.svg" },
  chevronLeft: { dark: "/square-chevron-left-dark.svg", light: "/square-chevron-left-light.svg" },
  eye: { dark:"/eye-dark.svg" ,light:"/eye-light.svg",}
};

const SINGLE_ICONS: Partial<Record<IconName, string>> = {
  search: "/search.svg", sun: "/sun.svg", moon: "/moon.svg", pin: "/pushpin.svg",
  eye: "/eye.svg", eyeOff: "/eye-off.svg", check: "/check.svg",
  mail: "/mail.svg", lock: "/lock.svg",
};

interface IconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "name"> {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className = "", ...props }: IconProps) {
  const isDark = useIsDarkMode();
  const pair = PAIRED_ICONS[name];
  const src = pair ? (isDark ? pair.dark : pair.light) : SINGLE_ICONS[name];
  if (!src) return null;
  return <img src={src} width={size} height={size} className={className} alt="" aria-hidden="true" {...props} />;
}

export default Icon;