"use server";

import { cookies } from "next/headers";
import { LOCALES, type Locale, LOCALE_COOKIE_NAME } from "./config";

export async function setLocale(locale: Locale) {
  if (LOCALES.includes(locale)) {
    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}

