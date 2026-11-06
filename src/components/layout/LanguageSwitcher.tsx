"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { Globe } from "lucide-react";

export function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setIsOpen(false);

    if (newLocale === currentLocale) return;

    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Globe icon button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isPending}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex h-10 w-10 items-center justify-center rounded-full
          text-[var(--color-primary)]
          hover:bg-[var(--surface)]
          dark:text-[var(--color-accent-mint)]
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[var(--color-primary)]
          disabled:opacity-50"
      >
        <Globe className="h-5 w-5" />
      </button>

      {/* Language dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Available languages"
          className="absolute right-0 top-full z-50 mt-2 min-w-44
            overflow-hidden rounded-xl
            border border-[var(--border)]
            bg-[var(--surface)]
            p-1.5 shadow-lg"
        >
          {LOCALES.map((localeKey) => (
            <button
              key={localeKey}
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === localeKey}
              disabled={isPending}
              onClick={() => handleLocaleChange(localeKey)}
              className={`flex w-full items-center gap-3 rounded-lg
                px-3 py-2.5 text-left text-sm
                transition-colors
                hover:bg-[var(--border)]
                disabled:opacity-50
                ${
                  currentLocale === localeKey
                    ? "font-semibold text-[var(--color-primary)]"
                    : "text-[var(--foreground)]"
                }`}
            >
              <span className="text-base">
                {LOCALE_LABELS[localeKey].flag}
              </span>

              <span className="flex-1">
                {LOCALE_LABELS[localeKey].label}
              </span>

              {currentLocale === localeKey && (
                <span aria-hidden="true" className="text-xs">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}