function DoctorCard({ doctor }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 text-sm font-medium text-slate-500">
          Foto Dokter
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{doctor.name}</h3>
        <p className="text-xs text-slate-500">{doctor.specialization}</p>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
        <p>⭐ {doctor.rating}</p>
        <p>{doctor.experience}</p>
      </div>
      <button className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-300 ease-out hover:bg-red-500/10 hover:text-red-500 hover:shadow-none">
        Konsultasi Sekarang
      </button>
    </article>
  )
}

export default DoctorCard
