import { CLIENT_LOGOS, TESTIMONIALS } from '@/lib/home/testimonials-content';
import { FadeIn } from '@/components/motion/fade-in';

export function Testimonials() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A5C00]">
              Trusted locally
            </p>
            <h2
              id="testimonials-title"
              className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Supporting marine and industrial teams across Malta
            </h2>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.role}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <p className="text-sm leading-7 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 border-t border-slate-200 pt-4">
                <cite className="not-italic">
                  <span className="block text-sm font-semibold text-slate-900">{item.role}</span>
                  <span className="text-xs text-slate-500">{item.industry}</span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-6 py-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0B3D91]">
            Industries we serve
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {CLIENT_LOGOS.map((label) => (
              <li
                key={label}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
