import { useNavigate, useLocation } from 'react-router-dom'

// Tombol "kembali" yang selalu jalan:
//  - kalau ada halaman sebelumnya di riwayat -> mundur satu langkah
//  - kalau tidak ada (mis. halaman dibuka langsung / di-refresh) -> ke halaman fallback
export default function useGoBack(fallback = '/') {
  const navigate = useNavigate()
  const location = useLocation()
  return () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(fallback, { replace: true })
  }
}
