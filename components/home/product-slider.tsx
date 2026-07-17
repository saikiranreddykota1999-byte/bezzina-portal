'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatAvailabilityLabel } from '@/lib/pricing';
import { defaultTransition } from '@/lib/motion';
import type { Product } from '@/types/product';

type ProductSliderProps = {
  products: Product[];
};

function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(1);

  useEffect(() => {
    function update() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setSlidesPerView(4);
      } else if (window.matchMedia('(min-width: 640px)').matches) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return slidesPerView;
}

function chunkProducts(products: Product[], size: number): Product[][] {
  const chunks: Product[][] = [];
  for (let i = 0; i < products.length; i += size) {
    chunks.push(products.slice(i, i + size));
  }
  return chunks;
}

function SlideCard({ product, isActive }: { product: Product; isActive: boolean }) {
  const availabilityLabel = formatAvailabilityLabel(product.availability, product.in_stock);
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1 }
          : { opacity: isActive ? 1 : 0.85, scale: isActive ? 1 : 0.96 }
      }
      transition={{ duration: reduceMotion ? 0 : 0.45, ease: defaultTransition.ease }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <Link href={`/products/${product.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-square bg-slate-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{product.sku}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
            {product.name}
          </h3>
          <p className="mt-auto pt-3 text-sm font-semibold text-orange-800">
            {availabilityLabel}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

export function ProductSlider({ products }: ProductSliderProps) {
  const reduceMotion = useReducedMotion();
  const slidesPerView = useSlidesPerView();
  const slides = useMemo(
    () => chunkProducts(products, slidesPerView),
    [products, slidesPerView],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (totalSlides === 0) return;
      const wrapped = (next + totalSlides) % totalSlides;
      setIndex(wrapped);
    },
    [totalSlides],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((current) => (current >= totalSlides ? 0 : current));
    }, 0);
    return () => clearTimeout(timer);
  }, [totalSlides]);

  useEffect(() => {
    if (reduceMotion || paused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [reduceMotion, paused, totalSlides]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 60;
    if (info.offset.x < -threshold) goTo(index + 1);
    else if (info.offset.x > threshold) goTo(index - 1);
  }

  if (products.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          style={{ touchAction: 'pan-y' }}
          animate={{ x: `-${index * 100}%` }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: defaultTransition.ease,
          }}
          drag={totalSlides > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={handleDragEnd}
        >
          {slides.map((slideProducts, slideIndex) => (
            <div
              key={`slide-${slideIndex}`}
              className="grid w-full shrink-0 gap-4"
              style={{ gridTemplateColumns: `repeat(${slidesPerView}, minmax(0, 1fr))` }}
            >
              {slideProducts.map((product) => (
                <SlideCard
                  key={product.id}
                  product={product}
                  isActive={slideIndex === index}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {totalSlides > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-md transition hover:border-orange-300 hover:text-orange-800 sm:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-md transition hover:border-orange-300 hover:text-orange-800 sm:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-1" role="tablist" aria-label="Product slides">
            {slides.map((_, dotIndex) => (
              <button
                key={`dot-${dotIndex}`}
                type="button"
                role="tab"
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-selected={dotIndex === index}
                onClick={() => goTo(dotIndex)}
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2.5 rounded-full transition-all ${
                    dotIndex === index
                      ? 'w-8 bg-orange-700'
                      : 'w-2.5 bg-slate-400 hover:bg-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
