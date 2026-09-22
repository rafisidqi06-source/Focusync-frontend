import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Timer, HeartHandshake } from 'lucide-react'
import { useAppState } from '../state/store.jsx'
import Logo from '../components/Logo.jsx'

const slides = [
  {
    icon: Sparkles,
    title: 'Kenali kondisimu\nsetiap hari',
    body: 'Mood Tracker dan Daily Check-in membantumu memahami pola emosi tanpa ribet.',
  },
  {
    icon: Timer,
    title: 'Fokus belajar\ntanpa terbebani',
    body: 'Focus Timer berbasis Pomodoro menjaga ritme belajarmu tetap terstruktur.',
  },
  {
    icon: HeartHandshake,
    title: 'Nggak pernah\nsendirian',
    body: 'AI Support Chat dan Community Safe Space siap menemani kapan pun kamu butuh.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [showAuth, setShowAuth] = useState(false)
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const { actions } = useAppState()

  if (showAuth) {
    return (
      <div className="flex min-h-screen flex-col justify-between px-6 pb-10 pt-16">
        <div>
          <Logo size={44} />
          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-violet-400">Masuk / Daftar</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Siapa nama panggilanmu?
          </h1>
          <p className="mt-2 text-sm text-ink-300">
            Data kamu tersimpan aman di perangkat ini saja, hanya untuk pengalaman yang lebih personal.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const trimmed = name.trim() || 'Sobat Focusync'
              actions.completeOnboarding({ name: trimmed })
              navigate('/beranda')
            }}
          >
            <input
              autoFocus
              className="input-field"
              placeholder="Contoh: Aurora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
            />
            <button type="submit" className="btn-primary w-full">
              Mulai pakai Focusync
            </button>
          </form>
        </div>
        <button
          className="text-center text-xs text-ink-500 underline decoration-dotted underline-offset-4"
          onClick={() => setShowAuth(false)}
        >
          Kembali
        </button>
      </div>
    )
  }

  const Slide = slides[step].icon

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-14">
      <div className="flex items-center">
        <Logo variant="full" size={132} />
      </div>

      <div className="mt-16 flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-gradient shadow-glow">
          <Slide size={34} className="text-white" strokeWidth={2} />
        </div>
        <h1 className="mt-8 whitespace-pre-line text-3xl font-semibold leading-tight">
          {slides[step].title}
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
          {slides[step].body}
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? 'w-6 bg-violet-400' : 'w-1.5 bg-black/10'
            }`}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {step < slides.length - 1 ? (
          <>
            <button className="btn-primary w-full" onClick={() => setStep((s) => s + 1)}>
              Lanjut
            </button>
            <button
              className="text-center text-xs text-ink-500"
              onClick={() => setShowAuth(true)}
            >
              Lewati
            </button>
          </>
        ) : (
          <button className="btn-primary w-full" onClick={() => setShowAuth(true)}>
            Mulai Sekarang
          </button>
        )}
      </div>
    </div>
  )
}
