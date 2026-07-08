const services = [
  {
    title: "Marine Chandlery",
    description:
      "Essential marine consumables, equipment, and supply support for vessels and maritime operators.",
  },
  {
    title: "Steel & Metal Stock",
    description:
      "Practical sourcing for steel, metals, and related materials used in fabrication and maintenance.",
  },
  {
    title: "Engineering Supplies",
    description:
      "A broad range of technical products to support workshops, industrial teams, and repair work.",
  },
  {
    title: "Bulk Industrial Orders",
    description:
      "Dependable support for higher-volume purchasing requirements with responsive quotation turnaround.",
  },
];

export function Services() {
  return (
    <section
      className="bg-white py-16 sm:py-20"
      aria-labelledby="services-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Services
          </p>
          <h2
            id="services-title"
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Supply services tailored to marine and industrial customers
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
