import Link from 'next/link';
import { ContentPage } from '@/components/layout/content-page';
import { company } from '@/config/company';

export const metadata = {
  title: 'Request a Quote | Joseph Bezzina & Co Ltd',
  description: 'Request a quotation for marine, industrial, and engineering supplies.',
};

export default function QuotePage() {
  return (
    <ContentPage
      title="Request a Quote"
      description="Send us your product list or requirements and our team will respond with pricing and availability as quickly as possible."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm font-semibold text-slate-900">Get in touch</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Email your enquiry with part numbers, quantities, and any technical
          specifications. We will prepare a quotation tailored to your needs.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={`mailto:${company.contact.email}?subject=Quote%20Request`}
            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Email {company.contact.email}
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            View Contact Details
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
