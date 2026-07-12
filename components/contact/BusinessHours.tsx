'use client';

type Props = {
  hours?: string;
  className?: string;
};

const DEFAULT_HOURS = `Monday – Friday: 7:00 AM – 4:00 PM
Saturday: Closed
Sunday: Closed`;

export function BusinessHours({ hours, className = '' }: Props) {
  const displayHours = hours?.trim() || DEFAULT_HOURS;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0B3D91]">
        Business Hours
      </h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
        {displayHours}
      </p>
    </div>
  );
}
