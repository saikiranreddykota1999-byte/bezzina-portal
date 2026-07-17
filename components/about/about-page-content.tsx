'use client';

import Link from 'next/link';
import { Building2, MapPin, Users, Wrench } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { defaultTransition, fadeInUp, staggerContainer } from '@/lib/motion';
import { brandClasses } from '@/lib/brand';
import {
  ABOUT_PAGE_CONTENT,
  ABOUT_STATS,
  ABOUT_TIMELINE,
  ABOUT_VALUES,
  INDUSTRIES_SERVED,
} from '@/lib/about/page-content';
import { company } from '@/config/company';

const valueIcons = [Building2, Wrench, Users, MapPin];

export function AboutPageContent() {
  const timelineRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: '-60px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <section className="relative overflow-hidden bg-white py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,61,145,0.08),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(216,161,6,0.08),transparent_40%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className={brandClasses.eyebrow}>{ABOUT_PAGE_CONTENT.eyebrow}</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#071B35] sm:text-5xl">
              {ABOUT_PAGE_CONTENT.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              {ABOUT_PAGE_CONTENT.intro}
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">{ABOUT_PAGE_CONTENT.mission}</p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_STATS.map((stat) => (
              <div key={stat.label} className={`${brandClasses.card} p-5`}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0B3D91]">
                  {stat.label}
                </p>
                <p className="mt-2 text-sm font-medium text-[#071B35]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={timelineRef}
        className="bg-[#F8FAFC] py-14 sm:py-20"
        aria-labelledby="about-timeline-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="about-timeline-title" className="text-2xl font-bold text-[#071B35] sm:text-3xl">
            Our story
          </h2>
          <motion.ol
            className="mt-10 space-y-6"
            initial="hidden"
            animate={timelineInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {ABOUT_TIMELINE.map((item) => (
              <motion.li
                key={item.year}
                variants={fadeInUp}
                transition={defaultTransition}
                className={`${brandClasses.card} flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-6`}
              >
                <span className="inline-flex h-12 min-w-[4.5rem] items-center justify-center rounded-xl bg-[#E8EFF9] text-sm font-bold text-[#0B3D91]">
                  {item.year}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#071B35]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      <section
        ref={valuesRef}
        className="py-14 sm:py-20"
        aria-labelledby="about-values-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="about-values-title" className="text-2xl font-bold text-[#071B35] sm:text-3xl">
            What we stand for
          </h2>
          <motion.div
            className="mt-10 grid gap-6 sm:grid-cols-2"
            initial="hidden"
            animate={valuesInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {ABOUT_VALUES.map((value, index) => {
              const Icon = valueIcons[index] ?? Building2;
              return (
                <motion.article
                  key={value.title}
                  variants={fadeInUp}
                  transition={defaultTransition}
                  className={`${brandClasses.card} p-6`}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#071B35]">{value.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{value.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14 sm:py-20" aria-labelledby="about-industries-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="about-industries-title" className="text-2xl font-bold text-[#071B35] sm:text-3xl">
            Industries we serve
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {INDUSTRIES_SERVED.map((industry) => (
              <article key={industry.title} className={`${brandClasses.card} p-6`}>
                <h3 className="text-lg font-semibold text-[#071B35]">{industry.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{industry.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-[#071B35] sm:text-3xl">
            Work with a supplier you can rely on
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Whether you need marine chandlery, industrial equipment, or technical guidance, our team
            is ready to help from our {company.address.city} premises.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/quote" className={brandClasses.btnPrimary}>
              Ask for quote
            </Link>
            <Link href="/contact" className={brandClasses.btnSecondary}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
