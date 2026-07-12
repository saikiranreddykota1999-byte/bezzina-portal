'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ContactCard } from '@/components/contact/ContactCard';
import { ContactForm } from '@/components/contact/contact-form';
import { GoogleMap } from '@/components/contact/GoogleMap';
import { StreetViewCard } from '@/components/contact/StreetViewCard';
import { TrustSection } from '@/components/contact/TrustSection';
import { WhyVisitStore } from '@/components/contact/WhyVisitStore';
import { VisitStore } from '@/components/contact/VisitStore';
import { defaultTransition } from '@/lib/motion';

type Props = {
  companyName: string;
  logoUrl: string;
  addressLines: string[];
  phone1: string;
  phone2: string;
  email: string;
  facebookUrl: string;
  registrationNumber: string;
  mapEmbedUrl: string;
  mapsUrl: string;
  placeName: string;
  businessHours?: string;
  whatsapp?: string;
};

export function ContactPageContent({
  companyName,
  logoUrl,
  addressLines,
  phone1,
  phone2,
  email,
  facebookUrl,
  registrationNumber,
  mapEmbedUrl,
  mapsUrl,
  placeName,
  businessHours,
  whatsapp,
}: Props) {
  const reduceMotion = useReducedMotion();
  const mapAddress = addressLines.join(', ');

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
              Visit our Marsa showroom, call our team, or send an enquiry — we make marine and
              industrial supply straightforward.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-10 sm:py-14" aria-label="Contact details and location">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <ContactCard
              companyName={companyName}
              logoUrl={logoUrl}
              addressLines={addressLines}
              phone1={phone1}
              phone2={phone2}
              email={email}
              facebookUrl={facebookUrl}
              whatsapp={whatsapp}
              businessHours={businessHours}
              registrationNumber={registrationNumber}
            />

            <div className="space-y-6">
              <GoogleMap
                embedUrl={mapEmbedUrl}
                mapsUrl={mapsUrl}
                placeName={placeName}
                address={mapAddress}
              />
              <VisitStore mapsUrl={mapsUrl} placeName={placeName} />
              <StreetViewCard placeName={placeName} />
            </div>
          </div>
        </div>
      </section>

      <WhyVisitStore />
      <TrustSection />

      <section className="bg-white py-14 sm:py-20" aria-labelledby="contact-form-title">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={defaultTransition}
            className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(7,27,53,0.06)] sm:p-8"
          >
            <h2 id="contact-form-title" className="text-xl font-bold text-[#071B35] sm:text-2xl">
              Send an enquiry
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Complete the form and our team will respond to your quotation or technical enquiry.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
