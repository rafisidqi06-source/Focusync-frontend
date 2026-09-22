import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
// Learning Readiness
// Cek kesiapan belajar sebelum Focus Timer boleh dimulai.
//   skor >= 14 (& tidak ada jawaban 1) -> siap, timer terbuka
//   skor 10-13                        -> istirahat 5 menit, setelah itu timer terbuka
//   skor < 10                         -> TERKUNCI: istirahat 10 menit, lalu wajib cek ulang
//                                        dan timer baru terbuka kalau skor sudah >= 10
// ─────────────────────────────────────────────────────────────

export const QUESTIONS = [
  {
    key: 'energy',
    emoji: '🔋',
    label: 'Energi tubuh',
    ask: 'Seberapa berenergi tubuhmu sekarang?',
    low: 'Lemas',
    high: 'Segar',
    tip: 'Minum segelas air dan regangkan badan sebentar.',
  },
  {
    key: 'calm',
    emoji: '🧘',
    label: 'Ketenangan pikiran',
    ask: 'Seberapa tenang pikiranmu saat ini?',
    low: 'Penuh pikiran',
    high: 'Tenang',
    tip: 'Tarik napas dalam dan lepaskan beban pikiran sejenak.',
  },
  {
    key: 'clarity',
    emoji: '🎯',
    label: 'Konsentrasi',
    ask: 'Seberapa jernih kamu bisa berkonsentrasi?',
    low: 'Buyar',
    high: 'Jernih',
    tip: 'Istirahatkan mata: tatap objek jauh selama 20 detik.',
  },
  {
    key: 'setup',
    emoji: '📚',
    label: 'Kesiapan & tempat belajar',
    ask: 'Seberapa siap kamu dan tempat belajarmu? (sudah minum, nyaman, HP disingkirkan)',
    low: 'Belum siap',
    high: 'Siap banget',
    tip: 'Rapikan meja, siapkan air minum, dan silent-kan HP.',
  },
]

const REST_TIPS = [
  '💧 Minum air putih dulu ya.',
  '🙆 Regangkan leher, bahu, dan punggungmu.',
  '👀 Tatap sesuatu yang jauh untuk mengistirahatkan matamu.',
  '📵 Jauhkan HP dan layar selama istirahat.',
  '🌬️ Tarik napas 4 hitungan, tahan, lalu hembuskan pelan.',
]

export const MAX_SCORE = QUESTIONS.length * 5
export const LOCK_SCORE = 10 // skor di bawah ini = Focus Timer tidak boleh dibuka
export const READY_SCORE = 14 // skor minimal untuk langsung siap
export const MIN_ANSWER_FOR_READY = 2 // satu jawaban <= 1 tetap membatalkan "siap"
export const LOCK_KEY = 'focusync_readiness_lock'

