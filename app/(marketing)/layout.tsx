import { AskBezzinaWidget } from "@/components/ask-bezzina/ask-bezzina-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { CookieConsent } from "@/components/legal/cookie-consent";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-16 md:pb-0 outline-none">
        {children}
      </main>
      <Footer />
      <MobileCtaBar />
      <AskBezzinaWidget />
      <CookieConsent />
    </>
  );
}
