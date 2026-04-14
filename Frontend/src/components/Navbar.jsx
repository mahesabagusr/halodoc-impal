import { navLinks } from '../data/mockData'

function Navbar({ onLoginClick }) {
  const activePage = 'Beranda'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-sm font-bold text-white shadow-sm">
            H+
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-900">HaloHealth</p>
            <p className="text-[11px] text-slate-500">Kesehatan jadi lebih mudah</p>
          </div>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className={`nav-link rounded-full px-4 py-2 text-sm font-medium transition ${
                  link.name === activePage
                    ? 'bg-red-500 text-white shadow-sm transition-all duration-300 ease-out hover:bg-red-600 hover:shadow-none'
                    : 'nav-link--inactive text-slate-700'
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={onLoginClick}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Masuk
        </button>
      </nav>

      <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className={`nav-link whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              link.name === activePage
                ? 'bg-red-500 text-white shadow-sm transition-all duration-300 ease-out hover:bg-red-600 hover:shadow-none'
                : 'nav-link--inactive text-slate-700'
            }`}
          >
            {link.name}
          </a>
        ))}
      </div>
    </header>
  )
}

export default Navbar
