import { describe, it, expect } from 'vitest'
import {
  evaluate,
  readLock,
  writeLock,
  fmt,
  QUESTIONS,
  MAX_SCORE,
  LOCK_SCORE,
  LOCK_KEY,
} from '../LearningReadiness.jsx'

// Helper: bikin objek jawaban dari 4 angka, urut sesuai QUESTIONS
// (energy, calm, clarity, setup).
const answersOf = (...values) =>
  QUESTIONS.reduce((acc, q, i) => ({ ...acc, [q.key]: values[i] }), {})

describe('evaluate() — happy path', () => {
  it('skor sempurna (20) -> siap, tanpa istirahat', () => {
    const r = evaluate(answersOf(5, 5, 5, 5))
    expect(r.total).toBe(20)
    expect(r.total).toBe(MAX_SCORE)
    expect(r.ready).toBe(true)
    expect(r.locked).toBe(false)
    expect(r.restMinutes).toBe(0)
    expect(r.weak).toEqual([])
  })

  it('skor pas di ambang siap (14) dengan semua jawaban >= 2 -> siap', () => {
    const r = evaluate(answersOf(5, 5, 2, 2))
    expect(r.total).toBe(14)
    expect(r.ready).toBe(true)
    expect(r.restMinutes).toBe(0)
  })
})

describe('evaluate() — zona istirahat 5 menit (10..13)', () => {
  it('skor 13 -> belum siap, istirahat 5 menit, tidak terkunci', () => {
    const r = evaluate(answersOf(4, 3, 3, 3))
    expect(r.total).toBe(13)
    expect(r.ready).toBe(false)
    expect(r.locked).toBe(false)
    expect(r.restMinutes).toBe(5)
  })

  it('skor tepat 10 (batas bawah) -> masih tidak terkunci', () => {
    const r = evaluate(answersOf(3, 3, 2, 2))
    expect(r.total).toBe(LOCK_SCORE)
    expect(r.locked).toBe(false)
    expect(r.restMinutes).toBe(5)
  })
})

describe('evaluate() — zona terkunci (< 10)', () => {
  it('skor 9 (tepat di bawah ambang) -> terkunci, istirahat 10 menit', () => {
    const r = evaluate(answersOf(3, 2, 2, 2))
    expect(r.total).toBe(9)
    expect(r.ready).toBe(false)
    expect(r.locked).toBe(true)
    expect(r.restMinutes).toBe(10)
  })

  it('skor minimum (4) -> terkunci dan semua aspek masuk daftar lemah', () => {
    const r = evaluate(answersOf(1, 1, 1, 1))
    expect(r.total).toBe(4)
    expect(r.locked).toBe(true)
    expect(r.weak).toHaveLength(QUESTIONS.length)
  })
})

describe('evaluate() — edge case penting', () => {
  it('skor tinggi (15) tapi ada satu jawaban 1 -> TIDAK siap meski total >= 14', () => {
    const r = evaluate(answersOf(5, 5, 4, 1))
    expect(r.total).toBe(15)
    expect(r.ready).toBe(false)
    expect(r.locked).toBe(false)
    expect(r.restMinutes).toBe(5)
  })

  it('jawaban bernilai 2 masuk daftar lemah, jawaban 3 tidak', () => {
    const r = evaluate(answersOf(5, 5, 2, 3))
    const weakKeys = r.weak.map((q) => q.key)
    expect(weakKeys).toContain(QUESTIONS[2].key)
    expect(weakKeys).not.toContain(QUESTIONS[3].key)
  })

  it('setiap item weak membawa tip yang bisa ditampilkan', () => {
    const r = evaluate(answersOf(1, 1, 1, 1))
    r.weak.forEach((q) => {
      expect(typeof q.tip).toBe('string')
      expect(q.tip.length).toBeGreaterThan(0)
    })
  })

  it('jawaban kosong / tidak lengkap dianggap 0, bukan NaN', () => {
    const r = evaluate({})
    expect(Number.isNaN(r.total)).toBe(false)
    expect(r.total).toBe(0)
    expect(r.locked).toBe(true)
    expect(r.restMinutes).toBe(10)
  })

  it('nilai di luar rentang 1-5 dijepit, tidak bisa dipakai memaksa "siap"', () => {
    const r = evaluate(answersOf(999, 999, 999, 999))
    expect(r.total).toBe(MAX_SCORE)
    expect(r.ready).toBe(true)
  })

  it('nilai non-numerik tidak merusak perhitungan', () => {
    const r = evaluate(answersOf('5', null, undefined, 'abc'))
    expect(r.total).toBe(5)
    expect(r.locked).toBe(true)
  })
})

describe('lock persistence', () => {
  it('readLock mengembalikan null kalau belum ada kunci', () => {
    expect(readLock()).toBeNull()
  })

  it('writeLock lalu readLock mengembalikan kunci yang sama', () => {
    const lock = { endsAt: 1234567890, minutes: 10 }
    writeLock(lock)
    expect(readLock()).toEqual(lock)
  })

  it('writeLock(null) menghapus kunci', () => {
    writeLock({ endsAt: 1, minutes: 10 })
    writeLock(null)
    expect(localStorage.getItem(LOCK_KEY)).toBeNull()
    expect(readLock()).toBeNull()
  })

  it('data localStorage yang rusak tidak melempar error, dianggap tidak terkunci', () => {
    localStorage.setItem(LOCK_KEY, '{bukan json')
    expect(() => readLock()).not.toThrow()
    expect(readLock()).toBeNull()
  })
})

describe('fmt()', () => {
  it('memformat mm:ss dengan padding', () => {
    expect(fmt(5 * 60 * 1000)).toBe('05:00')
    expect(fmt(65 * 1000)).toBe('01:05')
    expect(fmt(10 * 60 * 1000)).toBe('10:00')
  })

  it('nilai 0 dan negatif jadi 00:00 (tidak pernah minus)', () => {
    expect(fmt(0)).toBe('00:00')
    expect(fmt(-5000)).toBe('00:00')
  })
})
