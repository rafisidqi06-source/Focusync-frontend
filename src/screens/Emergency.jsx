// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: src/screens/Emergency.jsx
// FIX: Semua tombol fungsional — telepon & website terbuka
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState } from 'react';
import useGoBack from '../hooks/useGoBack.js';

// ── Data layanan darurat ─────────────────────────────────

const RESOURCES = [
  {
    id: 'sejiwa',
    icon: '📞',
    iconBg: '#fee2e2',
    title: 'Layanan Sejiwa (Kemenkes)',
    desc: 'Layanan dukungan psikologis 24 jam, gratis dan rahasia.',
    actions: [
      {
        label: 'Telepon 119 ext 8',
        type: 'phone',
        value: '119',
        displayNumber: '119 ext 8',
      },
    ],
  },
  {
    id: 'itl',
    icon: '🌐',
    iconBg: '#fee2e2',
    title: 'Into The Light Indonesia',
    desc: 'Komunitas pencegahan bunuh diri dengan layanan chat konseling.',
    actions: [
      {
        label: 'Kunjungi Website',
        type: 'url',
        value: 'https://www.intothelightid.org',
      },
      {
        label: 'Into The Light Chat',
        type: 'url',
        value: 'https://www.intothelightid.org/bicara',
        secondary: true,
      },
    ],
  },
  {
    id: 'hotline',
    icon: '🆘',
    iconBg: '#fee2e2',
    title: 'Yayasan Pulih',
    desc: 'Hotline konseling kesehatan jiwa untuk remaja dan dewasa muda.',
    actions: [
      {
        label: 'Telepon (021) 788-42580',
        type: 'phone',
        value: '021788-42580',
      },
    ],
  },
  {
    id: 'campus',
    icon: '💬',
    iconBg: '#fee2e2',
    title: 'Unit Konseling Kampus',
    desc: 'Hubungi layanan konseling mahasiswa di kampusmu.',
    actions: [
      {
        label: 'Cari Kontak Kampus',
        type: 'url',
        value: 'https://www.google.com/search?q=unit+konseling+mahasiswa+kampus+saya',
      },
      {
        label: 'Direktori Konseling Dikti',
        type: 'url',
        value: 'https://pddikti.kemdikbud.go.id',
        secondary: true,
      },
    ],
  },
  {
    id: 'who',
    icon: '🌍',
    iconBg: '#fee2e2',
    title: 'WHO Mental Health',
    desc: 'Sumber daya kesehatan mental global dari WHO.',
    actions: [
      {
        label: 'Kunjungi WHO',
        type: 'url',
        value: 'https://www.who.int/health-topics/mental-health',
      },
    ],
  },
];

// ── Helper: buka URL atau telepon ────────────────────────

