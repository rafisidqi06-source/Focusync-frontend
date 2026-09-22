import React, { useEffect, useState } from 'react'
import { Smartphone, Monitor } from 'lucide-react'

// ─── Preview Mode HP (khusus development, sebelum web di-launch) ──────────────
// Kenapa pakai <iframe>, bukan cuma diperkecil pakai CSS?
// Breakpoint Tailwind (lg:, md:, dst) itu ngecek LEBAR VIEWPORT ASLI browser,
// bukan lebar sebuah <div>. Kalau cuma di-scale/zoom pakai CSS, sidebar desktop
// tetap akan muncul karena viewport-nya masih lebar. Dengan <iframe> lebar 390px,
// halaman di dalamnya punya viewport sendiri yang beneran sempit — jadi semua
// class lg:hidden / lg:flex ke-trigger persis seperti di HP asli.
//
// Data tetap sinkron karena iframe ini satu origin dengan halaman utama,
// jadi localStorage-nya sama-sama dibaca dari sumber yang sama.
//
// CATATAN: ini alat bantu development. Boleh dihapus (hapus pemanggilan
// <DevicePreview> di main.jsx) begitu web sudah di-launch, karena di HP asli
// tampilan mobile-nya sudah otomatis muncul tanpa alat ini.
export default function DevicePreview({ children }) {
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top
  const [active, setActive] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('fs_devpreview_mobile') === '1'
  })

  useEffect(() => {
    if (!isEmbedded) {
      localStorage.setItem('fs_devpreview_mobile', active ? '1' : '0')
    }
  }, [active, isEmbedded])

  // Di dalam iframe preview: render app apa adanya, jangan tampilkan toggle lagi
  if (isEmbedded) {
    return children
  }

  if (!active) {
    return (
      <>
        {children}
        <button
          onClick={() => setActive(true)}
          className="fixed bottom-5 right-5 z-[999] flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl hover:bg-slate-800 transition"
        >
          <Smartphone size={16} />
          Preview Tampilan HP
        </button>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-slate-800 p-6">
      <button
        onClick={() => setActive(false)}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-100 transition"
      >
        <Monitor size={16} />
        Kembali ke Tampilan Desktop
      </button>
      <div className="overflow-hidden rounded-[2.5rem] border-[8px] border-slate-950 bg-slate-950 shadow-2xl">
        {/* notch atas — simulasi status bar HP, kasih jarak biar konten ga mentok */}
        <div className="flex items-center justify-center bg-slate-950 py-2.5">
          <div className="h-1.5 w-16 rounded-full bg-slate-700" />
        </div>

        <iframe
          key={active}
          title="Preview HP"
          src={window.location.href}
          style={{ width: 390, height: 740, border: 'none', display: 'block' }}
        />

        {/* home indicator bawah — simulasi gesture bar HP */}
        <div className="flex items-center justify-center bg-slate-950 py-2.5">
          <div className="h-1 w-28 rounded-full bg-slate-600" />
        </div>
      </div>
      <p className="text-xs text-white/50">390 × 780px — kira-kira ukuran layar HP standar</p>
    </div>
  )
}
