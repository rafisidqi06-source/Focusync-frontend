import { useEffect, useState } from 'react'

// Breakpoint: di bawah 1024px dianggap "mobile" (HP/tablet kecil),
// di atas itu dianggap "desktop". Otomatis update saat window di-resize.
const BREAKPOINT = 1024

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT : false
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    handler(mq)
    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      // fallback browser lama
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }
  }, [])

  return isMobile
}