function openAction(action) {
  if (action.type === 'phone') {
    window.open(`tel:${action.value}`, '_self');
  } else if (action.type === 'url') {
    window.open(action.value, '_blank', 'noopener,noreferrer');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KOMPONEN UTAMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Emergency({ onBack, navigation }) {
  const smartBack = useGoBack();
  const [confirmAction, setConfirmAction] = useState(null); // untuk konfirmasi telepon

  const goBack = () => {
    if (onBack)                    onBack();
    else if (navigation?.goBack)   navigation.goBack();
    else                           smartBack();
  };

  const handleAction = (action) => {
    if (action.type === 'phone') {
      // Tampilkan konfirmasi dulu sebelum menelepon
      setConfirmAction(action);
    } else {
      openAction(action);
    }
  };

  return (
    <div style={s.wrap}>

      {/* ── Header ── */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={goBack}>‹</button>
        <div>
          <p style={s.headerTitle}>Emergency Help</p>
          <p style={s.headerSub}>Kamu tidak sendirian. Bantuan profesional selalu tersedia</p>
        </div>
      </header>

      {/* ── Banner darurat ── */}
      <div style={s.alertBanner}>
        <span style={s.alertIcon}>⚠️</span>
        <p style={s.alertText}>
          Jika kamu dalam bahaya langsung atau memiliki pikiran untuk menyakiti
          diri sendiri, segera hubungi layanan darurat terdekat atau minta
          seseorang menemanimu sekarang.
        </p>
      </div>

      {/* ── Tombol darurat utama — langsung telepon 119 ── */}
      <button
        style={s.sosBtn}
        onClick={() => setConfirmAction({
          label: 'Telepon 119 ext 8',
          type: 'phone',
          value: '119',
          displayNumber: '119 ext 8',
        })}
      >
        <span style={{ fontSize: 20 }}>📞</span>
        Hubungi Sejiwa Sekarang  119 ext 8
      </button>

      {/* ── Daftar layanan ── */}
      {RESOURCES.map(res => (
        <div key={res.id} style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ ...s.iconBox, background: res.iconBg }}>
              <span style={{ fontSize: 20 }}>{res.icon}</span>
            </div>
            <div style={s.cardMeta}>
              <p style={s.cardTitle}>{res.title}</p>
              <p style={s.cardDesc}>{res.desc}</p>
            </div>
          </div>

          <div style={s.actionRow}>
            {res.actions.map((action, i) => (
              <button
                key={i}
                style={action.secondary ? s.actionBtnSecondary : s.actionBtn}
                onClick={() => handleAction(action)}
              >
                {action.type === 'phone' && <span>📞 </span>}
                {action.type === 'url'   && <span>🔗 </span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ── Footer disclaimer ── */}
      <p style={s.disclaimer}>
        Focusync bukan pengganti layanan medis atau psikologis profesional.
        Untuk kondisi darurat, selalu hubungi layanan kesehatan resmi di daerahmu.
      </p>

      {/* ── Modal konfirmasi telepon ── */}
      {confirmAction && (
        <div style={s.overlay} onClick={() => setConfirmAction(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📞</div>
            <p style={s.modalTitle}>Hubungi Bantuan</p>
            <p style={s.modalDesc}>
              Kamu akan menelepon{' '}
              <strong style={{ color: '#0b6e6a' }}>
                {confirmAction.displayNumber || confirmAction.value}
              </strong>
            </p>
            <div style={s.modalActions}>
              <button
                style={s.cancelBtn}
                onClick={() => setConfirmAction(null)}
              >
                Batal
              </button>
              <button
                style={s.callBtn}
                onClick={() => {
                  openAction(confirmAction);
                  setConfirmAction(null);
                }}
              >
                📞 Telepon Sekarang
              </button>
            </div>
            <p style={s.modalNote}>
              Layanan ini gratis dan rahasia. Kamu aman untuk berbicara.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const s = {
  wrap: {
    padding: '20px',
    maxWidth: 480,
    margin: '0 auto',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    background: '#f0faf8',
    color: '#1a2e2b',
    paddingBottom: 40,
  },

  // Header
  header: {
    display: 'flex', alignItems: 'center',
    gap: 12, marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #d0e8e5',
  },
  backBtn: {
    width: 34, height: 34,
    borderRadius: '50%',
    border: '1px solid #d0e8e5',
    background: '#fff',
    fontSize: 20, cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    color: '#1a2e2b', flexShrink: 0,
  },
  headerTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
  headerSub:   { fontSize: 12, color: '#6b8f8b', margin: '2px 0 0' },

  // Alert banner
  alertBanner: {
    background: '#fff1f1',
    border: '1.5px solid #fca5a5',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 16,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  alertIcon: { fontSize: 18, flexShrink: 0 },
  alertText: {
    fontSize: 13, color: '#b91c1c',
    lineHeight: 1.6, margin: 0, fontWeight: 500,
  },

  // SOS button
  sosBtn: {
    width: '100%',
    padding: '15px 20px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    cursor: 'pointer',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
    letterSpacing: 0.3,
  },

  // Resource card
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px',
    marginBottom: 12,
    border: '1px solid #e0f0ee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex', alignItems: 'flex-start',
    gap: 12, marginBottom: 12,
  },
  iconBox: {
    width: 42, height: 42,
    borderRadius: 10,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardMeta: { flex: 1 },
  cardTitle: {
    fontSize: 14, fontWeight: 700,
    margin: '0 0 3px', color: '#1a2e2b',
  },
  cardDesc: {
    fontSize: 12, color: '#6b8f8b',
    margin: 0, lineHeight: 1.5,
  },
  actionRow: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '7px 14px',
    borderRadius: 20,
    border: '1.5px solid #fca5a5',
    background: '#fff1f1',
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',
  },
  actionBtnSecondary: {
    padding: '7px 14px',
    borderRadius: 20,
    border: '1.5px solid #d0e8e5',
    background: '#f0faf8',
    color: '#0b6e6a',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 11,
    color: '#9bb5b2',
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: 20,
    padding: '0 8px',
  },

  // Modal overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 340,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: 18, fontWeight: 800,
    margin: '0 0 8px', color: '#1a2e2b',
  },
  modalDesc: {
    fontSize: 14, color: '#6b8f8b',
    lineHeight: 1.5, margin: '0 0 20px',
  },
  modalActions: {
    display: 'flex', gap: 10, marginBottom: 14,
  },
  cancelBtn: {
    flex: 1, padding: '11px 0',
    borderRadius: 10,
    border: '1px solid #d0e8e5',
    background: '#f0faf8',
    color: '#6b8f8b',
    fontWeight: 600, fontSize: 14,
    cursor: 'pointer',
  },
  callBtn: {
    flex: 2, padding: '11px 0',
    borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    fontWeight: 700, fontSize: 14,
    cursor: 'pointer',
  },
  modalNote: {
    fontSize: 11, color: '#9bb5b2',
    margin: 0, lineHeight: 1.5,
  },
};
