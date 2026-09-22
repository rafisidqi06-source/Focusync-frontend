import React, { useState } from 'react'
import { useAppState } from '../state/store.jsx'
import { Loader } from 'lucide-react'

export default function AuthDesktop() {
  const { actions } = useAppState()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)

    // Animasi loading 1.5 detik, terus show welcome screen
    setTimeout(() => {
      setShowWelcome(true)
    }, 1500)

    // Masuk ke home setelah welcome 1 detik
    setTimeout(() => {
      actions.completeOnboarding({ name: trimmed })
    }, 2800)
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-[#f0f7f4] to-emerald-100 px-4">
        <div className="text-center animate-fade-in-scale">
          <div className="mb-8">
            <div className="inline-block p-6 rounded-full bg-emerald-100 mb-6 animate-bounce" style={{ animationDelay: '0s' }}>
              <div className="text-5xl">✨</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-emerald-700 mb-2">
            Selamat datang, {name}!
          </h2>
          <p className="text-slate-500 mb-8">Siap fokus dan raih target kamu? 🚀</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm text-slate-400">Membuka Focusync...</p>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f7f4] px-4">
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center rounded-3xl backdrop-blur-sm animate-fade-in z-50">
          <div className="bg-white rounded-3xl p-12 shadow-xl animate-scale-in">
            <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Mempersiapkan dashboard...</p>
          </div>
        </div>
      )}

      <div className={`w-full max-w-sm rounded-3xl bg-white border border-black/[0.06] shadow-sm p-8 transition-all duration-300 ${isLoading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-600">Focusync</h1>
          <p className="text-sm text-slate-500 mt-1">Buat profil untuk mulai menggunakan Focusync</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama kamu
            </label>
            <input
              type="text"
              autoFocus
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Sobat Fokus"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Memulai...
              </>
            ) : (
              'Mulai'
            )}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Data kamu disimpan lokal di perangkat ini, tidak dikirim ke server manapun.
        </p>
      </div>
    </div>
  )
}
