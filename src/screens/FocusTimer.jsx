import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, CheckCircle } from 'lucide-react'

export default function FocusTimerDesktop() {
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [settings, setSettings] = useState({ focus: 25, break: 5 })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = mode === 'focus'
    ? ((settings.focus * 60 - timeLeft) / (settings.focus * 60)) * 100
    : ((settings.break * 60 - timeLeft) / (settings.break * 60)) * 100

  const handleReset = () => {
    setTimeLeft(mode === 'focus' ? settings.focus * 60 : settings.break * 60)
    setIsRunning(false)
  }

  const handleComplete = () => {
    if (mode === 'focus') {
      setSessions(s => s + 1)
      setMode('break')
      setTimeLeft(settings.break * 60)
    } else {
      setMode('focus')
      setTimeLeft(settings.focus * 60)
    }
    setIsRunning(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Focus Timer</h1>
          <p className="text-lg text-slate-500">Teknik Pomodoro untuk produktivitas maksimal</p>
        </div>

        {/* Main Timer */}
        <div className="rounded-3xl bg-white border border-black/[0.05] shadow-sm p-12 mb-8">
          <div className="text-center space-y-8">
            {/* Mode */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMode('focus')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === 'focus'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock size={18} className="inline mr-2" />
                Focus
              </button>
              <button
                onClick={() => setMode('break')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === 'break'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Coffee size={18} className="inline mr-2" />
                Break
              </button>
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 mx-auto">
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke={mode === 'focus' ? '#3b82f6' : '#10b981'}
                  strokeWidth="8"
                  strokeDasharray={`${(2 * Math.PI * 95 * progress) / 100} ${2 * Math.PI * 95}`}
                  strokeLinecap="round"
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-slate-900">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {mode === 'focus' ? 'Fokus' : 'Istirahat'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-4 rounded-full ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : mode === 'focus'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white transition shadow-lg`}
              >
                {isRunning ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button
                onClick={handleReset}
                className="p-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <RotateCcw size={28} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <Settings size={28} />
              </button>
            </div>

            {/* Sessions */}
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-2">Sesi Selesai Hari Ini</p>
              <p className="text-4xl font-bold text-emerald-600">{sessions}</p>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-4">Pengaturan Timer</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durasi Focus (menit)
                </label>
                <input
                  type="number"
                  value={settings.focus}
                  onChange={(e) => setSettings({ ...settings, focus: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durasi Break (menit)
                </label>
                <input
                  type="number"
                  value={settings.break}
                  onChange={(e) => setSettings({ ...settings, break: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <p className="text-sm text-slate-500 mb-2">Sesi Minggu Ini</p>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <p className="text-sm text-slate-500 mb-2">Total Fokus Bulan Ini</p>
            <p className="text-3xl font-bold text-emerald-600">32j 45m</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-6">
            <p className="text-sm text-slate-500 mb-2">Rata-rata per Hari</p>
            <p className="text-3xl font-bold text-violet-600">1h 30m</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">💡 Tip Produktivitas</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Mulai dengan fokus 25 menit, istirahat 5 menit</li>
            <li>• Setelah 4 pomodoro, ambil break yang lebih panjang (15-30 menit)</li>
            <li>• Matikan notifikasi selama sesi fokus</li>
            <li>• Minum air dan lakukan peregangan di setiap break</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
