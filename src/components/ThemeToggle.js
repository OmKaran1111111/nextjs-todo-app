"use client";

import { useEffect, useState } from "react";
import styles from "./components.module.css";

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
    return <span className={`${styles.skeleton} ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`${styles.toggleBtn} ${className}`}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;