import { company } from '@/config/company';

const trustItems = [
  { label: 'Established', value: `Since ${company.founded}` },
  { label: 'Registration', value: company.registrationNumber },
  { label: 'Location', value: `${company.address.city}, Malta` },
  { label: 'Support', value: company.contact.phone1 },
];

export function TrustBar() {
  return (
    <section
      aria-label="Company credentials"
      className="border-y border-slate-200 bg-[#F8FAFC]"
    >
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {trustItems.map((item) => (
          <div key={item.label} className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0B3D91]">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
