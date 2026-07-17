'use client';

import { motion } from 'framer-motion';
import { FadeIn } from '@/components/motion/fade-in';
import { CategoryCard } from '@/components/home/category-card';
import { staggerContainer } from '@/lib/motion';
import type { HomepageCategory } from '@/services/product.service';

type Props = {
  categories: HomepageCategory[];
};

export function CategoriesGrid({ categories }: Props) {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="categories-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
              Product Categories
            </p>
            <h2
              id="categories-title"
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              {categories.length} specialist supply categories
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
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category, index) => (
            <CategoryCard key={category.slug} category={category} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
