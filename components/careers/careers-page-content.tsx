'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Briefcase, Heart, MapPin, TrendingUp } from 'lucide-react';
import { CareersContent } from '@/components/careers/CareersContent';
import { CareersHeroIllustration, CareersMiniScene } from '@/components/careers/careers-team-illustration';
import { FadeIn } from '@/components/motion/fade-in';
import { brandClasses } from '@/lib/brand';
import { defaultTransition, fadeInUp, staggerContainer } from '@/lib/motion';
import type { Vacancy } from '@/types/quote';

const BENEFITS = [
  {
    title: 'Warehouse & Operations',
    description: 'Join our Marsa team handling marine and industrial stock for customers across Malta.',
    scene: 'warehouse' as const,
    icon: MapPin,
  },
  {
    title: 'Collaborative Culture',
    description: 'Work alongside experienced colleagues in sales, sourcing, and technical support.',
    scene: 'team' as const,
    icon: Heart,
  },
  {
    title: 'Delivery & Logistics',
    description: 'Help keep local collections and deliveries running smoothly for trade customers.',
    scene: 'delivery' as const,
    icon: Briefcase,
  },
  {
    title: 'Grow With Us',
    description: 'Develop your career with a family business trusted since 1969.',
    scene: 'growth' as const,
    icon: TrendingUp,
  },
];

type Props = {
  vacancies: Vacancy[];
};

export function CareersPageContent({ vacancies }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-[#0B3D91] to-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#D8A106]/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24 lg:px-8">
          <FadeIn>
            <p className={brandClasses.eyebrow}>Joseph Bezzina & Co. Ltd</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Build your career with Malta&apos;s marine &amp; industrial supply team
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-200">
              From warehouse operations to customer support — join a family-run business that has
              served Malta since 1969.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#apply" className={brandClasses.btnPrimary}>
                Apply Now
              </a>
              <a
                href="#vacancies"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Vacancies
              </a>
            </div>
          </FadeIn>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...defaultTransition, delay: 0.15 }}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            className="overflow-hidden rounded-3xl shadow-2xl shadow-slate-950/40"
          >
            <CareersHeroIllustration className="h-full w-full" />
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className={brandClasses.eyebrow}>Why Join Us</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#071B35] sm:text-4xl">
              A workplace built on teamwork and expertise
            </h2>
          </FadeIn>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.article
                  key={benefit.title}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: index * 0.06 }}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                >
                  <CareersMiniScene scene={benefit.scene} className="h-32 w-full" />
                  <div className="p-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 font-bold text-slate-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Vacancies + Application */}
      <section id="vacancies" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <CareersContent vacancies={vacancies} />
      </section>
    </div>
  );
}
