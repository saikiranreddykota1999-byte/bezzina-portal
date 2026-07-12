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
      <div id="main-content" className="flex-1 pb-16 md:pb-0">{children}</div>
      <Footer />
      <MobileCtaBar />
      <CookieConsent />
    </>
  );
}
