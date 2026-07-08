'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PRODUCT_CATEGORIES } from '@/config/categories';
import { FadeIn } from '@/components/motion/fade-in';
import { staggerContainer, fadeIn, defaultTransition } from '@/lib/motion';

export function Categories() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="categories-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Product Categories
            </p>
            <h2
              id="categories-title"
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              20 specialist supply categories
            </h2>
            <p className="mt-3 text-slate-600">
              From marine hand tools to custom equipment — browse our full industrial and marine range.
            </p>
          </div>
        </FadeIn>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <motion.div key={category.slug} variants={fadeIn}>
              <Link
                href={`/products?category=${category.slug}`}
                className="group block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <motion.div whileHover={{ y: -3 }} transition={defaultTransition}>
                  <h3 className="font-semibold text-slate-900 group-hover:text-orange-600">
                    {category.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{category.description}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
