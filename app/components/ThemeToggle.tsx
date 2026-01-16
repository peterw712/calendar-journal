"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null)
        : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: ThemeMode = stored ?? (prefersDark ? "dark" : "light");
    setMode(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
