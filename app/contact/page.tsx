import { ContentPage } from '@/components/layout/content-page';
import { company } from '@/config/company';

export const metadata = {
  title: 'Contact | Joseph Bezzina & Co Ltd',
  description: 'Contact Joseph Bezzina & Co. Ltd for quotations and technical support.',
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Us"
      description="Reach our team for quotations, product enquiries, and technical assistance."
    >
      <address className="not-italic rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
        <p className="font-semibold text-slate-900">{company.name}</p>
        <p className="mt-4">
          {company.address.line1}
          <br />
          {company.address.city}, {company.address.postalCode}
          <br />
          {company.address.country}
        </p>
        <p className="mt-4">
          <a href={`tel:${company.contact.phone1}`} className="hover:text-slate-900">
            {company.contact.phone1}
          </a>
          <br />
          <a href={`tel:${company.contact.phone2}`} className="hover:text-slate-900">
            {company.contact.phone2}
          </a>
        </p>
        <p className="mt-4">
          <a href={`mailto:${company.contact.email}`} className="hover:text-slate-900">
            {company.contact.email}
          </a>
        </p>
        <p className="mt-4 text-slate-500">
          Registration: {company.registrationNumber}
        </p>
      </address>
    </ContentPage>
  );
}
