import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Smile,
  Timer,
  BrainCog,
  MessageCircleHeart,
  ClipboardCheck,
  BarChart3,
  Users,
  Wind,
  Siren,
  BookOpen,
  HeartPulse,
  Home,
  Settings,
  LogOut,
  Menu,
  ListTodo,
  Check,
} from 'lucide-react'
import { useAppState, MOOD_META, localDateKey } from '../state/store.jsx'

// target fokus harian (menit) dipakai untuk menghitung skor produktivitas
const DAILY_FOCUS_GOAL_MINUTES = 240 // 4 jam

const quickLinks = [
  { to: '/mood', label: 'Mood Tracker', icon: Smile, tint: 'bg-violet-500/10 text-violet-600' },
  { to: '/fokus', label: 'Learning Readiness', icon: BrainCog, tint: 'bg-sky-500/10 text-sky-500' },
  { to: '/chat', label: 'AI Chat', icon: MessageCircleHeart, tint: 'bg-amber-400/10 text-amber-400' },
  { to: '/check-in', label: 'Check-In', icon: ClipboardCheck, tint: 'bg-rose-500/10 text-rose-500' },
  { to: '/statistik', label: 'Statistik', icon: BarChart3, tint: 'bg-emerald-500/10 text-emerald-600' },
  { to: '/community', label: 'Community', icon: Users, tint: 'bg-pink-500/10 text-pink-500' },
]

const recommendations = [
  {
    title: 'Relaksasi 4-7-8',
    meta: '5 menit',
    desc: 'Teknik pernapasan untuk menenangkan diri dan mengurangi stres',
    icon: Wind,
    prompt: 'Aku mau coba teknik relaksasi pernapasan 4-7-8. Bisa pandu aku langkah demi langkah?',
  },
  {
    title: 'Jurnal Harian',
    meta: '10 menit',
    desc: 'Tulis perasaan dan pikiran untuk refleksi diri yang lebih dalam',
    icon: BookOpen,
    prompt: 'Aku mau mulai jurnal harian. Bisa bantu aku dengan beberapa pertanyaan pemandu untuk refleksi hari ini?',
  },
  {
    title: 'Body Scan Ringan',
    meta: '7 menit',
    desc: 'Meditasi untuk menyadari ketegangan tubuh dan merilekskan otot',
    icon: HeartPulse,
    prompt: 'Aku mau coba body scan ringan untuk merilekskan tubuh. Bisa pandu aku pelan-pelan?',
  },
]

const sidebarLinks = [
  { icon: Home, label: 'Beranda', href: '/home', active: true },
  { icon: Timer, label: 'Fokus', href: '/fokus' },
  { icon: MessageCircleHeart, label: 'AI Chat', href: '/chat' },
  { icon: ClipboardCheck, label: 'Check-in', href: '/check-in' },
  { icon: BarChart3, label: 'Statistik', href: '/statistik' },
  { icon: Users, label: 'Komunitas', href: '/community' },
]

