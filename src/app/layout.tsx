import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "AiGrow - Smart Agriculture",
  description: "Smart agriculture management platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            <Suspense fallback={null}>{children}</Suspense>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
