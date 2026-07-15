"use client";

import { useEffect, useState } from "react";

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
};

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial =
      stored || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  if (!theme) {
    return <span className={`inline-block h-9 w-9 ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center
      rounded-full border border-border bg-surface text-lg text-heading
      shadow-card backdrop-blur-md transition-all duration-200
      hover:bg-surface-hover hover:-translate-y-0.5 ${className}`}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
