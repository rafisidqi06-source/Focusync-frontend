import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function ScreenHeader({ title, subtitle, back = true, right = null }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-base-950/85 px-5 pb-4 pt-6 backdrop-blur-lg">
      <div className="flex items-start gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.03]"
            aria-label="Kembali"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="font-display text-lg font-semibold leading-snug">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  )
}
