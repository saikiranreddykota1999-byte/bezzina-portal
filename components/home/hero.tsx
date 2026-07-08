import Link from "next/link";
import { company } from "@/config/company";

const features = [
  {
    title: "Marine Supplies",
    description:
      "Trusted products and dependable sourcing for vessels, ports, and maritime operations across Malta.",
  },
  {
    title: "Industrial Equipment",
    description:
      "Reliable industrial solutions for engineering teams, workshops, and commercial facilities.",
  },
  {
    title: "Hardware & Fasteners",
    description:
      "Essential hardware, fittings, and fastening products to support day-to-day trade and maintenance work.",
  },
];

export function Hero() {
  return (
    <section
      className="w-full bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 text-white"
      aria-labelledby="home-hero-title"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
            Industrial & Marine Supplies
          </p>

          <h1
            id="home-hero-title"
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {company.name}
          </h1>

          <p className="mt-4 text-xl font-medium text-slate-200 sm:text-2xl">
            {company.tagline}
          </p>

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Joseph Bezzina & Co. Ltd is Malta&apos;s trusted marine and
            industrial supplier, delivering dependable products, practical
            expertise, and responsive service since {company.founded}.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Browse Products
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold text-white">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
