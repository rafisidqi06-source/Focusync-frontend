import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAiReply } from './api.js'

const STORAGE_KEY = 'focusync_state_v1'

const MOOD_SCALE = { great: 5, good: 4, okay: 3, bad: 2, awful: 1 }

// Kunci tanggal LOKAL (YYYY-MM-DD). offsetDays: 0 = hari ini, 1 = besok, dst.
// Dipakai To-Do Planner supaya "hari ini" mengikuti zona waktu perangkat.
export function localDateKey(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const seedCommunityPosts = [
  {
    id: 'p1',
    tag: 'Overthinking',
    author: 'Anonim',
    time: '2 jam lalu',
    text: 'Ada yang punya tips biar gak overthinking pas ngerjain tugas jam 2 pagi? Kepala udah penuh tapi belum kelar-kelar.',
    likes: 24,
    comments: 12,
  },
  {
    id: 'p2',
    tag: 'Fokus',
    author: 'Mahasiswa Perantau',
    time: '5 jam lalu',
    text: 'Gimana cara kalian tetap fokus kalau belajar di kos sendirian? Aku gampang banget kealihin sama HP.',
    likes: 16,
    comments: 8,
  },
  {
    id: 'p3',
    tag: 'Cerita Baik',
    author: 'SemangatBaru',
    time: '1 hari lalu',
    text: 'Hari ini akhirnya submit revisi skripsi setelah 3 minggu stuck. Kecil tapi lega banget rasanya.',
    likes: 32,
    comments: 15,
  },
]

const defaultState = {
  onboarded: false,
  user: null,
  moods: [], // { id, date, mood, note }
  checkIns: [], // { id, date, stressor, sleep }
  focusSessions: [], // { id, date, minutes }
  journalEntries: [], // { id, date, text }
  todos: [], // { id, text, done, date: 'YYYY-MM-DD' (lokal), priority, category, createdAt }
  chatHistory: [
    {
      id: 'welcome',
      role: 'ai',
      text: 'Hai, aku di sini untuk kamu. Ada yang lagi kamu rasain hari ini?',
    },
  ],
  communityPosts: seedCommunityPosts,
  openedFeature: null, // 'journal' | 'relaksasi' | 'musik' | null
  viewMode: 'desktop', // 'desktop' | 'mobile'
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const actions = useMemo(() => ({
    completeOnboarding(user) {
      setState((s) => ({ ...s, onboarded: true, user }))
    },
    addMood({ mood, note }) {
      setState((s) => ({
        ...s,
        moods: [
          { id: crypto.randomUUID(), date: new Date().toISOString(), mood, note: note || '' },
          ...s.moods,
        ],
      }))
    },
    addCheckIn({ stressor, sleep }) {
      setState((s) => ({
        ...s,
        checkIns: [
          { id: crypto.randomUUID(), date: new Date().toISOString(), stressor, sleep },
          ...s.checkIns,
        ],
      }))
    },
    logFocusSession(minutes) {
      setState((s) => ({
        ...s,
        focusSessions: [
          { id: crypto.randomUUID(), date: new Date().toISOString(), minutes },
          ...s.focusSessions,
        ],
      }))
    },
    addJournalEntry(text) {
      setState((s) => ({
        ...s,
        journalEntries: [
          { id: crypto.randomUUID(), date: new Date().toISOString(), text },
          ...s.journalEntries,
        ],
      }))
    },
    // ── To-Do Planner ──
    // items: [{ text, day?: 'today' | 'tomorrow', date?: 'YYYY-MM-DD', priority?: 'high'|'medium'|'low', category?: string }]
    addTodos(items) {
      const clean = (items || []).filter((i) => i.text && i.text.trim())
      if (!clean.length) return
      setState((s) => ({
        ...s,
        todos: [
          ...clean.map((i) => ({
            id: crypto.randomUUID(),
            text: i.text.trim(),
            done: false,
            date: i.date || localDateKey(i.day === 'tomorrow' ? 1 : 0),
            priority: i.priority || 'medium',
            category: i.category || '',
            createdAt: new Date().toISOString(),
          })),
          ...(s.todos || []),
        ],
      }))
    },
    moveTodo(id, date) {
      setState((s) => ({
        ...s,
        todos: (s.todos || []).map((t) => (t.id === id ? { ...t, date } : t)),
      }))
    },
    clearDoneTodos() {
      setState((s) => ({ ...s, todos: (s.todos || []).filter((t) => !t.done) }))
    },
    toggleTodo(id) {
      setState((s) => ({
        ...s,
        todos: (s.todos || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      }))
    },
    removeTodo(id) {
      setState((s) => ({ ...s, todos: (s.todos || []).filter((t) => t.id !== id) }))
    },
    async sendChatMessage(text) {
      const userMsg = { id: crypto.randomUUID(), role: 'user', text }
      setState((s) => ({ ...s, chatHistory: [...s.chatHistory, userMsg] }))

      let replyText
      try {
        replyText = await fetchAiReply(text, state.chatHistory)
      } catch {
        // Backend belum jalan / error jaringan -> pakai balasan lokal sebagai fallback.
        replyText = generateAiReply(text)
      }

      const aiMsg = { id: crypto.randomUUID(), role: 'ai', text: replyText }
      setState((s) => ({ ...s, chatHistory: [...s.chatHistory, aiMsg] }))
    },
    addCommunityPost(text, tag) {
      const post = {
        id: crypto.randomUUID(),
        tag: tag || 'Umum',
        author: 'Kamu (Anonim)',
        time: 'Baru saja',
        text,
        likes: 0,
        comments: 0,
      }
      setState((s) => ({ ...s, communityPosts: [post, ...s.communityPosts] }))
    },
    likePost(id) {
      setState((s) => ({
        ...s,
        communityPosts: s.communityPosts.map((p) =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p
        ),
      }))
    },
    resetAll() {
      localStorage.removeItem(STORAGE_KEY)
      setState(defaultState)
    },
    openFeature(featureName) {
      setState((s) => ({ ...s, openedFeature: featureName }))
    },
    closeFeature() {
      setState((s) => ({ ...s, openedFeature: null }))
    },
    setViewMode(mode) {
      setState((s) => ({ ...s, viewMode: mode }))
    },
  }), [state])

  const derived = useMemo(() => computeDerived(state), [state])

  const value = useMemo(() => ({ state, actions, derived }), [state, actions, derived])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

function generateAiReply(text) {
  const t = text.toLowerCase()
  if (/(overthink|mikir terus|gak bisa berhenti mikir)/.test(t)) {
    return 'Aku ngerti rasanya overwhelmed. Tarik napas dulu ya, kamu nggak sendirian. Coba fokus satu per satu yuk. Mau aku bantu buat plan hari ini?'
  }
  if (/(capek|lelah|burnout|cape)/.test(t)) {
    return 'Wajar banget kalau kamu capek — itu bukan tanda kamu lemah, itu tanda kamu udah berusaha keras. Boleh istirahat sebentar dulu. Mau coba relaxation activity ringan?'
  }
  if (/(deadline|tugas|belum selesai)/.test(t)) {
    return 'Tugas menumpuk memang bikin takut hasilnya belum maksimal. Yuk kita pecah jadi langkah-langkah kecil biar terasa lebih ringan. Tugas mana yang paling mendesak?'
  }
  if (/(sedih|nangis|down|gagal)/.test(t)) {
    return 'Terima kasih sudah cerita ke aku. Perasaan itu valid kok. Kamu nggak harus kuat terus-terusan. Ada yang bisa aku bantu dengarkan lebih lanjut?'
  }
  if (/(cemas|takut|anxious|khawatir)/.test(t)) {
    return 'Rasa cemas itu sinyal dari tubuhmu, bukan musuh. Coba tarik napas 4 hitungan, tahan 4, buang 4. Kita coba bareng-bareng?'
  }
  return 'Makasih udah cerita. Aku di sini dengerin kamu. Mau ceritain lebih lanjut, atau kamu butuh saran aktivitas buat ngerasa lebih baik?'
}

function computeDerived(state) {
  const today = new Date()
  const moodByDay = {}
  state.moods.forEach((m) => {
    const day = m.date.slice(0, 10)
    if (!moodByDay[day]) moodByDay[day] = []
    moodByDay[day].push(m)
  })

  // streak: consecutive days (including today) with at least one mood entry
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (moodByDay[key]) {
      streak++
    } else if (i === 0) {
      continue // today might not be logged yet, don't break streak
    } else {
      break
    }
  }

  const validMinutes = (n) => (Number.isFinite(n) ? n : 0)
  const totalFocusMinutes = state.focusSessions.reduce((sum, s) => sum + validMinutes(s.minutes), 0)
  const todayKey = today.toISOString().slice(0, 10)
  const todayFocusMinutes = state.focusSessions
    .filter((s) => s.date.slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + validMinutes(s.minutes), 0)
  const todaySessionCount = state.focusSessions.filter((s) => s.date.slice(0, 10) === todayKey).length

  const latestMood = state.moods[0]?.mood || null
  const hasCheckedInToday = state.checkIns.some((c) => c.date.slice(0, 10) === todayKey)

  // last 7 days mood trend
  const weekTrend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const dayMoods = moodByDay[key] || []
    const avg = dayMoods.length
      ? dayMoods.reduce((sum, m) => sum + MOOD_SCALE[m.mood], 0) / dayMoods.length
      : null
    weekTrend.push({
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      value: avg,
    })
  }

  const weekFocusMinutes = (() => {
    let total = 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      total += state.focusSessions
        .filter((s) => s.date.slice(0, 10) === key)
        .reduce((sum, s) => sum + validMinutes(s.minutes), 0)
    }
    return total
  })()

  const monthFocusMinutes = (() => {
    let total = 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      total += state.focusSessions
        .filter((s) => s.date.slice(0, 10) === key)
        .reduce((sum, s) => sum + validMinutes(s.minutes), 0)
    }
    return total
  })()

  const avgFocusMinutesPerDay = Math.round(weekFocusMinutes / 7)

  return {
    streak,
    totalFocusMinutes,
    todayFocusMinutes,
    todaySessionCount,
    latestMood,
    weekTrend,
    weekFocusMinutes,
    monthFocusMinutes,
    avgFocusMinutesPerDay,
    hasCheckedInToday,
    focusSessionCountWeek: state.focusSessions.filter((s) => {
      const d = new Date(s.date)
      return (today - d) / (1000 * 60 * 60 * 24) <= 7
    }).length,
  }
}

export const MOOD_META = {
  great: { emoji: '🤩', label: 'Great', color: '#22C55E' },
  good: { emoji: '🙂', label: 'Good', color: '#0B8570' },
  okay: { emoji: '😐', label: 'Okay', color: '#F5A524' },
  bad: { emoji: '😔', label: 'Bad', color: '#F4735A' },
  awful: { emoji: '😣', label: 'Awful', color: '#E85C42' },
}
