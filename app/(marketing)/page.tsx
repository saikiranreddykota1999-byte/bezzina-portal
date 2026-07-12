import { Suspense } from 'react';
import { Categories } from '@/components/home/categories';
import { CTA } from '@/components/home/cta';
import { Hero } from '@/components/home/hero';
import { ProductSliderSkeleton } from '@/components/home/product-slider-skeleton';
import { RandomProductsScroll } from '@/components/home/random-products-scroll';
import { Services } from '@/components/home/services';
import { WhyChoose } from '@/components/home/why-choose';
import { getHomepageSection } from '@/services/cms.service';
import type { CtaContent, HeroContent, ServicesContent, WhyChooseContent } from '@/types/cms';

export default async function Home() {
  const [heroContent, whyChooseContent, servicesContent, ctaContent] = await Promise.all([
    getHomepageSection('hero'),
    getHomepageSection('why_choose'),
    getHomepageSection('services'),
    getHomepageSection('about'),
  ]);

  return (
    <main>
      <Hero content={heroContent as Partial<HeroContent>} />
      <Suspense
        fallback={
          <section className="border-y border-slate-200 bg-slate-50 py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ProductSliderSkeleton />
            </div>
          </section>
        }
      >
        <RandomProductsScroll />
      </Suspense>
      <WhyChoose content={whyChooseContent as Partial<WhyChooseContent>} />
      <Categories />
      <Services content={servicesContent as Partial<ServicesContent>} />
      <CTA content={ctaContent as Partial<CtaContent>} />
    </main>
  );
}