export default function HomeDesktop() {
  const { state, actions, derived } = useAppState()
  const navigate = useNavigate()
  const mood = derived.latestMood ? MOOD_META[derived.latestMood] : null
  const todayTodos = (state.todos || []).filter((t) => t.date === localDateKey(0))
  const todayTodosDone = todayTodos.filter((t) => t.done).length
  const hours = Math.floor(derived.todayFocusMinutes / 60)
  const mins = derived.todayFocusMinutes % 60
  const greeting = greetingByHour()

  // Klik "Coba" di rekomendasi -> langsung ke AI Chat dengan prompt
  // aktivitas itu sudah terisi & terkirim otomatis, tanpa perlu ngetik ulang.
  const handleTryRecommendation = (prompt) => {
    navigate('/chat', { state: { presetPrompt: prompt } })
  }

  // ── Produktivitas dihitung dari data asli: % dari target fokus harian ──
  const productivity = Math.min(
    100,
    Math.round((derived.todayFocusMinutes / DAILY_FOCUS_GOAL_MINUTES) * 100)
  )
  const productivitySubtitle =
    productivity >= 80
      ? 'Performa excellent hari ini'
      : productivity >= 40
      ? 'Progres bagus, lanjutkan!'
      : derived.todayFocusMinutes > 0
      ? 'Baru mulai, terus semangat'
      : 'Belum ada sesi fokus hari ini'
  const productivityTrend = productivity >= 40 ? 'up' : 'neutral'

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans">
      {/* top bar (khusus desktop, di mobile sudah ada topbar dari DesktopLayout) */}
      <header className="sticky top-0 z-20 hidden lg:flex border-b border-black/[0.06] bg-white/80 backdrop-blur px-8 py-4 items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Selamat datang kembali</h2>
          <p className="text-xs text-slate-400 mt-0.5">{greeting}, {state.user?.name || 'Sobat'}!</p>
        </div>
        <Link
          to="/emergency"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
          aria-label="Bantuan darurat"
        >
          <Siren size={18} />
        </Link>
      </header>

      {/* content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6 lg:space-y-8">

        {/* greeting khusus mobile */}
        <div className="lg:hidden">
          <h2 className="text-lg font-bold text-slate-800">Selamat datang kembali</h2>
          <p className="text-xs text-slate-400 mt-0.5">{greeting}, {state.user?.name || 'Sobat'}!</p>
        </div>

        {/* ──── HERO SECTION ──── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* mood card - 2 kolom di desktop */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 lg:p-8 shadow-lg">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-12 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative z-10">
              <p className="text-base lg:text-lg font-medium text-white/90">Status Harimu</p>
              <h3 className="mt-2 text-2xl lg:text-4xl font-bold text-white">
                {mood ? `${mood.label} ${mood.emoji}` : 'Bagaimana kabarmu?'}
              </h3>
              <p className="mt-3 max-w-md text-white/85 text-sm lg:text-base">
                {mood
                  ? 'Pantau kondisimu dengan check-in harian untuk hasil fokus yang maksimal.'
                  : 'Mulai hari dengan mencatat mood-mu untuk sesi fokus yang lebih efektif.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/mood"
                  className="rounded-full bg-white px-5 lg:px-6 py-2.5 lg:py-3 text-sm font-semibold text-emerald-600 shadow-lg hover:shadow-xl transition active:scale-95"
                >
                  {mood ? 'Update Mood' : 'Isi Mood Sekarang'}
                </Link>
                <Link
                  to="/statistik"
                  className="rounded-full border border-white/50 px-5 lg:px-6 py-2.5 lg:py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Lihat Progress
                </Link>
              </div>
            </div>
          </div>

          {/* stats column */}
          <div className="grid grid-cols-1 gap-3">
            <StatCardDesktop label="Focus Hari Ini" value={`${hours}j ${mins}m`} icon={Timer} color="emerald" />
            <StatCardDesktop label="Sesi Minggu Ini" value={String(derived.focusSessionCountWeek)} icon={ClipboardCheck} color="sky" />
            <StatCardDesktop label="Focus Streak" value={`${derived.streak} hari`} icon={Smile} color="violet" />
          </div>
        </section>

        {/* ──── QUICK LINKS ──── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-slate-800">Menu Cepat</h2>
            <p className="hidden sm:block text-xs text-slate-400">Akses fitur utama dengan cepat</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
            {quickLinks.map(({ to, label, icon: Icon, tint }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-2 lg:gap-3 rounded-2xl border border-black/[0.04] bg-white px-3 py-4 lg:px-5 lg:py-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition"
              >
                <span className={`flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-2xl ${tint}`}>
                  <Icon size={20} className="lg:hidden" />
                  <Icon size={24} className="hidden lg:block" />
                </span>
                <span className="text-xs lg:text-sm font-semibold text-slate-700 group-hover:text-slate-800">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ──── TO-DO PLANNER HARI INI ──── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base lg:text-lg font-bold text-slate-800">Rencana Hari Ini</h2>
              <p className="text-xs text-slate-400 mt-1">
                {todayTodos.length
                  ? `${todayTodosDone} dari ${todayTodos.length} to-do selesai`
                  : 'To-do hari ini akan muncul di sini'}
              </p>
            </div>
            <Link to="/todo" className="text-xs lg:text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              {todayTodos.length ? 'Kelola' : 'Buat to-do'}
            </Link>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.04] shadow-sm p-4 lg:p-5">
            {todayTodos.length === 0 ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ListTodo size={18} />
                </span>
                Belum ada to-do hari ini. Buat di To-Do Planner atau lewat check-in.
              </div>
            ) : (
              <ul className="space-y-2">
                {todayTodos.slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => actions.toggleTodo(t.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50 transition"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                          t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className={`text-sm ${t.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {t.text}
                      </span>
                    </button>
                  </li>
                ))}
                {todayTodos.length > 6 && (
                  <li className="px-2 pt-1 text-xs text-slate-400">+{todayTodos.length - 6} lainnya di To-Do Planner</li>
                )}
              </ul>
            )}
          </div>
        </section>

        {/* ──── MAIN STATS ──── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base lg:text-lg font-bold text-slate-800">Statistik Hari Ini</h2>
            <p className="text-xs text-slate-400 mt-1">Pantau progress belajarmu secara real-time</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCardFull label="Total Fokus" value={`${hours}j ${mins}m`} subtitle="Fokus hari ini" trend="neutral" />
            <StatCardFull label="Sesi Selesai" value={derived.focusSessionCountWeek} subtitle="Minggu ini" trend="neutral" />
            <StatCardFull label="Mood Rata-rata" value={mood?.label || '-'} subtitle="Berdasarkan mood terakhir" trend="stable" />
            <StatCardFull
              label="Produktivitas"
              value={`${productivity}%`}
              subtitle={productivitySubtitle}
              trend={productivityTrend}
            />
          </div>
        </section>

        {/* ──── RECOMMENDATIONS ──── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base lg:text-lg font-bold text-slate-800">Rekomendasi Untuk Hari Ini</h2>
            <p className="text-xs text-slate-400 mt-1">Aktivitas yang dipersonalisasi berdasarkan mood-mu</p>
          </div>
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.title} className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 rounded-2xl bg-white border border-black/[0.04] px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <r.icon size={20} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{r.title}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                  <p className="text-xs text-slate-400 mt-2">{r.meta}</p>
                </div>
                <button
                  onClick={() => handleTryRecommendation(r.prompt)}
                  className="shrink-0 self-start rounded-full bg-emerald-100 px-5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200 transition"
                >
                  Coba
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ──── FOOTER ──── */}
        <footer className="text-center py-6 text-xs text-slate-400 border-t border-black/[0.06]">
          <p>Focusync v1.0 · Supernova Team, UPI</p>
        </footer>
      </div>
    </div>
  )
}

function StatCardDesktop({ label, value, icon: Icon, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-500',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-500',
  }

  return (
    <div className="rounded-2xl bg-white border border-black/[0.04] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function StatCardFull({ label, value, subtitle, trend }) {
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'

  return (
    <div className="rounded-2xl bg-white border border-black/[0.04] p-6 shadow-sm hover:shadow-md transition">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">{subtitle}</p>
        <span className={`text-xs font-semibold ${trendColor}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      </div>
    </div>
  )
}

function greetingByHour() {
  const h = new Date().getHours()
  if (h < 11) return 'Pagi'
  if (h < 15) return 'Siang'
  if (h < 18) return 'Sore'
  return 'Malam'
}
