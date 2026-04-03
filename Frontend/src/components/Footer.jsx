function Footer() {
  return (
    <footer id="profile" className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 HaloHealth. Semua hak dilindungi.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="transition hover:text-slate-700">
            Kebijakan Privasi
          </a>
          <a href="#" className="transition hover:text-slate-700">
            Bantuan
          </a>
          <a href="#" className="transition hover:text-slate-700">
            Kontak
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
