# Testing — Learning Readiness → Focus Timer

## Cara menjalankan

```bash
npm install          # menarik vitest, jsdom, @testing-library/*
npm test             # sekali jalan
npm run test:watch   # mode watch
```

## Yang berubah di kode aplikasi

`src/components/LearningReadiness.jsx`:

- `QUESTIONS`, `MAX_SCORE`, `LOCK_SCORE`, `LOCK_KEY`, `evaluate()`, `readLock()`,
  `writeLock()`, dan `fmt()` sekarang di-`export` supaya bisa diuji langsung.
  Default export (komponennya) tidak berubah.
- Tambahan konstanta `READY_SCORE` (14) dan `MIN_ANSWER_FOR_READY` (2) supaya
  ambang batas tidak lagi jadi angka ajaib di dalam `evaluate()`.
- `evaluate()` sekarang menormalkan jawaban: nilai kosong/non-numerik dianggap 0
  dan nilai di luar 1–5 dijepit. Sebelumnya jawaban yang belum lengkap
  menghasilkan `NaN` pada `total`, yang bikin `locked` jadi `false` —
  artinya gerbangnya bisa jebol. Tombol submit memang sudah di-disable, tapi
  ini jaring pengaman kalau `evaluate()` dipanggil dari tempat lain.

Tidak ada perubahan perilaku lain.

## Berkas test

| Berkas | Isi |
| --- | --- |
| `src/components/__tests__/readiness-logic.test.js` | Murni logika: ambang 14/10, jawaban ≤1 membatalkan "siap", daftar aspek lemah, lock di localStorage, format mm:ss |
| `src/components/__tests__/LearningReadiness.test.jsx` | Alur komponen: submit disabled, layar siap, istirahat 5 vs 10 menit, hitung mundur, kunci bertahan setelah refresh |
| `src/screens/__tests__/FocusTimerDesktop.gating.test.jsx` | Gerbangnya sendiri: timer tertutup sebelum cek kesiapan, terbuka setelah lolos, tetap tertutup saat skor <10, mode break tidak ikut terkunci |

## Edge case yang sengaja diuji

- Skor **tepat 14** dengan jawaban terendah 2 → siap.
- Skor **15 tapi ada jawaban 1** → tidak siap (aturan `min >= 2`).
- Skor **tepat 10** → tidak terkunci, istirahat 5 menit.
- Skor **9** → terkunci, istirahat 10 menit, tidak ada jalan pintas "isi ulang".
- Setelah istirahat 10 menit selesai → hanya boleh cek ulang, `onReady` tidak
  pernah terpanggil.
- Kunci di `localStorage` masih berlaku saat halaman dibuka ulang.
- `localStorage` berisi JSON rusak → tidak crash, dianggap tidak terkunci.

## Catatan

`src/screens/FocusTimer.jsx` (versi lama) sama sekali tidak memakai
`LearningReadiness`, jadi gerbangnya bisa dilewati kalau file itu dipakai lagi.
Saat ini `App.jsx` hanya me-route ke `FocusTimerDesktop`, jadi belum jadi
masalah — tapi sebaiknya file lama itu dihapus atau ikut digerbangi.
