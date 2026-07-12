'use client';

import { motion } from 'framer-motion';
import { company } from '@/config/company';
import { RippleButton } from '@/components/ui/ripple-button';
import { SearchBar } from '@/components/SearchBar';
import { staggerContainer, fadeIn, defaultTransition } from '@/lib/motion';
import type { HeroContent } from '@/types/cms';

const defaultFeatures = [
  {
    title: 'Marine Supplies',
    description:
      'Trusted products and dependable sourcing for vessels, ports, and maritime operations across Malta.',
  },
  {
    title: 'Industrial Equipment',
    description:
      'Reliable industrial solutions for engineering teams, workshops, and commercial facilities.',
  },
  {
    title: 'Hardware & Fasteners',
    description:
      'Essential hardware, fittings, and fastening products to support day-to-day trade and maintenance work.',
  },
];

type Props = {
  content?: Partial<HeroContent>;
};

export function Hero({ content }: Props) {
  const eyebrow = content?.eyebrow ?? 'Industrial & Marine Supplies';
  const subtitle = content?.subtitle || company.tagline;
  const body =
    content?.body ??
    `Joseph Bezzina & Co. Ltd is Malta's trusted marine and industrial supplier, delivering dependable products, practical expertise, and responsive service since ${company.founded}.`;
  const features =
    content?.features && content.features.length > 0 ? content.features : defaultFeatures;

  return (
    <section
      className="w-full bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white"
      aria-labelledby="home-hero-title"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ...defaultTransition }}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]"
          >
            {eyebrow}
          </motion.p>

          <h1
            id="home-hero-title"
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {content?.title ?? company.name}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ...defaultTransition }}
            className="mt-4 text-xl font-medium text-slate-200 sm:text-2xl"
          >
            {subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, ...defaultTransition }}
            className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg"
          >
            {body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, ...defaultTransition }}
            className="mt-8 max-w-2xl"
          >
            <SearchBar variant="hero" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...defaultTransition }}
            className="mt-6 flex flex-col gap-4 sm:flex-row"
          >
            <RippleButton href={content?.primaryButtonHref ?? '/products'} variant="secondary" className="!bg-white !text-slate-950 hover:!bg-slate-100">
              {content?.primaryButtonLabel ?? 'Browse Products'}
            </RippleButton>
            <RippleButton href={content?.secondaryButtonHref ?? '/quote'}>
              {content?.secondaryButtonLabel ?? 'Request a Quote'}
            </RippleButton>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={fadeIn}
              whileHover={{ y: -4 }}
              transition={defaultTransition}
              className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
