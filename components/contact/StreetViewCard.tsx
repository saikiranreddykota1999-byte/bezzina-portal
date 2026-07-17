'use client';

import Link from 'next/link';
import { Compass, ExternalLink } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { CONTACT_MAPS } from '@/lib/contact/page-content';
import { defaultTransition } from '@/lib/motion';

const STREET_VIEW_EMBED =
  'https://maps.google.com/maps?q=&layer=c&cbll=35.8759081,14.495342&cbp=11,88.93,0,0,0&output=svembed';

type Props = {
  streetViewUrl?: string;
  placeName?: string;
};

export function StreetViewCard({
  streetViewUrl = CONTACT_MAPS.streetView,
  placeName = 'Joseph Bezzina Co. Ltd.',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  return (
    <motion.article
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{ ...defaultTransition, duration: 0.6 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(11,61,145,0.08)]"
      aria-labelledby="street-view-title"
    >
      <div className="border-b border-slate-100 bg-[#071B35] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <motion.span
            whileHover={reduceMotion ? undefined : { rotate: 12 }}
            transition={defaultTransition}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D8A106]/20 text-[#7A5C00]"
            aria-hidden="true"
          >
            <Compass className="h-5 w-5" />
          </motion.span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7A5C00]">
              360° Experience
            </p>
            <h3 id="street-view-title" className="text-lg font-bold">
              Visit Our Store
            </h3>
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full bg-[#E8EFF9]">
        {!embedFailed ? (
          <>
            {!isLoaded && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-[#E8EFF9]"
                aria-hidden="true"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#0B3D91]/30 text-[#0B3D91]"
                >
                  <Compass className="h-6 w-6" />
                </motion.div>
              </div>
            )}
            <iframe
              title={`360° Street View of ${placeName}`}
              src={STREET_VIEW_EMBED}
              className={`h-full w-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
              onError={() => setEmbedFailed(true)}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <Compass className="h-10 w-10 text-[#0B3D91]" aria-hidden="true" />
            <p className="text-sm text-slate-600">
              Explore our Marsa premises in immersive 360° Street View on Google Maps.
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#071B35]/85 px-3 py-1 text-xs font-bold text-[#7A5C00]">
          360°
        </div>
      </div>

      <div className="p-4">
        <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} transition={defaultTransition}>
          <Link
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#0B3D91]/20 bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#0B3D91] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            aria-label="Explore store in 360 degree Street View"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Explore in 360°
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
}
