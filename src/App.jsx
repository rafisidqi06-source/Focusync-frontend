import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAppState } from './state/store.jsx'
import DesktopLayout from './layout/DesktopLayout'
import AuthDesktop from './screens/AuthDesktop'
import HomeDesktop from './screens/HomeDesktop'
import FocusTimerDesktop from './screens/FocusTimerDesktop'
import StatistikDesktop from './screens/StatistikDesktop'
import CommunityDesktop from './screens/CommunityDesktop'
import ChatDesktop from './screens/ChatDesktop'
import ProfileDesktop from './screens/ProfileDesktop'
import CheckIn from './screens/CheckIn'
import MoodTracker from './screens/MoodTracker'
import Emergency from './screens/Emergency'
import TodoPlanner from './screens/TodoPlanner'

export default function App() {
  const { state } = useAppState()

  if (!state.onboarded) {
    return <AuthDesktop />
  }

  // Satu set layar untuk semua ukuran layar — otomatis menyesuaikan
  // (sidebar & grid berubah jadi versi HP sendiri lewat class lg: di Tailwind,
  // tidak perlu toggle manual lagi).
  return (
    <DesktopLayout>
      <Routes>
        <Route path="/" element={<HomeDesktop />} />
        <Route path="/fokus" element={<FocusTimerDesktop />} />
        <Route path="/statistik" element={<StatistikDesktop />} />
        <Route path="/community" element={<CommunityDesktop />} />
        <Route path="/chat" element={<ChatDesktop />} />
        <Route path="/profil" element={<ProfileDesktop />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/todo" element={<TodoPlanner />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/emergency" element={<Emergency />} />
        {/* Pages lain bisa ditambah di sini */}
      </Routes>
    </DesktopLayout>
  )
}
