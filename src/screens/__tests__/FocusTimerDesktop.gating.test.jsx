import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../../state/store.jsx'
import FocusTimerDesktop from '../FocusTimerDesktop.jsx'
import { QUESTIONS, LOCK_KEY } from '../../components/LearningReadiness.jsx'

function renderTimer() {
  render(
    <MemoryRouter>
      <AppStateProvider>
        <FocusTimerDesktop />
      </AppStateProvider>
    </MemoryRouter>
  )
}

function answerAll(values) {
  values.forEach((v, i) => {
    const card = screen.getByText(QUESTIONS[i].ask).closest('div')
    fireEvent.click(within(card).getByRole('button', { name: String(v) }))
  })
  fireEvent.click(screen.getByRole('button', { name: /cek kesiapanku/i }))
}

const timerUnlocked = () => screen.queryByText(/kesiapan belajar terkonfirmasi/i)

describe('FocusTimerDesktop — gerbang Learning Readiness', () => {
  it('mode fokus dimulai dengan cek kesiapan, bukan timer', () => {
    renderTimer()
    expect(screen.getByText(/sudah siap belajar/i)).toBeInTheDocument()
    expect(timerUnlocked()).not.toBeInTheDocument()
  })

  it('judul halaman "Learning Readiness" selama gerbang belum lolos', () => {
    renderTimer()
    expect(screen.getByRole('heading', { name: /^learning readiness$/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^focus timer$/i })).not.toBeInTheDocument()
  })

  it('skor siap -> timer terbuka setelah klik lanjut, judul berganti jadi "Focus Timer"', () => {
    renderTimer()
    answerAll([5, 5, 5, 5])
    fireEvent.click(screen.getByRole('button', { name: /lanjut ke focus timer/i }))

    expect(timerUnlocked()).toBeInTheDocument()
    expect(screen.queryByText(/sudah siap belajar/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^focus timer$/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /^learning readiness$/i })).not.toBeInTheDocument()
  })

  it('judul kembali "Learning Readiness" saat klik "Cek ulang"', () => {
    renderTimer()
    answerAll([5, 5, 5, 5])
    fireEvent.click(screen.getByRole('button', { name: /lanjut ke focus timer/i }))
    fireEvent.click(screen.getByRole('button', { name: /^cek ulang$/i }))

    expect(screen.getByRole('heading', { name: /^learning readiness$/i })).toBeInTheDocument()
  })

  it('skor terkunci -> timer tetap tertutup', () => {
    renderTimer()
    answerAll([2, 2, 2, 2]) // total 8

    expect(screen.getByText(/belum bisa dibuka/i)).toBeInTheDocument()
    expect(timerUnlocked()).not.toBeInTheDocument()
  })

  it('kunci dari sesi sebelumnya langsung menutup timer saat halaman dibuka', () => {
    localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ endsAt: Date.now() + 5 * 60 * 1000, minutes: 10 })
    )
    renderTimer()

    expect(screen.getByText(/waktu istirahat/i)).toBeInTheDocument()
    expect(timerUnlocked()).not.toBeInTheDocument()
  })

  it('mode break tidak ikut terkunci (istirahat boleh kapan saja)', () => {
    renderTimer()
    fireEvent.click(screen.getByRole('button', { name: /break/i }))

    expect(screen.queryByText(/sudah siap belajar/i)).not.toBeInTheDocument()
  })

  it('tombol "Cek ulang" mengunci lagi mode fokus', () => {
    renderTimer()
    answerAll([5, 5, 5, 5])
    fireEvent.click(screen.getByRole('button', { name: /lanjut ke focus timer/i }))
    expect(timerUnlocked()).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^cek ulang$/i }))
    expect(screen.getByText(/sudah siap belajar/i)).toBeInTheDocument()
    expect(timerUnlocked()).not.toBeInTheDocument()
  })
})
