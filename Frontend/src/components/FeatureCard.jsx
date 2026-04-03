function FeatureCard({ feature }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
        {feature.icon}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
    </article>
  )
}

export default FeatureCard
