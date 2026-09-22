import React, { useMemo, useState } from 'react'
import { Check, Trash2, Plus, CalendarDays, AlertTriangle, ListTodo } from 'lucide-react'
import { useAppState, localDateKey } from '../state/store.jsx'

const PRIORITIES = {
  high:   { label: 'Tinggi', dot: 'bg-rose-500',    chip: 'bg-rose-50 text-rose-600',       order: 0 },
  medium: { label: 'Sedang', dot: 'bg-amber-400',   chip: 'bg-amber-50 text-amber-600',     order: 1 },
  low:    { label: 'Rendah', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600', order: 2 },
}

const CATEGORIES = ['Kuliah', 'Tugas', 'Organisasi', 'Pribadi']

const TABS = [
  { key: 'today',    label: 'Hari Ini' },
  { key: 'tomorrow', label: 'Besok' },
  { key: 'upcoming', label: 'Mendatang' },
  { key: 'done',     label: 'Selesai' },
]

function formatDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

function sortTodos(list) {
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const pa = PRIORITIES[a.priority || 'medium'].order
    const pb = PRIORITIES[b.priority || 'medium'].order
    if (pa !== pb) return pa - pb
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })
}

export default function TodoPlanner() {
  const { state, actions } = useAppState()
  const todos = state.todos || []
  const today = localDateKey(0)
  const tomorrow = localDateKey(1)

  // form
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [dateMode, setDateMode] = useState('today') // 'today' | 'tomorrow' | 'custom'
  const [customDate, setCustomDate] = useState('')
  const [tab, setTab] = useState('today')

  const targetDate = dateMode === 'today' ? today : dateMode === 'tomorrow' ? tomorrow : customDate
  const canAdd = text.trim().length > 0 && !!targetDate

  const handleAdd = () => {
    if (!canAdd) return
    actions.addTodos([{ text, priority, category, date: targetDate }])
    setText('')
    // arahkan ke tab yang menampilkan to-do baru
    setTab(targetDate === today ? 'today' : targetDate === tomorrow ? 'tomorrow' : 'upcoming')
  }

  const todayList = todos.filter((t) => t.date === today)
  const doneToday = todayList.filter((t) => t.done).length
  const progress = todayList.length ? Math.round((doneToday / todayList.length) * 100) : 0
  const overdue = todos.filter((t) => !t.done && t.date < today)

  const visible = useMemo(() => {
    let list
    if (tab === 'today') list = todos.filter((t) => t.date === today)
    else if (tab === 'tomorrow') list = todos.filter((t) => t.date === tomorrow)
    else if (tab === 'upcoming') list = todos.filter((t) => t.date > tomorrow)
    else list = todos.filter((t) => t.done)
    return sortTodos(list)
  }, [todos, tab, today, tomorrow])

  const countFor = (key) => {
    if (key === 'today') return todos.filter((t) => t.date === today && !t.done).length
    if (key === 'tomorrow') return todos.filter((t) => t.date === tomorrow && !t.done).length
    if (key === 'upcoming') return todos.filter((t) => t.date > tomorrow && !t.done).length
    return todos.filter((t) => t.done).length
  }

  const pill = (active, activeCls) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
      active ? activeCls : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
    }`

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5 lg:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-1 lg:mb-2">To-Do Planner</h1>
          <p className="text-sm lg:text-lg text-slate-500">Rencanakan tugasmu, atur prioritas, lalu selesaikan satu per satu</p>
        </div>

        {/* Progress hari ini */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 lg:p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-white/85">Progress Hari Ini</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-3xl font-bold">
              {doneToday}<span className="text-white/70 text-xl">/{todayList.length}</span>
            </p>
            <p className="text-sm text-white/85">
              {todayList.length === 0
                ? 'Belum ada to-do hari ini'
                : progress === 100
                ? 'Semua selesai, keren! 🎉'
                : `${progress}% selesai`}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Form buat to-do */}
        <div className="rounded-3xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <ListTodo size={18} className="text-emerald-600" /> Buat To-Do Baru
          </h2>

          <input
            value={text}
            maxLength={100}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Contoh: Kerjakan laporan praktikum"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Prioritas</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={pill(priority === key, 'border-emerald-500 bg-emerald-50 text-emerald-700')}
                >
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Kategori (opsional)</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? '' : c)}
                  className={pill(category === c, 'border-emerald-500 bg-emerald-50 text-emerald-700')}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tanggal</p>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setDateMode('today')} className={pill(dateMode === 'today', 'border-emerald-500 bg-emerald-50 text-emerald-700')}>
                Hari ini
              </button>
              <button onClick={() => setDateMode('tomorrow')} className={pill(dateMode === 'tomorrow', 'border-emerald-500 bg-emerald-50 text-emerald-700')}>
                Besok
              </button>
              <button onClick={() => setDateMode('custom')} className={pill(dateMode === 'custom', 'border-emerald-500 bg-emerald-50 text-emerald-700')}>
                <CalendarDays size={12} className="mr-1 inline" /> Pilih tanggal
              </button>
              {dateMode === 'custom' && (
                <input
                  type="date"
                  min={today}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
          >
            <Plus size={16} /> Tambah To-Do
          </button>
        </div>

        {/* Terlewat */}
        {overdue.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle size={16} /> {overdue.length} to-do terlewat
            </p>
            <ul className="mt-3 space-y-2">
              {overdue.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-700">{t.text}</span>
                  <span className="hidden sm:block text-xs text-slate-400">{formatDate(t.date)}</span>
                  <button
                    onClick={() => actions.moveTodo(t.id, today)}
                    className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition"
                  >
                    Pindah ke hari ini
                  </button>
                  <button
                    onClick={() => actions.removeTodo(t.id)}
                    aria-label="Hapus to-do"
                    className="shrink-0 text-slate-300 hover:text-rose-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs + daftar */}
        <div className="rounded-3xl bg-white border border-black/[0.05] shadow-sm p-4 lg:p-5">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                  tab === key ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                {countFor(key) > 0 && (
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                    {countFor(key)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {tab === 'done' ? 'Belum ada to-do yang selesai.' : 'Belum ada to-do di sini. Yuk tambahkan di atas 🌱'}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {visible.map((t) => {
                const pr = PRIORITIES[t.priority || 'medium']
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                    <button
                      onClick={() => actions.toggleTodo(t.id)}
                      aria-label={t.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                        t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm break-words ${t.done ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                        {t.text}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pr.chip}`}>{pr.label}</span>
                        {t.category && (
                          <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {t.category}
                          </span>
                        )}
                        {(tab === 'upcoming' || tab === 'done') && (
                          <span className="text-[10px] text-slate-400">{formatDate(t.date)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => actions.removeTodo(t.id)}
                      aria-label="Hapus to-do"
                      className="shrink-0 p-1 text-slate-300 hover:text-rose-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {tab === 'done' && visible.length > 0 && (
            <button
              onClick={() => actions.clearDoneTodos()}
              className="mt-4 w-full rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              Hapus semua yang selesai
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
