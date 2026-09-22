import React, { useState } from 'react'
import { TrendingUp, Calendar, Award, Target, BarChart3, LineChart, PieChart } from 'lucide-react'

export default function StatistikDesktop() {
  const [period, setPeriod] = useState('week') // 'week' | 'month' | 'year'

  const focusData = {
    week: [2, 3.5, 2.8, 4.2, 3.5, 4.8, 3.2],
    month: [12, 15, 11, 18, 14, 20, 16, 22],
  }

  const moodData = {
    excellent: 35,
    good: 40,
    okay: 20,
    bad: 5,
  }

  const stats = [
    { label: 'Total Fokus', value: '32h 45m', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Rata-rata per Hari', value: '1h 30m', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Konsistensi Bulan Ini', value: '85%', icon: Award, color: 'text-amber-600' },
    { label: 'Target Minggu', value: '80% Tercapai', icon: Target, color: 'text-violet-600' },
  ]

  const topDays = [
    { day: 'Senin', focus: '4h 20m', sessions: 8, mood: '😊' },
    { day: 'Rabu', focus: '4h 10m', sessions: 7, mood: '😊' },
    { day: 'Jumat', focus: '3h 55m', sessions: 6, mood: '🙂' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Statistik & Progress</h1>
            <p className="text-lg text-slate-500">Analisis detail performa fokus dan moodmu</p>
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
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
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
        <div className="grid grid-cols-2 gap-6">
          {/* Focus Chart */}
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Waktu Fokus
            </h3>
            <div className="space-y-4">
              {(period === 'week'
                ? ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
                : ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4']
              ).map((day, idx) => {
                const value = focusData[period][idx] || 0
                const max = Math.max(...focusData[period])
                const percentage = (value / max) * 100
                return (
                  <div key={day} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{day}</span>
                      <span className="font-bold text-slate-900">{value}h</span>
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
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Distribusi Mood
            </h3>
            <div className="space-y-3">
              {[
                { emoji: '😄', label: 'Excellent', value: moodData.excellent, color: 'bg-green-400' },
                { emoji: '😊', label: 'Good', value: moodData.good, color: 'bg-blue-400' },
                { emoji: '🙂', label: 'Okay', value: moodData.okay, color: 'bg-yellow-400' },
                { emoji: '😞', label: 'Bad', value: moodData.bad, color: 'bg-red-400' },
              ].map(({ emoji, label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl w-6">{emoji}</span>
                  <span className="text-slate-600 font-medium flex-1">{label}</span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full`}
                      style={{ width: `${(value / 100) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 w-8 text-right">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Days */}
        <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            Hari-hari Terbaik
          </h3>
          <div className="space-y-3">
            {topDays.map((item, idx) => (
              <div key={item.day} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{idx + 1}. {item.day}</p>
                  <p className="text-sm text-slate-500">{item.sessions} sesi fokus</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{item.focus}</p>
                  <p className="text-lg">{item.mood}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 p-6">
          <h3 className="font-bold text-violet-900 mb-4">📊 Ringkasan Minggu Ini</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Rata-rata Harian</p>
              <p className="text-2xl font-bold text-violet-900">3h 45m</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Hari Produktif</p>
              <p className="text-2xl font-bold text-violet-900">6 dari 7</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-1">Perubahan vs Minggu Lalu</p>
              <p className="text-2xl font-bold text-green-600">↑ 12%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
