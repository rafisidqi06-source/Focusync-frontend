import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../state/store.jsx'
import {
  BarChart3,
  Siren,
  BookOpen,
  Wind,
  Music,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Pencil,
  Flame,
  Clock,
  CalendarCheck,
  X,
  Send,
  Smartphone,
  Monitor,
} from 'lucide-react'

const navItems = [
  {
    icon: BarChart3,
    label: 'Statistik & Progress',
    desc: 'Lihat riwayat fokus dan suasana hatimu',
    color: 'text-emerald-600 bg-emerald-50',
    href: '/statistik',
  },
  {
    icon: Siren,
    label: 'Emergency Help',
    desc: 'Akses bantuan darurat kapan saja',
    color: 'text-rose-500 bg-rose-50',
    href: '/emergency',
  },
]

const features = [
  {
    icon: BookOpen,
    label: 'Jurnal & Refleksi',
    desc: 'Tulis perasaan & pikiranmu setiap hari',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Wind,
    label: 'Relaksasi',
    desc: 'Panduan meditasi, relaksasi & pernapasan',
    color: 'text-sky-500 bg-sky-50',
  },
  {
    icon: Music,
    label: 'Musik Fokus',
    desc: 'Playlist lo-fi untuk meningkatkan fokus',
    color: 'text-violet-500 bg-violet-50',
  },
]

