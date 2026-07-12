'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FacebookIcon } from '@/components/icons/facebook';
import { ContactForm } from '@/components/contact/contact-form';
import { LocationMap } from '@/components/contact/location-map';
import { defaultTransition } from '@/lib/motion';

export type ContactOffice = {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
};

type Props = {
  facebookUrl: string;
  registrationNumber: string;
  mapEmbedUrl: string;
  mapsUrl: string;
  placeName: string;
  mapAddress: string;
  offices: ContactOffice[];
  businessHours?: string;
  emergencyContact?: string;
  whatsapp?: string;
};

export function ContactPageContent({
  facebookUrl,
  registrationNumber,
  mapEmbedUrl,
  mapsUrl,
  placeName,
  mapAddress,
  offices,
  businessHours,
  emergencyContact,
  whatsapp,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <main>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8A106]">
              Joseph Bezzina & Co. Ltd
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#071B35] sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              Reach our team for quotations, product enquiries, and technical assistance.
            </p>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/20 bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#1877F2] transition hover:border-[#1877F2]/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              <FacebookIcon className="h-4 w-4" />
              Follow us on Facebook
            </a>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LocationMap
            embedUrl={mapEmbedUrl}
            mapsUrl={mapsUrl}
            placeName={placeName}
            address={mapAddress}
          />
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={defaultTransition}
            className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(7,27,53,0.06)] sm:p-8"
          >
            <h2 className="text-xl font-bold text-[#071B35] sm:text-2xl">Send an enquiry</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Complete the form and our team will respond to your quotation or technical enquiry.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {offices.map((office, index) => (
              <motion.address
                key={office.name}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ ...defaultTransition, delay: index * 0.06 }}
                className="not-italic rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{office.name}</p>
                <p className="mt-4 whitespace-pre-line">{office.address}</p>
                {office.phone && (
                  <p className="mt-4">
                    <a href={`tel:${office.phone}`} className="font-medium text-[#0B3D91] hover:underline">
                      {office.phone}
                    </a>
                  </p>
                )}
                {office.email && (
                  <p className="mt-2">
                    <a href={`mailto:${office.email}`} className="font-medium text-[#0B3D91] hover:underline">
                      {office.email}
                    </a>
                  </p>
                )}
              </motion.address>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businessHours && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Business Hours</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{businessHours}</p>
              </div>
            )}
            {emergencyContact && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">Emergency Contact</h3>
                <p className="mt-2 text-sm text-slate-600">{emergencyContact}</p>
              </div>
            )}
            {whatsapp && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  className="mt-2 inline-block text-sm font-semibold text-[#0B3D91] hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Facebook</h3>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1877F2] transition hover:text-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EFF9] text-[#1877F2]">
                  <FacebookIcon className="h-4 w-4" />
                </span>
                Follow us on Facebook
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">Registration: {registrationNumber}</p>
        </div>
      </section>
    </main>
  );
}