// Kunci disimpan supaya tidak bisa "kabur" dengan pindah halaman / refresh saat istirahat.
export function readLock() {
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function writeLock(lock) {
  try {
    if (lock) localStorage.setItem(LOCK_KEY, JSON.stringify(lock))
    else localStorage.removeItem(LOCK_KEY)
  } catch {
    /* abaikan */
  }
}

// Jawaban yang belum diisi / tidak valid dianggap 0 supaya evaluate() tidak pernah
// menghasilkan NaN (tombol submit memang sudah di-disable, tapi ini jaring pengaman).
function normalize(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(5, Math.max(0, n))
}

export function evaluate(answers = {}) {
  const vals = QUESTIONS.map((q) => normalize(answers[q.key]))
  const total = vals.reduce((a, b) => a + b, 0)
  const min = Math.min(...vals)
  const ready = total >= READY_SCORE && min >= MIN_ANSWER_FOR_READY
  const locked = total < LOCK_SCORE
  const restMinutes = ready ? 0 : locked ? 10 : 5
  const weak = QUESTIONS.filter((q, i) => vals[i] <= 2)
  return { total, ready, locked, restMinutes, weak }
}

export function fmt(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function LearningReadiness({ onReady }) {
  // Kalau sebelumnya skor < 10, kunci masih berlaku walau halaman dibuka ulang.
  const [savedLock] = useState(readLock)
  const lockActive = !!savedLock && savedLock.endsAt > Date.now()
  const lockExpired = !!savedLock && !lockActive

  // 'check' | 'ready' | 'result' | 'resting' | 'rested'
  const [phase, setPhase] = useState(lockActive ? 'resting' : lockExpired ? 'rested' : 'check')
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(
    savedLock ? { total: 0, ready: false, locked: true, restMinutes: savedLock.minutes, weak: [] } : null
  )
  const [restEndsAt, setRestEndsAt] = useState(lockActive ? savedLock.endsAt : 0)
  const [restTotalMs, setRestTotalMs] = useState(lockActive ? savedLock.minutes * 60 * 1000 : 0)
  const [now, setNow] = useState(Date.now())

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== undefined)

  const handleSubmit = () => {
    const r = evaluate(answers)
    setResult(r)
    // Skor sudah >= 10 -> kunci dilepas. Skor < 10 -> kunci tetap sampai lolos.
    if (!r.locked) writeLock(null)
    setPhase(r.ready ? 'ready' : 'result')
  }

  const startRest = () => {
    const ms = result.restMinutes * 60 * 1000
    const endsAt = Date.now() + ms
    setRestTotalMs(ms)
    setRestEndsAt(endsAt)
    setNow(Date.now())
    if (result.locked) writeLock({ endsAt, minutes: result.restMinutes })
    setPhase('resting')
  }

  const recheck = () => {
    setAnswers({})
    setResult(null)
    setPhase('check')
  }

  const isLocked = !!result?.locked

  // Hitung mundur berbasis timestamp, jadi tetap akurat walau tab di-background.
  useEffect(() => {
    if (phase !== 'resting') return undefined
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= restEndsAt) setPhase('rested')
    }, 500)
    return () => clearInterval(id)
  }, [phase, restEndsAt])

  const remaining = Math.max(0, restEndsAt - now)
  const elapsedSec = Math.floor((restTotalMs - remaining) / 1000)
  const inhale = elapsedSec % 8 < 4
  const tip = REST_TIPS[Math.floor(elapsedSec / 20) % REST_TIPS.length]
  const restProgress = restTotalMs ? ((restTotalMs - remaining) / restTotalMs) * 100 : 0

  const weakTips = useMemo(() => result?.weak ?? [], [result])

  // ───────────── CHECK ─────────────
  if (phase === 'check') {
    return (
      <div className="text-left space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Learning Readiness</p>
          <h2 className="mt-1 text-xl lg:text-2xl font-bold text-slate-900">Sudah siap belajar?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jawab 4 pertanyaan singkat dulu sebelum memulai Focus Timer.
          </p>
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
              <span className="mr-1.5">{q.emoji}</span>
              {q.ask}
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setAnswers((a) => ({ ...a, [q.key]: n }))}
                  className={`h-10 rounded-xl text-sm font-bold transition ${
                    answers[q.key] === n
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
              <span>{q.low}</span>
              <span>{q.high}</span>
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
        >
          Cek Kesiapanku
        </button>
      </div>
    )
  }

  // ───────────── SIAP ─────────────
  if (phase === 'ready') {
    return (
      <div className="space-y-5 py-2">
        <div className="text-5xl">🎉</div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Kamu siap belajar!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Skor kesiapan: <span className="font-bold text-emerald-600">{result.total}/{MAX_SCORE}</span>. Kondisimu bagus untuk mulai fokus.
          </p>
        </div>
        <button
          onClick={onReady}
          className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Lanjut ke Focus Timer
        </button>
      </div>
    )
  }

  // ───────────── BELUM SIAP ─────────────
  if (phase === 'result') {
    return (
      <div className="space-y-5 py-2 text-left">
        <div className="text-center">
          <div className="text-5xl">🌿</div>
          <h2 className="mt-2 text-xl lg:text-2xl font-bold text-slate-900">Istirahat dulu ya</h2>
          {isLocked ? (
            <p className="mt-1 text-sm text-slate-500">
              Skor kesiapanmu <span className="font-bold text-rose-600">{result.total}/{MAX_SCORE}</span>, di bawah {LOCK_SCORE}.
              Focus Timer <span className="font-semibold text-slate-700">belum bisa dibuka</span>. Istirahat {result.restMinutes} menit dulu,
              lalu cek ulang kesiapanmu.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Skor kesiapanmu <span className="font-bold text-amber-600">{result.total}/{MAX_SCORE}</span>. Belajar sekarang mungkin
              kurang efektif. Ambil jeda {result.restMinutes} menit supaya lebih segar, baru mulai fokus.
            </p>
          )}
        </div>

        {weakTips.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">Yang perlu diperhatikan</p>
            <ul className="space-y-2 text-sm text-amber-900">
              {weakTips.map((q) => (
                <li key={q.key}>
                  <span className="mr-1">{q.emoji}</span>
                  <span className="font-semibold">{q.label}:</span> {q.tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={startRest}
          className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Mulai Istirahat {result.restMinutes} Menit
        </button>
        {isLocked ? (
          <p className="text-center text-xs text-slate-400">
            Lagi berat banget? <Link to="/chat" className="font-semibold text-emerald-600 hover:underline">Ngobrol dengan AI Chat</Link>
          </p>
        ) : (
          <button onClick={recheck} className="w-full text-xs font-medium text-slate-400 hover:text-slate-600 transition">
            Jawabanku salah? Isi ulang
          </button>
        )}
      </div>
    )
  }

  // ───────────── ISTIRAHAT ─────────────
  if (phase === 'resting') {
    return (
      <div className="space-y-5 py-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Waktu Istirahat</p>

        <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-breathe" />
          <div className="absolute inset-6 rounded-full bg-emerald-200/80 animate-breathe" style={{ animationDelay: '0.3s' }} />
          <div className="relative text-center">
            <p className="text-3xl font-bold text-slate-900">{fmt(remaining)}</p>
            <p className="mt-1 text-xs text-emerald-700">{inhale ? 'Tarik napas…' : 'Hembuskan…'}</p>
          </div>
        </div>

        <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${restProgress}%` }} />
        </div>

        <p className="text-sm text-slate-500 min-h-[1.25rem]">{tip}</p>
        <p className="text-xs text-slate-400">
          {isLocked
            ? 'Focus Timer terkunci. Setelah istirahat selesai, cek ulang kesiapanmu (skor minimal 10).'
            : 'Focus Timer akan terbuka setelah istirahat selesai.'}
        </p>

        {!isLocked && (
          <button onClick={recheck} className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
            Sudah merasa lebih baik? Cek ulang kesiapan
          </button>
        )}
      </div>
    )
  }

  // ───────────── SELESAI ISTIRAHAT ─────────────
  if (isLocked) {
    return (
      <div className="space-y-5 py-2">
        <div className="text-5xl">☀️</div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Istirahat selesai</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cek ulang kesiapanmu dulu. Focus Timer terbuka kalau skornya sudah {LOCK_SCORE} atau lebih.
          </p>
        </div>
        <button
          onClick={recheck}
          className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Cek Ulang Kesiapan
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 py-2">
      <div className="text-5xl">☀️</div>
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Istirahat selesai</h2>
        <p className="mt-1 text-sm text-slate-500">Semoga sudah lebih segar. Yuk mulai sesi fokusmu!</p>
      </div>
      <button
        onClick={onReady}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Mulai Fokus
      </button>
      <button onClick={recheck} className="w-full text-xs font-medium text-slate-400 hover:text-slate-600 transition">
        Cek ulang kesiapan
      </button>
    </div>
  )
}
