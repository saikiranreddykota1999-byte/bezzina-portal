'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { CONTACT_IMAGES, CONTACT_MAPS } from '@/lib/contact/page-content';
import { defaultTransition } from '@/lib/motion';

type Props = {
  imageSrc?: string;
  mapsUrl?: string;
  placeName?: string;
};

export function VisitStore({
  imageSrc = CONTACT_IMAGES.storefront,
  mapsUrl = CONTACT_MAPS.location,
  placeName = 'Joseph Bezzina Co. Ltd.',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={defaultTransition}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      className="group overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(11,61,145,0.08)]"
      aria-labelledby="visit-store-title"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={imageSrc}
            alt={`${placeName} storefront in Marsa, Malta`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#071B35]/70 via-[#071B35]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 text-[#7A5C00]">
            <Store className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.15em]">Our Showroom</p>
          </div>
          <h3 id="visit-store-title" className="mt-2 text-lg font-bold text-white">
            Visit our Marsa warehouse
          </h3>
        </div>
      </div>
      <div className="p-4">
        <Link
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0B3D91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          aria-label={`View ${placeName} on Google Maps`}
        >
          View Store
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
