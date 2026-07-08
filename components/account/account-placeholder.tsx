type Props = {
  title: string;
  description: string;
  features: string[];
};

export function AccountPlaceholder({ title, description, features }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <ul className="mt-8 space-y-2 text-sm text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
