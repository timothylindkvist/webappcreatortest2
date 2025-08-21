"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const toggle = () => {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-theme", next);
    }
  };
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      🌓
    </button>
  );
}