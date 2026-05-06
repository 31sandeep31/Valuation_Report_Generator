import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "ocean";

const STORAGE_KEY = "valuation.theme";
const THEMES: Theme[] = ["light", "dark", "ocean"];

const NEXT: Record<Theme, Theme> = {
  light: "dark",
  dark: "ocean",
  ocean: "light",
};

const LABEL: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  ocean: "Ocean",
};

const ICON: Record<Theme, string> = {
  light: "☀",
  dark: "☽",
  ocean: "☸",
};

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (v && THEMES.includes(v)) return v;
  } catch { /* ignore */ }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(t: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = t;
}

// Apply theme immediately on module load so there's no flash
applyTheme(readTheme());

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      title={`Theme: ${LABEL[theme]} (click to cycle)`}
      onClick={() => setTheme(NEXT[theme])}
    >
      <span className="theme-icon">{ICON[theme]}</span>
      <span className="theme-label">{LABEL[theme]}</span>
    </button>
  );
}
