import React, { useMemo, useState } from 'react'
import { TrendingUp, Award, BarChart3, PieChart } from 'lucide-react'
import { useAppState, MOOD_META } from '../state/store.jsx'

function formatMinutes(totalMinutes) {
  const safe = Number.isFinite(totalMinutes) ? totalMinutes : 0
  const h = Math.floor(safe / 60)
  const m = Math.round(safe % 60)
  return `${h}j ${m}m`
}

function sumMinutes(sessions) {
  return sessions.reduce((sum, s) => sum + (Number.isFinite(s.minutes) ? s.minutes : 0), 0)
}

// Kumpulkan waktu fokus per hari untuk N hari terakhir (kronologis, lama -> baru)
function buildDailyBuckets(focusSessions, days) {
  const today = new Date()
  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const daySessions = focusSessions.filter((s) => s.date.slice(0, 10) === key)
    buckets.push({
      key,
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      minutes: sumMinutes(daySessions),
      sessionCount: daySessions.length,
    })
  }
  return buckets
}

// Kumpulkan waktu fokus per minggu untuk 4 minggu terakhir
function buildWeeklyBuckets(focusSessions, weeksCount = 4) {
  const today = new Date()
  const buckets = []
  for (let w = weeksCount - 1; w >= 0; w--) {
    let minutes = 0
    let sessionCount = 0
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d
      const dt = new Date(today)
      dt.setDate(dt.getDate() - dayOffset)
      const key = dt.toISOString().slice(0, 10)
      const daySessions = focusSessions.filter((s) => s.date.slice(0, 10) === key)
      minutes += sumMinutes(daySessions)
      sessionCount += daySessions.length
    }
    buckets.push({ key: `w${w}`, label: `Minggu ${weeksCount - w}`, minutes, sessionCount })
  }
  return buckets
}

// Kumpulkan waktu fokus per bulan untuk 12 bulan terakhir
function buildMonthlyBuckets(focusSessions, monthsCount = 12) {
  const today = new Date()
  const buckets = []
  for (let m = monthsCount - 1; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthSessions = focusSessions.filter((s) => s.date.slice(0, 7) === monthKey)
    buckets.push({
      key: monthKey,
      label: d.toLocaleDateString('id-ID', { month: 'short' }),
      minutes: sumMinutes(monthSessions),
      sessionCount: monthSessions.length,
    })
  }
  return buckets
}

// Distribusi mood (persentase) dalam N hari terakhir
function buildMoodDistribution(moods, days) {
  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  cutoff.setHours(0, 0, 0, 0)

  const inPeriod = moods.filter((m) => new Date(m.date) >= cutoff)
  const counts = {}
  Object.keys(MOOD_META).forEach((k) => (counts[k] = 0))
  inPeriod.forEach((m) => {
    if (counts[m.mood] !== undefined) counts[m.mood] += 1
  })

  const total = inPeriod.length
  const percentages = {}
  Object.keys(MOOD_META).forEach((k) => {
    percentages[k] = total ? Math.round((counts[k] / total) * 100) : 0
  })
  return { percentages, total }
}

// Emoji mood representatif untuk 1 hari tertentu (ambil entry terbaru hari itu)
function getDayMoodEmoji(moods, dateKey) {
  const dayMoods = moods.filter((m) => m.date.slice(0, 10) === dateKey)
  if (!dayMoods.length) return null
  const latest = dayMoods[0] // moods disimpan terbaru di depan
  return MOOD_META[latest.mood]?.emoji || null
}

const WEEKLY_TARGET_MINUTES = 10 * 60 // asumsi target 10 jam/minggu, belum ada fitur set target sendiri

