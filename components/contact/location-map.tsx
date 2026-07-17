'use client';

import Link from 'next/link';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { defaultTransition } from '@/lib/motion';
import { company } from '@/config/company';

type Props = {
  embedUrl?: string;
  mapsUrl?: string;
  placeName?: string;
  address?: string;
};

export function LocationMap({
  embedUrl = company.maps.embedUrl,
  mapsUrl = company.maps.shortUrl,
  placeName = company.maps.placeName,
  address = `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}`,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section
      ref={ref}
      className="relative"
      aria-labelledby="location-map-title"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ ...defaultTransition, duration: 0.55 }}
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
              Visit Us
            </p>
            <h2
              id="location-map-title"
              className="mt-2 text-2xl font-bold tracking-tight text-[#071B35] sm:text-3xl"
            >
              Our Location
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              {address}
            </p>
          </div>
          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#0B3D91]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B3D91] shadow-sm transition hover:border-[#0B3D91]/40 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get Directions
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          </Link>
        </div>

        <motion.div
          className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(11,61,145,0.1)]"
          whileHover={reduceMotion ? undefined : { scale: 1.005 }}
          transition={defaultTransition}
        >
          {!isLoaded && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#F8FAFC]"
              aria-hidden="true"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EFF9] text-[#0B3D91]"
                  animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MapPin className="h-7 w-7" />
                </motion.div>
                <p className="text-sm font-medium text-slate-500">Loading map…</p>
              </div>
            </div>
          )}

          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <iframe
              title={`Map showing ${placeName}`}
              src={embedUrl}
              className={`h-full w-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setIsLoaded(true)}
            />

            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#071B35]/10 via-transparent to-transparent"
              aria-hidden="true"
            />

            <motion.div
              className="pointer-events-none absolute left-1/2 top-[42%] z-20 -translate-x-1/2 -translate-y-full"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={isInView && isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ ...defaultTransition, delay: 0.25 }}
              aria-hidden="true"
            >
              <span className="relative flex h-12 w-12 items-center justify-center">
                {!reduceMotion && (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D8A106]/40" />
                    <span className="absolute inline-flex h-10 w-10 animate-pulse rounded-full bg-[#D8A106]/25" />
                  </>
                )}
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3D91] text-white shadow-lg">
                  <MapPin className="h-5 w-5" />
                </span>
              </span>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-[#071B35]">{placeName}</p>
                <p className="text-sm text-slate-600">{address}</p>
              </div>
            </div>
            <Link
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B3D91] transition hover:text-[#09407a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
