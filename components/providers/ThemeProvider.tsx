"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Theme = "system" | "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Helper to get initial theme (runs once during initialization)
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem("theme") as Theme | null;
  return saved && ["system", "light", "dark"].includes(saved) ? saved : "system";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply dark class to html element based on theme
  const applyTheme = useCallback((currentTheme: Theme) => {
    const html = document.documentElement;
    if (currentTheme === "dark") {
      html.classList.add("dark");
    } else if (currentTheme === "light") {
      html.classList.remove("dark");
    } else {
      // System: check matchMedia
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }, []);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // Cycle through themes: system -> light -> dark -> system
  const cycleTheme = useCallback(() => {
    setTheme((current) => {
      const nextTheme: Theme = current === "system" ? "light" : current === "light" ? "dark" : "system";
      localStorage.setItem("theme", nextTheme);
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