export default function StatistikDesktop() {
  const { state, derived } = useAppState()
  const [period, setPeriod] = useState('week') // 'week' | 'month' | 'year'

  const daily7 = useMemo(() => buildDailyBuckets(state.focusSessions, 7), [state.focusSessions])
  const weekly4 = useMemo(() => buildWeeklyBuckets(state.focusSessions, 4), [state.focusSessions])
  const monthly12 = useMemo(() => buildMonthlyBuckets(state.focusSessions, 12), [state.focusSessions])

  const chartBuckets = period === 'week' ? daily7 : period === 'month' ? weekly4 : monthly12
  const chartMaxMinutes = Math.max(1, ...chartBuckets.map((b) => b.minutes))

  const moodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365
  const moodDist = useMemo(
    () => buildMoodDistribution(state.moods, moodDays),
    [state.moods, moodDays]
  )

  // Konsistensi bulan ini: persentase hari (dari 30 hari terakhir) yang ada minimal 1 sesi fokus
  const consistencyPct = useMemo(() => {
    const last30 = buildDailyBuckets(state.focusSessions, 30)
    const activeDays = last30.filter((b) => b.minutes > 0).length
    return Math.round((activeDays / 30) * 100)
  }, [state.focusSessions])

  const stats = [
    { label: 'Total Fokus', value: formatMinutes(derived.totalFocusMinutes), icon: BarChart3, color: 'text-blue-600' },
    { label: 'Rata-rata per Hari', value: formatMinutes(derived.avgFocusMinutesPerDay), icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Konsistensi Bulan Ini', value: `${consistencyPct}%`, icon: Award, color: 'text-amber-600' },
  ]

  // Top days/weeks/months berdasarkan tab aktif
  const topItems = useMemo(() => {
    return [...chartBuckets]
      .filter((b) => b.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3)
  }, [chartBuckets])

  const topTitle = period === 'week' ? 'Hari-hari Terbaik' : period === 'month' ? 'Minggu Terbaik' : 'Bulan Terbaik'

  // Ringkasan minggu ini (selalu 7 hari terakhir, tidak tergantung tab)
  const weekMinutes = sumMinutes(state.focusSessions.filter((s) => {
    const d = new Date(s.date)
    return (new Date() - d) / (1000 * 60 * 60 * 24) <= 7
  }))
  const prevWeekMinutes = sumMinutes(state.focusSessions.filter((s) => {
    const diffDays = (new Date() - new Date(s.date)) / (1000 * 60 * 60 * 24)
    return diffDays > 7 && diffDays <= 14
  }))
  const productiveDays = daily7.filter((b) => b.minutes > 0).length
  const pctChange = prevWeekMinutes > 0
    ? Math.round(((weekMinutes - prevWeekMinutes) / prevWeekMinutes) * 100)
    : (weekMinutes > 0 ? 100 : 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-1 lg:mb-2">Statistik & Progress</h1>
            <p className="text-sm lg:text-lg text-slate-500">Analisis detail performa fokus dan moodmu</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Minggu', value: 'week' },
              { label: 'Bulan', value: 'month' },
              { label: 'Tahun', value: 'year' },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6">
              <div className="flex items-start justify-between mb-4">
                <span className={`p-3 rounded-xl bg-slate-100 ${color}`}>
                  <Icon size={20} />
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Chart */}
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Waktu Fokus
            </h3>
            <div className="space-y-4">
              {chartBuckets.map((b) => {
                const percentage = (b.minutes / chartMaxMinutes) * 100
                return (
                  <div key={b.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{b.label}</span>
                      <span className="font-bold text-slate-900">{formatMinutes(b.minutes)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {chartBuckets.every((b) => b.minutes === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Belum ada data fokus di periode ini.</p>
              )}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Distribusi Mood
            </h3>
            {moodDist.total === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada data mood di periode ini.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(MOOD_META).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xl w-6">{meta.emoji}</span>
                    <span className="text-slate-600 font-medium flex-1">{meta.label}</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${moodDist.percentages[key]}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-10 text-right">{moodDist.percentages[key]}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Days/Weeks/Months */}
        <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            {topTitle}
          </h3>
          {topItems.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada sesi fokus di periode ini.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => {
                const emoji = period === 'week' ? getDayMoodEmoji(state.moods, item.key) : null
                return (
                  <div key={item.key} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                    <span className="text-2xl">🏆</span>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{idx + 1}. {item.label}</p>
                      <p className="text-sm text-slate-500">{item.sessionCount} sesi fokus</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatMinutes(item.minutes)}</p>
                      {emoji && <p className="text-lg">{emoji}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 p-6">
          <h3 className="font-bold text-violet-900 mb-4">📊 Ringkasan Minggu Ini</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Rata-rata Harian</p>
              <p className="text-2xl font-bold text-violet-900">{formatMinutes(weekMinutes / 7)}</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Hari Produktif</p>
              <p className="text-2xl font-bold text-violet-900">{productiveDays} dari 7</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Perubahan vs Minggu Lalu</p>
              <p className={`text-2xl font-bold ${pctChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
