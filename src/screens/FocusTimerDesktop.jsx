import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Settings, Clock, Coffee } from 'lucide-react'
import { useAppState } from '../state/store.jsx'
import LearningReadiness from '../components/LearningReadiness.jsx'

function formatMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}j ${m}m`
}

export default function FocusTimerDesktop() {
  const { actions, derived } = useAppState()

  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [settings, setSettings] = useState({ focus: 25, break: 5 })
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // Learning Readiness: sesi fokus baru bisa dimulai setelah siap (atau setelah istirahat)
  const [isReady, setIsReady] = useState(false)
  const gated = mode === 'focus' && !isReady

  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else if (isRunning && timeLeft === 0) {
      handleComplete()
    }
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = mode === 'focus'
    ? ((settings.focus * 60 - timeLeft) / (settings.focus * 60)) * 100
    : ((settings.break * 60 - timeLeft) / (settings.break * 60)) * 100

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? settings.focus * 60 : settings.break * 60)
    setIsRunning(false)
  }

  const handleReset = () => {
    setTimeLeft(mode === 'focus' ? settings.focus * 60 : settings.break * 60)
    setIsRunning(false)
  }

  const handleComplete = () => {
    if (mode === 'focus') {
      actions.logFocusSession(settings.focus)
      setMode('break')
      setTimeLeft(settings.break * 60)
    } else {
      setMode('focus')
      setTimeLeft(settings.focus * 60)
    }
    setIsRunning(false)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header — judul & deskripsi ikut berubah selama masih di tahap Learning Readiness,
            baru berganti ke "Focus Timer" setelah kesiapan belajar dikonfirmasi. */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 mb-1 lg:mb-2">
            {gated ? 'Learning Readiness' : 'Focus Timer'}
          </h1>
          <p className="text-sm lg:text-lg text-slate-500">
            {gated
              ? 'Cek dulu kesiapan belajarmu sebelum mulai fokus'
              : 'Teknik Pomodoro untuk produktivitas maksimal'}
          </p>
        </div>

        {/* Main Timer */}
        <div className="rounded-3xl bg-white border border-black/[0.05] shadow-sm p-5 sm:p-8 lg:p-12 mb-6 lg:mb-8">
          <div className="text-center space-y-6 lg:space-y-8">
            {/* Mode */}
            <div className="flex justify-center gap-3 lg:gap-4">
              <button
                onClick={() => handleModeChange('focus')}
                className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition ${
                  mode === 'focus'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock size={18} className="inline mr-2" />
                Focus
              </button>
              <button
                onClick={() => handleModeChange('break')}
                className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition ${
                  mode === 'break'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Coffee size={18} className="inline mr-2" />
                Break
              </button>
            </div>

            {gated ? (
              <LearningReadiness onReady={() => setIsReady(true)} />
            ) : (
              <>
            {/* Timer Display */}
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-10 text-center">
                <div className="text-4xl sm:text-6xl font-bold text-slate-900">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {mode === 'focus' ? 'Fokus' : 'Istirahat'}
                </div>
                {isRunning && (
                  <p className="mt-3 text-xs leading-snug text-slate-400">
                    {mode === 'focus'
                      ? 'Saatnya fokus! Jangan lupa istirahat ya 💪'
                      : 'Nikmati istirahatmu, sebentar lagi lanjut fokus lagi ☕'}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 lg:gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-3.5 lg:p-4 rounded-full ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : mode === 'focus'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white transition shadow-lg`}
              >
                {isRunning ? <Pause size={24} className="lg:hidden" /> : <Play size={24} className="lg:hidden" />}
                {isRunning ? <Pause size={28} className="hidden lg:block" /> : <Play size={28} className="hidden lg:block" />}
              </button>
              <button
                onClick={handleReset}
                className="p-3.5 lg:p-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <RotateCcw size={24} className="lg:hidden" />
                <RotateCcw size={28} className="hidden lg:block" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3.5 lg:p-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <Settings size={24} className="lg:hidden" />
                <Settings size={28} className="hidden lg:block" />
              </button>
            </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>{isReady ? '✅ Kesiapan belajar terkonfirmasi' : ''}</span>
                {isReady && mode === 'focus' && !isRunning && (
                  <button
                    onClick={() => setIsReady(false)}
                    className="font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                  >
                    Cek ulang
                  </button>
                )}
              </div>
              </>
            )}

            {/* Sessions */}
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-2">Sesi Selesai Hari Ini</p>
              <p className="text-3xl lg:text-4xl font-bold text-emerald-600">{derived.todaySessionCount}</p>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6 mb-6 lg:mb-8">
            <h3 className="font-bold text-slate-900 mb-4">Pengaturan Timer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durasi Focus (menit)
                </label>
                <input
                  type="number"
                  value={settings.focus}
                  onChange={(e) => setSettings({ ...settings, focus: parseInt(e.target.value) || 1 })}
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
                  onChange={(e) => setSettings({ ...settings, break: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6">
            <p className="text-sm text-slate-500 mb-2">Sesi Minggu Ini</p>
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">{derived.focusSessionCountWeek}</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6">
            <p className="text-sm text-slate-500 mb-2">Total Fokus Bulan Ini</p>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{formatMinutes(derived.monthFocusMinutes)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-black/[0.05] shadow-sm p-5 lg:p-6">
            <p className="text-sm text-slate-500 mb-2">Rata-rata per Hari</p>
            <p className="text-2xl lg:text-3xl font-bold text-violet-600">{formatMinutes(derived.avgFocusMinutesPerDay)}</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 lg:mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-5 lg:p-6">
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
