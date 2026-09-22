import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  BrainCog,
  MessageCircleHeart,
  CheckSquare,
  ListTodo,
  BarChart3,
  Users,
  Settings,
  Siren,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useAppState, MOOD_META } from '../state/store.jsx'
import BottomNav from '../components/BottomNav.jsx'

const navItems = [
  { icon: Home, label: 'Beranda', path: '/', section: 'main' },
  { icon: BrainCog, label: 'Learning Readiness', path: '/fokus', section: 'main' },
  { icon: MessageCircleHeart, label: 'AI Chat', path: '/chat', section: 'main' },
  { icon: CheckSquare, label: 'Check-in', path: '/check-in', section: 'main' },
  { icon: ListTodo, label: 'To-Do Planner', path: '/todo', section: 'main' },
  { icon: BarChart3, label: 'Statistik', path: '/statistik', section: 'main' },
  { icon: Users, label: 'Community', path: '/community', section: 'main' },
]

const supportItems = [
  { icon: Siren, label: 'Emergency Help', path: '/emergency' },
  { icon: Settings, label: 'Pengaturan', path: '/profil' },
]

export default function DesktopLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, actions, derived } = useAppState()
  const mood = derived.latestMood ? MOOD_META[derived.latestMood] : null
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    const confirmed = window.confirm('Keluar dan hapus semua data lokal di perangkat ini?')
    if (!confirmed) return
    actions.resetAll()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#f0f7f4] font-sans">
      {/* ── TOPBAR MOBILE (tampil di bawah 1024px, gantikan sidebar) ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white">
            F
          </span>
          <h1 className="text-base font-bold text-emerald-600">Focusync</h1>
        </div>
        <Link
          to="/emergency"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
          aria-label="Bantuan darurat"
        >
          <Siren size={16} />
        </Link>
      </header>

      {/* ── SIDEBAR (hanya tampil di layar >= 1024px / desktop) ── */}
      <aside
        className={`hidden lg:flex border-r border-black/[0.06] bg-white shadow-sm transition-all ${
          collapsed ? 'w-20' : 'w-64'
        } flex-col`}
      >
        {/* logo */}
        <div className="border-b border-black/[0.06] px-6 py-4 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-emerald-600">Focusync</h1>
              <p className="text-[10px] text-slate-400">v1.0</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`}
            />
          </button>
        </div>

        {/* nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition group ${
                isActive(path)
                  ? 'bg-emerald-50 text-emerald-600 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* support items */}
        <div className="border-t border-black/[0.06] px-3 py-3 space-y-1">
          {supportItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${
                isActive(path)
                  ? 'bg-slate-100 text-slate-700 font-medium'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </div>

        {/* user card */}
        {!collapsed && (
          <div className="border-t border-black/[0.06] p-4">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{state.user?.name || 'Sobat'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Mahasiswa</p>
              </div>
              {mood && (
                <div className="text-xs">
                  <p className="text-slate-600 font-medium">
                    Mood: {mood.label} {mood.emoji}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-500/10 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/20 transition"
              >
                <LogOut size={12} />
                Keluar
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto pt-14 pb-20 lg:pt-0 lg:pb-0">
        {children}
      </main>

      {/* ── BOTTOM NAV (hanya tampil di layar mobile) ── */}
      <BottomNav />
    </div>
  )
}
