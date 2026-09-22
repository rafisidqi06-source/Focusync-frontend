import React, { useEffect, useRef, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader.jsx'
import { Send, Sparkles } from 'lucide-react'
import { useAppState } from '../state/store.jsx'

const quickPrompts = ['Buat plan hari ini', 'Aku lagi overwhelmed', 'Motivasi belajar', 'Tips relaksasi']

export default function AIChat() {
  const { state, actions } = useAppState()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [state.chatHistory, typing])

  async function submit(text) {
    const value = (text ?? input).trim()
    if (!value) return
    setInput('')
    setTyping(true)
    try {
      await actions.sendChatMessage(value)
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <ScreenHeader title="AI Support Chat" subtitle="AI menjadi teman yang siap mendengarkan" />

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {state.chatHistory.map((m) => (
          <ChatBubble key={m.id} role={m.role} text={m.text} />
        ))}
        {typing && <ChatBubble role="ai" typing />}
      </div>

      <div className="border-t border-black/[0.06] bg-base-950/95 px-5 pb-4 pt-3 backdrop-blur-lg">
        <div className="flex gap-2 overflow-x-auto pb-2.5">
          {quickPrompts.map((p) => (
            <button key={p} onClick={() => submit(p)} className="chip whitespace-nowrap">
              {p}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ceritakan perasaanmu di sini..."
            className="input-field !py-3"
          />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white"
            aria-label="Kirim"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatBubble({ role, text, typing }) {
  const isAi = role === 'ai'
  return (
    <div className={`flex items-end gap-2 ${isAi ? '' : 'flex-row-reverse'}`}>
      {isAi && (
        <span className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
          <Sparkles size={12} />
        </span>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAi
            ? 'rounded-bl-sm bg-base-850 text-ink-100'
            : 'rounded-br-sm bg-violet-500 text-white'
        }`}
      >
        {typing ? (
          <span className="flex gap-1 py-1">
            <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  )
}

function Dot({ delay = '0ms' }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500"
      style={{ animationDelay: delay }}
    />
  )
}
