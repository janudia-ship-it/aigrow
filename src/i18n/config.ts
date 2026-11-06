export const LOCALES = ["en", "si", "ta"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  si: { label: "සිංහල", flag: "🇱🇰" },
  ta: { label: "தமிழ்", flag: "🇱🇰" },
};

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

