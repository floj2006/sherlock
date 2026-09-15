import type { Metadata } from "next";
import localFont from "next/font/local";
import { BusinessProvider } from "@/components/layout/business-provider";
import { getBusinessProfile } from "@/lib/business-profile";
import { AnalyticsGate } from "@/components/analytics/analytics-gate";
import { ClickAnalytics } from "@/components/analytics/click-analytics";
import { StickyBookBar } from "@/components/booking/sticky-book-bar";
import { BackToTopButton } from "@/components/layout/back-to-top-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { createMetadata } from "@/lib/seo";
import "./globals.css";
import "./editorial.css";
import "./portfolio.css";
import "./booking.css";
import "./refinements.css";
import "./account.css";
import "./masters.css";

const cormorant = localFont({ src: "./fonts/CormorantSC-Regular.ttf", variable: "--font-cormorant", weight: "400", style: "normal", display: "swap" });

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-cream">
        <BusinessProvider value={getBusinessProfile()}>
          <AnalyticsGate />
          <ClickAnalytics />
          <div className="relative flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">Перейти к содержимому</a>
            <SiteHeader />
            <noscript><div className="section-shell pt-24"><a href="/book" className="inline-block rounded-full bg-metal px-5 py-3 text-ink">Открыть календарь записи</a></div></noscript>
            <main id="main-content" tabIndex={-1} className="relative z-10 flex-1">{children}</main>
            <SiteFooter />
            <StickyBookBar />
            <BackToTopButton />
          </div>
        </BusinessProvider>
      </body>
    </html>
  );
}
