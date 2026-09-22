import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearningReadiness, { QUESTIONS, LOCK_KEY } from '../LearningReadiness.jsx'

function renderReadiness(props = {}) {
  const onReady = props.onReady ?? vi.fn()
  render(
    <MemoryRouter>
      <LearningReadiness onReady={onReady} />
    </MemoryRouter>
  )
  return { onReady }
}

// Jawab satu pertanyaan (dicari lewat teks pertanyaannya, bukan urutan DOM).
function answer(questionIndex, value) {
  const q = QUESTIONS[questionIndex]
  const card = screen.getByText(q.ask).closest('div')
  fireEvent.click(within(card).getByRole('button', { name: String(value) }))
}

// values: [energy, calm, clarity, setup]
function answerAll(values) {
  values.forEach((v, i) => answer(i, v))
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /cek kesiapanku/i }))
}

describe('LearningReadiness — fase check', () => {
  it('menampilkan keempat pertanyaan', () => {
    renderReadiness()
    QUESTIONS.forEach((q) => expect(screen.getByText(q.ask)).toBeInTheDocument())
  })

  it('tombol submit disabled sampai semua pertanyaan dijawab', () => {
    renderReadiness()
    const btn = screen.getByRole('button', { name: /cek kesiapanku/i })
    expect(btn).toBeDisabled()

    answerAll([5, 5, 5])
    expect(btn).toBeDisabled()

    answer(3, 5)
    expect(btn).toBeEnabled()
  })
})

describe('LearningReadiness — happy path (siap belajar)', () => {
  it('skor 20 -> layar siap, dan tombol lanjut memanggil onReady', () => {
    const { onReady } = renderReadiness()
    answerAll([5, 5, 5, 5])
    submit()

    expect(screen.getByText(/kamu siap belajar/i)).toBeInTheDocument()
    expect(screen.getByText('20/20')).toBeInTheDocument()
    expect(onReady).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /lanjut ke focus timer/i }))
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('tidak menulis kunci ke localStorage saat skor aman', () => {
    renderReadiness()
    answerAll([5, 5, 5, 5])
    submit()
    expect(localStorage.getItem(LOCK_KEY)).toBeNull()
  })
})

describe('LearningReadiness — skor 10-13 (istirahat 5 menit, tidak terkunci)', () => {
  it('menawarkan istirahat 5 menit dan opsi isi ulang jawaban', () => {
    renderReadiness()
    answerAll([4, 3, 3, 3]) // total 13
    submit()

    expect(screen.getByText(/istirahat dulu ya/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mulai istirahat 5 menit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /isi ulang/i })).toBeInTheDocument()
    expect(screen.queryByText(/belum bisa dibuka/i)).not.toBeInTheDocument()
  })

  it('menampilkan tip untuk aspek yang lemah saja', () => {
    renderReadiness()
    answerAll([5, 5, 2, 1]) // clarity & setup lemah
    submit()

    expect(screen.getByText(QUESTIONS[2].tip, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(QUESTIONS[3].tip, { exact: false })).toBeInTheDocument()
    expect(screen.queryByText(QUESTIONS[0].tip, { exact: false })).not.toBeInTheDocument()
  })

  it('tidak menulis kunci ke localStorage', () => {
    renderReadiness()
    answerAll([4, 3, 3, 3])
    submit()
    fireEvent.click(screen.getByRole('button', { name: /mulai istirahat 5 menit/i }))
    expect(localStorage.getItem(LOCK_KEY)).toBeNull()
  })
})

describe('LearningReadiness — skor < 10 (terkunci)', () => {
  it('memberi tahu timer belum bisa dibuka dan istirahat 10 menit', () => {
    renderReadiness()
    answerAll([3, 2, 2, 2]) // total 9
    submit()

    expect(screen.getByText(/belum bisa dibuka/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mulai istirahat 10 menit/i })).toBeInTheDocument()
    // Saat terkunci, jalan pintas "isi ulang" tidak boleh ada.
    expect(screen.queryByRole('button', { name: /isi ulang/i })).not.toBeInTheDocument()
  })

  it('menyimpan kunci ke localStorage saat istirahat dimulai', () => {
    renderReadiness()
    answerAll([3, 2, 2, 2])
    submit()
    fireEvent.click(screen.getByRole('button', { name: /mulai istirahat 10 menit/i }))

    const lock = JSON.parse(localStorage.getItem(LOCK_KEY))
    expect(lock.minutes).toBe(10)
    expect(lock.endsAt).toBeGreaterThan(Date.now())
  })
})

