'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CategoryIllustration } from '@/components/home/category-illustration';
import { resolveCategoryVisual } from '@/lib/catalogue/category-visuals';
import { defaultTransition, fadeInUp } from '@/lib/motion';
import type { HomepageCategory } from '@/services/product.service';

type Props = {
  category: HomepageCategory;
  index: number;
};

export function CategoryCard({ category, index }: Props) {
  const reduceMotion = useReducedMotion();
  const visual = resolveCategoryVisual(category.slug, category.name, category.division);

  return (
    <motion.article
      variants={fadeInUp}
      transition={{ ...defaultTransition, delay: index * 0.05 }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
      className="group h-full"
    >
      <Link
        href={`/products?category=${category.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(7,27,53,0.06)] transition-shadow duration-300 hover:border-[#0B3D91]/25 hover:shadow-[0_16px_40px_rgba(11,61,145,0.14)]"
      >
        <CategoryIllustration visual={visual} name={category.name} className="h-36 shrink-0 sm:h-40" />

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[#0B3D91] sm:text-lg">
            {category.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">
            {category.description}
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B3D91]">
            Explore products
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
