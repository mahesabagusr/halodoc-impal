function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
        {description}
      </p>
    </div>
  )
}

export default SectionHeader
