import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Timer, MessageCircleHeart, ClipboardCheck, ListTodo, UserRound } from 'lucide-react'

const items = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/fokus', label: 'Fokus', icon: Timer },
  { to: '/chat', label: 'AI Chat', icon: MessageCircleHeart },
  { to: '/check-in', label: 'Check-in', icon: ClipboardCheck },
  { to: '/todo', label: 'To-Do', icon: ListTodo },
  { to: '/profil', label: 'Profil', icon: UserRound },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur-lg lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-between">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      isActive ? 'bg-emerald-100' : ''
                    }`}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
