"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!isMounted) {
    return (
      <div
        className={`w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] opacity-50 ${className}`}
      />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--color-fertigating-bg-light)] dark:hover:bg-[var(--color-fertigating-bg-dark)] shadow-xs transition-colors cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[var(--color-weather-sun)] transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--color-primary)] transition-transform duration-200" />
      )}
    </button>
  );
}
