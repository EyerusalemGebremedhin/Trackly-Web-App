"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("ember_theme") === "dark";
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("ember_theme", next ? "dark" : "light");
  }

  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className="text-muted hover:text-primary p-1.5">
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}