function formatMinutes(totalMinutes) {
  const mins = Number.isFinite(totalMinutes) ? totalMinutes : 0
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}j ${m}m`
}

// ─── Modal Components ─────────────────────────────────────────────────────────

function JournalModal({ onClose }) {
  const { state, actions } = useAppState()
  const [journalText, setJournalText] = useState('')

  const handleSubmit = () => {
    if (journalText.trim()) {
      actions.addJournalEntry(journalText)
      setJournalText('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" /> Jurnal & Refleksi
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Tulis perasaan & pikiranmu sekarang</p>
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Aku hari ini merasa... 💭"
          className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!journalText.trim()}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <Send size={15} /> Simpan
          </button>
        </div>
        {state.journalEntries.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Jurnal Terakhir</p>
            <p className="text-sm text-slate-600 line-clamp-3">{state.journalEntries[0].text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RelaksasiModal({ onClose }) {
  const techniques = [
    {
      name: '4-7-8 Breathing',
      desc: 'Tarik napas 4 detik, tahan 7, buang 8',
      icon: '🌬️',
    },
    {
      name: 'Body Scan',
      desc: 'Relaksasi setiap bagian tubuh dari kepala ke kaki',
      icon: '🧘',
    },
    {
      name: 'Progressive Muscle',
      desc: 'Tegang & lepas otot secara bertahap',
      icon: '💪',
    },
    {
      name: 'Grounding 5-4-3-2-1',
      desc: 'Sentuh 5 benda, dengar 4 suara, cium 3 bau...',
      icon: '🌍',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Wind size={20} className="text-sky-500" /> Relaksasi & Meditasi
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Pilih teknik relaksasi yang kamu suka</p>
        <div className="space-y-2">
          {techniques.map(({ name, desc, icon }) => (
            <button
              key={name}
              onClick={onClose}
              className="w-full text-left p-4 border border-slate-200 rounded-xl hover:bg-sky-50 hover:border-sky-300 transition group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MusikModal({ onClose }) {
  const playlists = [
    { name: 'Lo-Fi Beats', duration: '3h 45m', plays: 1247 },
    { name: 'Deep Focus', duration: '2h 30m', plays: 856 },
    { name: 'Piano & Ambient', duration: '4h 12m', plays: 634 },
    { name: 'Chill Vibes', duration: '3h 20m', plays: 2103 },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Music size={20} className="text-violet-500" /> Musik Fokus
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Playlist lo-fi untuk meningkatkan fokusmu</p>
        <div className="space-y-2">
          {playlists.map(({ name, duration, plays }) => (
            <button
              key={name}
              onClick={onClose}
              className="w-full text-left p-4 border border-slate-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-600 transition">{name}</p>
                <Music size={14} className="text-violet-400" />
              </div>
              <div className="flex gap-2 text-xs text-slate-400">
                <span>⏱️ {duration}</span>
                <span>▶️ {plays.toLocaleString()} kali</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfileDesktop() {
  const [confirmReset, setConfirmReset] = useState(false)
  const { state, actions, derived } = useAppState()
  const navigate = useNavigate()

  const user = {
    name: state.user?.name || 'Sobat',
    role: 'Mahasiswa',
    avatar: (state.user?.name || 'S').charAt(0).toUpperCase(),
    streak: derived.streak ?? 0,
    totalFocus: formatMinutes(derived.totalFocusMinutes),
    sessions: state.focusSessions?.length ?? 0,
  }

  const handleReset = () => {
    actions.resetAll()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans">
      <header className="sticky top-0 z-20 hidden lg:flex border-b border-black/[0.06] bg-white/80 backdrop-blur px-8 py-4 items-center">
        <h2 className="text-base font-semibold text-slate-800">Profil</h2>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">

        {/* ── LEFT COLUMN ── */}
        <aside className="space-y-4">
          {/* avatar card */}
          <div className="rounded-2xl bg-white shadow-sm border border-black/[0.05] overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-emerald-400 to-emerald-600" />
            <div className="px-5 pb-5 -mt-10">
              <div className="flex items-end justify-between">
                <div className="h-16 w-16 rounded-2xl bg-emerald-700 flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white">
                  {user.avatar}
                </div>
                <button className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition">
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="mt-3">
                <p className="text-base font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.role}</p>
              </div>
            </div>
          </div>

          {/* mini stats */}
          <div className="rounded-2xl bg-white shadow-sm border border-black/[0.05] p-4 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ringkasan</p>
            {[
              { icon: Flame, label: 'Streak', value: `${user.streak} hari`, color: 'text-orange-500' },
              { icon: Clock, label: 'Total Fokus', value: user.totalFocus, color: 'text-emerald-600' },
              { icon: CalendarCheck, label: 'Sesi Selesai', value: `${user.sessions} sesi`, color: 'text-violet-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`${color}`}><Icon size={15} /></span>
                <span className="text-sm text-slate-500 flex-1">{label}</span>
                <span className="text-sm font-semibold text-slate-700">{value}</span>
              </div>
            ))}
          </div>

          {/* reset */}
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition"
          >
            <LogOut size={15} />
            Reset Data & Keluar
          </button>

          {confirmReset && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
              <p className="text-sm text-rose-700 font-medium">Yakin ingin reset semua data?</p>
              <p className="text-xs text-rose-500">Tindakan ini tidak bisa dibatalkan.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-xl bg-rose-500 py-2 text-xs font-semibold text-white"
                >
                  Ya, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-xl border border-rose-300 py-2 text-xs font-semibold text-rose-500"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400 pt-1">
            Focusync v1.0 · Supernova Team, UPI
          </p>
        </aside>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* section: quick nav */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navigasi
            </h2>
            <div className="space-y-2">
              {navItems.map(({ icon: Icon, label, desc, color, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 rounded-2xl bg-white border border-black/[0.05] px-5 py-4 shadow-sm hover:shadow-md transition group"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-emerald-500 transition"
                  />
                </a>
              ))}
            </div>
          </section>

          {/* section: fitur pendukung */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Fitur Pendukung Lainnya
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, desc, color }) => {
                const featureKey =
                  label === 'Jurnal & Refleksi'
                    ? 'journal'
                    : label === 'Relaksasi'
                    ? 'relaksasi'
                    : 'musik'
                return (
                  <button
                    key={label}
                    onClick={() => actions.openFeature(featureKey)}
                    className="flex items-start gap-4 rounded-2xl bg-white border border-black/[0.05] px-5 py-5 shadow-sm text-left last:odd:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition group"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* section: akun */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Akun
            </h2>
            <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm divide-y divide-slate-100">
              {[
                { icon: User, label: 'Edit Profil', desc: 'Nama, peran, dan foto' },
                { icon: Shield, label: 'Privasi & Keamanan', desc: 'Kelola data pribadimu' },
              ].map(({ icon: Icon, label, desc }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 transition" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      {state.openedFeature === 'journal' && (
        <JournalModal onClose={() => actions.closeFeature()} />
      )}
      {state.openedFeature === 'relaksasi' && (
        <RelaksasiModal onClose={() => actions.closeFeature()} />
      )}
      {state.openedFeature === 'musik' && (
        <MusikModal onClose={() => actions.closeFeature()} />
      )}
    </div>
  )
}
