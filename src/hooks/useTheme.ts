"use client";
import { useEffect, useState } from "react";

type ThemeSubscriber = (isDark: boolean) => void;
let currentIsDark = false;
let observer: MutationObserver | null = null;
const subscribers = new Set<ThemeSubscriber>();

function ensureObserver() {
  if (observer || typeof document === "undefined") return;
  const root = document.documentElement;
  currentIsDark = root.classList.contains("dark");
  observer = new MutationObserver(() => {
    const next = root.classList.contains("dark");
    if (next !== currentIsDark) {
      currentIsDark = next;
      subscribers.forEach((notify) => notify(currentIsDark));
    }
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
}

export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(currentIsDark);
  useEffect(() => {
    ensureObserver();
    setIsDark(currentIsDark);
    subscribers.add(setIsDark);
    return () => { subscribers.delete(setIsDark); };
  }, []);
  return isDark;
}