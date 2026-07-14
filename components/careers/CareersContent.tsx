'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import type { Vacancy } from '@/types/quote';
import { submitJobApplication } from '@/actions/careers';
import { RippleButton } from '@/components/ui/ripple-button';
import { brandClasses } from '@/lib/brand';
import { defaultTransition } from '@/lib/motion';

const inputClass = brandClasses.input;

export function CareersContent({ vacancies }: { vacancies: Vacancy[] }) {
  const reduceMotion = useReducedMotion();
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleApplyClick(vacancyId: string) {
    setSelectedVacancy(vacancyId);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const cvForm = new FormData();
    const cv = formData.get('cv');
    if (cv instanceof File) cvForm.append('cv', cv);

    const input = {
      vacancyId: selectedVacancy ?? undefined,
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      linkedinUrl: formData.get('linkedinUrl') || undefined,
      coverLetter: formData.get('coverLetter') || undefined,
    };

    const result = await submitJobApplication(input, cvForm);
    if (result.success) {
      setSubmitted(true);
      form.reset();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  const selectedVacancyTitle = vacancies.find((v) => v.id === selectedVacancy)?.title;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={defaultTransition}
        className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-green-900">Application Received</h2>
        <p className="mt-2 text-green-800">
          Thank you for applying. Our HR team will review your application and be in touch.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSelectedVacancy(null);
          }}
          className="mt-4 text-sm font-semibold text-[#0B3D91] hover:underline"
        >
          Submit another application
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EFF9] text-[#0B3D91]">
            <Briefcase className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Current Vacancies</h2>
        </div>

        {vacancies.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">
              No open positions at the moment. Submit a general application below — we&apos;d love
              to hear from you.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {vacancies.map((vacancy, index) => (
              <motion.li
                key={vacancy.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...defaultTransition, delay: index * 0.05 }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vacancy.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {vacancy.department} · {vacancy.location}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {vacancy.short_description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyClick(vacancy.id)}
                    className="shrink-0 rounded-full bg-[#0B3D91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09407a]"
                  >
                    Apply
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section
        id="apply"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(7,27,53,0.06)] md:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900">
          {selectedVacancy ? `Apply for ${selectedVacancyTitle}` : 'General Application'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a single CV/Resume (PDF or DOC, max 5 MB). Cover letter is optional in the text
          area below.
        </p>

        <form onSubmit={handleApply} className="mt-6 space-y-4" encType="multipart/form-data">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input id="fullName" name="fullName" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone (optional)
              </label>
              <input id="phone" name="phone" type="tel" className={inputClass} />
            </div>
            <div>
              <label htmlFor="linkedinUrl" className="mb-1.5 block text-sm font-medium text-slate-700">
                LinkedIn profile
              </label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="coverLetter" className="mb-1.5 block text-sm font-medium text-slate-700">
              Cover letter (optional)
            </label>
            <textarea id="coverLetter" name="coverLetter" rows={4} className={inputClass} />
          </div>

          <div>
            <label htmlFor="cv" className="mb-1.5 block text-sm font-medium text-slate-700">
              CV / Resume (PDF or DOC, max 5 MB)
            </label>
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              required
              className="text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#E8EFF9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#0B3D91]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <RippleButton type="submit" variant="primary">
            {loading ? 'Submitting…' : 'Submit Application'}
          </RippleButton>
        </form>
      </section>
    </div>
  );
}
