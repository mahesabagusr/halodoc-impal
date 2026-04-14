import { useState } from 'react'

function LoginRegisterPage({ onClose }) {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1f2_0%,#ffffff_32%,#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
        >
          Kembali
        </button>

        <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          <div className="mb-6 rounded-2xl bg-slate-100 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {activeTab === 'login' ? (
            <form className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <button
                type="button"
                className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Masuk Sekarang
              </button>
              <p className="text-center text-xs text-slate-500">Lupa password? Hubungi support HaloHealth.</p>
            </form>
          ) : (
            <form className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</span>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  placeholder="Buat password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password</span>
                <input
                  type="password"
                  placeholder="Ulangi password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-400"
                />
              </label>
              <button
                type="button"
                className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Buat Akun
              </button>
              <p className="text-center text-xs text-slate-500">Dengan mendaftar, kamu setuju dengan syarat layanan.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginRegisterPage
