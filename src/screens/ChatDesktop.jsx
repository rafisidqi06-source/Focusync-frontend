import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Send, Loader, Settings, Smile, Zap } from 'lucide-react'
import { fetchAiReply } from '../state/api.js'

export default function ChatDesktop() {
  const location = useLocation()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Halo! 👋 Saya FocusBot, asisten AI mu untuk fokus dan pembelajaran. Apa yang bisa saya bantu hari ini?',
    },
    {
      id: 2,
      type: 'bot',
      text: 'Saya bisa membantu dengan:\n• Tips fokus dan produktivitas\n• Strategi belajar\n• Motivasi saat mood down\n• Teknik relaksasi\n• Manajemen waktu',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const autoSentRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Kalau datang dari kartu rekomendasi di Beranda (bawa presetPrompt),
  // langsung kirim otomatis tanpa user harus ngetik ulang.
  useEffect(() => {
    const preset = location.state?.presetPrompt
    if (preset && !autoSentRef.current) {
      autoSentRef.current = true
      sendMessage(preset)
      // bersihkan state biar gak terkirim ulang kalau halaman di-refresh/back
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text,
    }
    setMessages((prev) => {
      const updatedMessages = [...prev, newMessage]
      // fire and forget async continuation below, using functional update
      return updatedMessages
    })
    setInput('')
    setIsLoading(true)

    try {
      const history = [...messages, newMessage].map((m) => ({
        role: m.type === 'user' ? 'user' : 'ai',
        text: m.text,
      }))
      const replyText = await fetchAiReply(text, history)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: replyText },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Maaf, aku lagi gak bisa nyambung ke server. Coba lagi sebentar ya.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => sendMessage(input)

  const quickActions = [
    { emoji: '💡', label: 'Tips Fokus', prompt: 'Berikan saya tips untuk fokus lebih baik' },
    { emoji: '😴', label: 'Relaksasi', prompt: 'Saya merasa lelah, bantu saya relaksasi' },
    { emoji: '🎯', label: 'Strategi Belajar', prompt: 'Bagaimana cara belajar yang efektif?' },
    { emoji: '💪', label: 'Motivasi', prompt: 'Saya butuh motivasi untuk belajar' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex flex-col w-full flex-1 lg:h-full space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-slate-900">FocusBot</h1>
            <p className="text-sm lg:text-base text-slate-500">Asisten AI untuk produktivitas dan fokus</p>
          </div>
          <button className="p-3 rounded-full hover:bg-slate-100 transition">
            <Settings size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 rounded-2xl bg-white border border-black/[0.05] shadow-sm overflow-hidden flex flex-col min-h-[420px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-xs px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-none px-4 py-3">
                  <Loader size={18} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length < 3 && (
            <div className="px-4 lg:px-6 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-medium text-slate-500 mb-3">Aksi Cepat</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map(({ emoji, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setInput(prompt)
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white border border-slate-200 hover:border-blue-300 transition text-sm font-medium text-slate-700"
                  >
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-slate-100 p-3 lg:p-4 bg-slate-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pertanyaan Anda di sini..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              💡 Tip: Ceritakan mood atau situasi Anda untuk saran yang lebih personal
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Pertanyaan Spesifik</p>
                <p className="text-xs text-blue-700 mt-1">Semakin detail pertanyaan, semakin baik jawabannya</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-start gap-3">
              <Smile size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-emerald-900 text-sm">Cerita Konteks</p>
                <p className="text-xs text-emerald-700 mt-1">Bagikan mood atau situasi untuk solusi lebih tepat</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-violet-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-violet-900 text-sm">Follow-up Aman</p>
                <p className="text-xs text-violet-700 mt-1">Tanyakan pertanyaan lanjutan untuk topik yang sama</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
