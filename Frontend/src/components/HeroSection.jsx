import { useEffect, useState } from 'react'
import heroDoctor from '../assets/hero-doctor.png'

function HeroSection() {
  const [navbarHeight, setNavbarHeight] = useState(0)

  useEffect(() => {
    const navbar = document.querySelector('header.sticky')
    if (!navbar) return undefined

    const updateNavbarHeight = () => {
      setNavbarHeight(navbar.getBoundingClientRect().height)
    }

    updateNavbarHeight()

    const resizeObserver = new ResizeObserver(updateNavbarHeight)
    resizeObserver.observe(navbar)
    window.addEventListener('resize', updateNavbarHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateNavbarHeight)
    }
  }, [])

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: `calc(100dvh - ${navbarHeight}px)` }}
    >
      <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-10 px-4 pb-0 pt-3 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-0 lg:pt-6">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Akses layanan kesehatan jadi lebih cepat, aman, dan nyaman.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Konsultasi online, tebus resep digital, dan belanja kebutuhan kesehatan
            dalam satu aplikasi dengan alur yang sederhana untuk semua usia.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-red-600 hover:shadow-none">
              Mulai Konsultasi
            </button>
            <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 ease-out hover:border-red-200 hover:bg-red-500/10 hover:text-red-500 hover:shadow-none">
              Lihat Dokter
            </button>
          </div>
        </div>

        <div className="relative flex self-end items-end justify-center overflow-hidden rounded-[2rem] px-4 pb-2 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="absolute left-4 top-6 h-32 w-32 rounded-full border-[10px] border-red-100/90" />
          <div className="absolute left-10 top-24 h-16 w-16 rounded-[1.3rem] bg-red-400/25 rotate-12 ring-8 ring-red-100/70" />
          <div className="absolute right-4 top-8 h-24 w-24 rounded-full bg-red-500/20 shadow-[0_0_0_18px_rgba(248,113,113,0.14)]" />
          <div className="absolute right-8 top-32 h-14 w-14 rounded-[1rem] bg-rose-200/80 rotate-45 ring-4 ring-rose-100/70" />
          <div className="absolute -left-6 bottom-10 h-40 w-40 rounded-full border-[16px] border-red-50/90" />
          <div className="absolute bottom-16 left-1/2 h-12 w-44 -translate-x-1/2 rounded-full bg-red-100/80" />
          <div className="absolute bottom-5 right-8 h-20 w-20 rounded-[1.5rem] border-[10px] border-rose-100/90 rotate-[-15deg]" />
          <div className="absolute left-1/2 top-14 h-10 w-24 -translate-x-1/2 rounded-full bg-red-200/70" />
          <div className="absolute left-1/3 bottom-24 h-12 w-12 rounded-full bg-rose-300/70" />
          <div className="absolute right-1/3 bottom-28 h-8 w-8 rounded-full bg-red-500/80" />
          <img
            src={heroDoctor}
            alt="Dokter Halodoc"
            className="relative z-10 mx-auto h-auto w-full max-w-md object-contain object-center sm:max-w-lg lg:max-w-xl"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
