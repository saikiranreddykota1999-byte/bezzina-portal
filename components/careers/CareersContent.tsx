'use client';

import { useState } from 'react';
import type { JobPosting } from '@/types/quote';
import { submitJobApplication } from '@/actions/careers';
import { RippleButton } from '@/components/ui/ripple-button';

const inputClass =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

export function CareersContent({ jobs }: { jobs: JobPosting[] }) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      jobPostingId: selectedJob ?? undefined,
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

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-xl font-bold text-green-900">Application Received</h2>
        <p className="mt-2 text-green-800">
          Thank you for applying. Our HR team will review your application and be in touch.
        </p>
        <button
          type="button"
          onClick={() => { setSubmitted(false); setSelectedJob(null); }}
          className="mt-4 text-sm font-semibold text-orange-600 hover:underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-slate-900">Current Vacancies</h2>
        {jobs.length === 0 ? (
          <p className="mt-4 text-slate-600">
            No open positions at the moment. Submit a general application below.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {job.department} · {job.location}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{job.description}</p>
                    {job.requirements && (
                      <p className="mt-2 text-sm text-slate-600">
                        <strong>Requirements:</strong> {job.requirements}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job.id)}
                    className="shrink-0 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="apply" className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          {selectedJob ? 'Apply for Position' : 'General Application'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a single CV/Resume (PDF or DOC, max 5 MB). Cover letter is optional in the text area below.
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
              <input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." className={inputClass} />
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
            <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" required className="text-sm text-slate-700" />
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <RippleButton type="submit" variant="primary">
            {loading ? 'Submitting…' : 'Submit Application'}
          </RippleButton>
        </form>
      </section>
    </div>
  );
}