describe('LearningReadiness — hitung mundur istirahat', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('istirahat 5 menit selesai -> boleh langsung mulai fokus', () => {
    const { onReady } = renderReadiness()
    answerAll([4, 3, 3, 3])
    submit()
    fireEvent.click(screen.getByRole('button', { name: /mulai istirahat 5 menit/i }))

    expect(screen.getByText('05:00')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(60 * 1000) })
    expect(screen.getByText('04:00')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(4 * 60 * 1000 + 1000) })
    expect(screen.getByText(/istirahat selesai/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /mulai fokus/i }))
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('istirahat 10 menit (terkunci) selesai -> WAJIB cek ulang, tidak bisa ke timer', () => {
    const { onReady } = renderReadiness()
    answerAll([3, 2, 2, 2])
    submit()
    fireEvent.click(screen.getByRole('button', { name: /mulai istirahat 10 menit/i }))

    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText(/focus timer terkunci/i)).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(10 * 60 * 1000 + 1000) })

    expect(screen.getByRole('button', { name: /cek ulang kesiapan/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^mulai fokus$/i })).not.toBeInTheDocument()
    expect(onReady).not.toHaveBeenCalled()
  })

  it('saat terkunci, tidak ada tombol lompat cek ulang di tengah istirahat', () => {
    renderReadiness()
    answerAll([3, 2, 2, 2])
    submit()
    fireEvent.click(screen.getByRole('button', { name: /mulai istirahat 10 menit/i }))

    act(() => { vi.advanceTimersByTime(30 * 1000) })
    expect(screen.queryByRole('button', { name: /cek ulang kesiapan/i })).not.toBeInTheDocument()
  })
})

describe('LearningReadiness — kunci bertahan setelah refresh', () => {
  it('kunci masih aktif -> langsung masuk mode istirahat, bukan form', () => {
    localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ endsAt: Date.now() + 6 * 60 * 1000, minutes: 10 })
    )
    const { onReady } = renderReadiness()

    expect(screen.queryByText(QUESTIONS[0].ask)).not.toBeInTheDocument()
    expect(screen.getByText(/waktu istirahat/i)).toBeInTheDocument()
    expect(screen.getByText(/focus timer terkunci/i)).toBeInTheDocument()
    expect(onReady).not.toHaveBeenCalled()
  })

  it('kunci sudah lewat -> diminta cek ulang, bukan langsung ke timer', () => {
    localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ endsAt: Date.now() - 1000, minutes: 10 })
    )
    const { onReady } = renderReadiness()

    expect(screen.getByRole('button', { name: /cek ulang kesiapan/i })).toBeInTheDocument()
    expect(onReady).not.toHaveBeenCalled()
  })

  it('cek ulang dengan skor >= 10 melepas kunci dari localStorage', () => {
    localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ endsAt: Date.now() - 1000, minutes: 10 })
    )
    renderReadiness()
    fireEvent.click(screen.getByRole('button', { name: /cek ulang kesiapan/i }))

    answerAll([3, 3, 2, 2]) // total 10, tepat di ambang
    submit()

    expect(localStorage.getItem(LOCK_KEY)).toBeNull()
    expect(screen.queryByText(/belum bisa dibuka/i)).not.toBeInTheDocument()
  })

  it('cek ulang yang masih < 10 mempertahankan status terkunci', () => {
    localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ endsAt: Date.now() - 1000, minutes: 10 })
    )
    renderReadiness()
    fireEvent.click(screen.getByRole('button', { name: /cek ulang kesiapan/i }))

    answerAll([2, 2, 2, 2]) // total 8
    submit()

    expect(screen.getByText(/belum bisa dibuka/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mulai istirahat 10 menit/i })).toBeInTheDocument()
  })

  it('localStorage rusak tidak bikin crash, form tetap tampil', () => {
    localStorage.setItem(LOCK_KEY, 'bukan-json')
    renderReadiness()
    expect(screen.getByText(QUESTIONS[0].ask)).toBeInTheDocument()
  })
})
