import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, type Locale, LOCALE_COOKIE_NAME } from "./config";

export default getRequestConfig(async () => {
  let locale: Locale = DEFAULT_LOCALE;
  try {
    const cookieStore = await cookies();
    const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
    if (rawLocale && LOCALES.includes(rawLocale)) {
      locale = rawLocale;
    }
  } catch {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default,
  };
});
