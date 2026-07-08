import Link from "next/link";

const categories = [
  {
    title: "Marine Supplies",
    description:
      "Quality products for vessel maintenance, ship chandlery, and marine operations.",
    href: "/marine",
  },
  {
    title: "Industrial Equipment",
    description:
      "Reliable equipment and technical products for workshops, plants, and trade professionals.",
    href: "/industrial",
  },
  {
    title: "Hardware & Fasteners",
    description:
      "Essential fixings, fittings, and general hardware for everyday engineering and maintenance needs.",
    href: "/products",
  },
];

export function Categories() {
  return (
    <section
      className="bg-slate-50 py-16 sm:py-20"
      aria-labelledby="categories-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Product Categories
          </p>
          <h2
            id="categories-title"
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Explore the core supply categories we support
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className="flex h-56 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 text-center"
                aria-hidden="true"
              >
                <span className="px-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Placeholder Image
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {category.description}
                </p>
                <Link
                  href={category.href}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Browse Category
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
