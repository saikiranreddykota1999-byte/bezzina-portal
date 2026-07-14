'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';
import { FacebookIcon } from '@/components/icons/facebook';
import { BusinessHours } from '@/components/contact/BusinessHours';
import { brandClasses } from '@/lib/brand';
import { defaultTransition } from '@/lib/motion';

type Props = {
  companyName: string;
  addressLines: string[];
  phone1: string;
  phone2: string;
  email: string;
  facebookUrl: string;
  whatsapp?: string;
  businessHours?: string;
  registrationNumber: string;
};

function ActionButton({
  href,
  label,
  icon: Icon,
  variant = 'primary',
  external = false,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'social';
  external?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const base =
    variant === 'primary'
      ? brandClasses.btnPrimary
      : variant === 'social'
        ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#1877F2] transition hover:border-[#1877F2]/50 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2'
        : brandClasses.btnSecondary;

  return (
    <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} transition={defaultTransition}>
      <Link
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${base} w-full sm:w-auto`}
        aria-label={label}
      >
        <motion.span
          whileHover={reduceMotion ? undefined : { rotate: 6 }}
          transition={defaultTransition}
          className="inline-flex"
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
        </motion.span>
        {label}
      </Link>
    </motion.div>
  );
}

export function ContactCard({
  companyName,
  addressLines,
  phone1,
  phone2,
  email,
  facebookUrl,
  whatsapp,
  businessHours,
  registrationNumber,
}: Props) {
  const reduceMotion = useReducedMotion();
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...defaultTransition, duration: 0.55 }}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      className="rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_32px_rgba(11,61,145,0.08)] sm:p-8"
      aria-labelledby="contact-card-title"
    >
      <div className="flex items-center gap-4">
        <AnimatedLogo variant="contact" hoverable priority />
        <div>
          <h2 id="contact-card-title" className="text-xl font-bold text-[#071B35]">
            {companyName}
          </h2>
          <p className="text-sm text-slate-500">Reg. {registrationNumber}</p>
        </div>
      </div>

      <address className="mt-6 space-y-1 not-italic text-sm leading-7 text-slate-700">
        {addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </address>

      <div className="mt-6 space-y-2 text-sm">
        <p>
          <a href={`tel:${phone1.replace(/\s/g, '')}`} className="font-semibold text-[#0B3D91] hover:underline">
            {phone1}
          </a>
        </p>
        <p>
          <a href={`tel:${phone2.replace(/\s/g, '')}`} className="font-semibold text-[#0B3D91] hover:underline">
            {phone2}
          </a>
        </p>
        <p>
          <a href={`mailto:${email}`} className="font-semibold text-[#0B3D91] hover:underline">
            {email}
          </a>
        </p>
      </div>

      <BusinessHours hours={businessHours} className="mt-8 border-t border-slate-100 pt-6" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <ActionButton href={`tel:${phone1.replace(/\s/g, '')}`} label="Call" icon={Phone} variant="primary" />
        <ActionButton href={`mailto:${email}`} label="Email" icon={Mail} variant="secondary" />
        {whatsappHref && (
          <ActionButton href={whatsappHref} label="WhatsApp" icon={MessageCircle} variant="secondary" external />
        )}
        <ActionButton
          href={facebookUrl}
          label="Facebook"
          icon={FacebookIcon}
          variant="social"
          external
        />
        <ActionButton href="/quote" label="Request Quote" icon={ClipboardList} variant="primary" />
      </div>
    </motion.article>
  );
}
