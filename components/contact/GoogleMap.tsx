'use client';

import Link from 'next/link';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { defaultTransition } from '@/lib/motion';
import { CONTACT_MAPS } from '@/lib/contact/page-content';

type Props = {
  embedUrl?: string;
  mapsUrl?: string;
  directionsUrl?: string;
  placeName?: string;
  address?: string;
};

export function GoogleMap({
  embedUrl = CONTACT_MAPS.embedUrl,
  mapsUrl = CONTACT_MAPS.location,
  directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=35.8757591,14.4958324`,
  placeName = 'Joseph Bezzina Co. Ltd.',
  address = '5/6 Triq Aldo Moro, Il-Marsa, MRS 9065, Malta',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section ref={ref} aria-labelledby="google-map-title">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ ...defaultTransition, duration: 0.55 }}
        className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(11,61,145,0.1)]"
      >
        <div className="border-b border-slate-100 bg-[#F8FAFC] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D8A106]">
            Find Us
          </p>
          <h2 id="google-map-title" className="mt-1 text-lg font-bold text-[#071B35]">
            {placeName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{address}</p>
        </div>

        <div className="relative aspect-[16/10] w-full">
          {!isLoaded && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#F8FAFC]"
              aria-hidden="true"
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EFF9] text-[#0B3D91]"
                animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MapPin className="h-6 w-6" />
              </motion.div>
            </div>
          )}
          <iframe
            title={`Map showing ${placeName}`}
            src={embedUrl}
            className={`h-full w-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row">
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="flex-1">
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0B3D91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              aria-label="Open Google Maps"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open Google Maps
            </Link>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="flex-1">
            <Link
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#0B3D91]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B3D91] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              aria-label="Get directions to Joseph Bezzina"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Get Directions
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
