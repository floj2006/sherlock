import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { ClickAnalytics } from "@/components/analytics/click-analytics";
import { BookingDrawer } from "@/components/booking/booking-drawer";
import { BookingProvider } from "@/components/booking/booking-provider";
import { StickyBookBar } from "@/components/booking/sticky-book-bar";
import { BackToTopButton } from "@/components/layout/back-to-top-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { createMetadata } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${prata.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-cream">
        <BookingProvider>
          <AnalyticsScripts />
          <ClickAnalytics />
          <div className="relative flex min-h-screen flex-col">
            <div className="ambient-shell" aria-hidden="true" />
            <SiteHeader />
            <main className="relative z-10 flex-1">{children}</main>
            <SiteFooter />
            <StickyBookBar />
            <BackToTopButton />
            <BookingDrawer />
          </div>
        </BookingProvider>
      </body>
    </html>
  );
}
