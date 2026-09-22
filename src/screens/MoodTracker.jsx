// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: src/screens/MoodTracker.jsx
// FIX: Mood hanya bisa disimpan SEKALI per hari
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect } from 'react';
import useGoBack from '../hooks/useGoBack.js';

// ── Helpers ──────────────────────────────────────────────

const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `focusync_mood_${y}-${m}-${day}`;
};

const DAYS_ID  = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const formatDate = (date) =>
  `${date.getDate()} ${MONTHS_ID[date.getMonth()]}`;

// Ambil 7 hari terakhir (Minggu s/d hari ini)
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
};

// ── Mood config ───────────────────────────────────────────

const MOODS = [
  { key: 'Great', emoji: '🤩', color: '#a855f7' },
  { key: 'Good',  emoji: '😊', color: '#22c55e' },
  { key: 'Okay',  emoji: '😐', color: '#f59e0b' },
  { key: 'Bad',   emoji: '😞', color: '#f97316' },
  { key: 'Awful', emoji: '😠', color: '#ef4444' },
];

const getMoodConfig = (key) =>
  MOODS.find(m => m.key === key) || MOODS[1];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KOMPONEN UTAMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MoodTracker({ onBack, navigation }) {
  const smartBack = useGoBack();
  const [loading,      setLoading]      = useState(true);
  const [todayMood,    setTodayMood]    = useState(null);  // mood yg sudah disimpan hari ini
  const [selectedMood, setSelectedMood] = useState(null);  // pilihan saat mengisi form
  const [note,         setNote]         = useState('');
  const [history,      setHistory]      = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [justSaved,    setJustSaved]    = useState(false);

  const week = getLast7Days();

  // ── Mount: cek apakah sudah isi mood hari ini ──────────
  useEffect(() => {
    const todayKey = getTodayKey();
    const saved    = localStorage.getItem(todayKey);

    if (saved) {
      // Sudah ada mood hari ini — parse data yang tersimpan
      try {
        const parsed = JSON.parse(saved);
        setTodayMood(parsed);
      } catch {
        setTodayMood({ mood: saved, note: '' });
      }
    }

    loadHistory();
    setLoading(false);
  }, []);

  // ── Load riwayat dari API atau localStorage ────────────
  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('focusync_token');
      if (token) {
        const res = await fetch('/api/mood', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data || []);
          return;
        }
      }
    } catch (_) {}

    // Fallback: baca dari localStorage
    const localHistory = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y  = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      const key = `focusync_mood_${y}-${mo}-${dy}`;
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          localHistory.push({ ...parsed, timestamp: d.toISOString() });
        } catch {
          localHistory.push({ mood: val, note: '', timestamp: d.toISOString() });
        }
      }
    }
    setHistory(localHistory);
  };

  // ── Simpan mood ────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);

    const entry = { mood: selectedMood, note };

    // 1. Simpan ke localStorage (kunci hari ini)
    localStorage.setItem(getTodayKey(), JSON.stringify(entry));

    // 2. Kirim ke backend kalau ada
    try {
      const token = localStorage.getItem('focusync_token');
      if (token) {
        await fetch('/api/mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(entry),
        });
      }
    } catch (_) {}

    // 3. Update state
    setTodayMood(entry);
    setJustSaved(true);
    setSaving(false);
    loadHistory();
  };

  // ── Helper navigasi ────────────────────────────────────
  const goBack = () => {
    if (onBack)                     onBack();
    else if (navigation?.goBack)    navigation.goBack();
    else                           smartBack();
  };

  // Cari mood di history untuk setiap hari di minggu ini
  const getMoodForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return history.find(h => {
      const hDate = new Date(h.timestamp || h.createdAt);
      const hStr  = `${hDate.getFullYear()}-${String(hDate.getMonth()+1).padStart(2,'0')}-${String(hDate.getDate()).padStart(2,'0')}`;
      return hStr === dateStr;
    });
  };

  // ─────────────── LOADING ────────────────────────────────
  if (loading) {
    return (
      <div style={s.wrap}>
        <div style={s.center}>
          <div style={s.spinner} />
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER UTAMA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={s.wrap}>

      {/* ── Header ── */}
      <header style={s.header}>
        <button style={s.backBtn} onClick={goBack}>‹</button>
        <div>
          <p style={s.headerTitle}>Mood Tracker</p>
          <p style={s.headerSub}>Kenali pola suasana hatimu</p>
        </div>
      </header>

      {/* ── Kalender mingguan ── */}
      <div style={s.weekRow}>
        {week.map((d, i) => {
          const isToday   = i === 6;
          const moodEntry = getMoodForDate(d);
          const cfg       = moodEntry ? getMoodConfig(moodEntry.mood) : null;

          return (
            <div key={i} style={s.dayCol}>
              <span style={s.dayName}>{DAYS_ID[d.getDay()]}</span>
              <div style={{
                ...s.dayCircle,
                ...(isToday ? s.dayCircleToday : {}),
                background: cfg ? `${cfg.color}25` : (isToday ? '#0ECFC0' : 'transparent'),
                border: cfg ? `2px solid ${cfg.color}60` : (isToday ? 'none' : '2px solid #d0e8e5'),
              }}>
                {cfg
                  ? <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
                  : <span style={{ fontSize: 12, color: isToday ? '#fff' : '#6b8f8b', fontWeight: isToday ? 700 : 400 }}>
                      {d.getDate()}
                    </span>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Banner sudah isi / form ── */}
      {todayMood ? (
        /* ── SUDAH ISI HARI INI ── */
        <div style={s.doneBanner}>
          <div style={s.doneMoodRow}>
            <span style={{ fontSize: 44 }}>{getMoodConfig(todayMood.mood).emoji}</span>
            <div>
              <p style={s.doneMoodLabel}>Mood hari ini</p>
              <p style={{ ...s.doneMoodVal, color: getMoodConfig(todayMood.mood).color }}>
                {todayMood.mood}
              </p>
              {todayMood.note
                ? <p style={s.doneNote}>"{todayMood.note}"</p>
                : null
              }
            </div>
          </div>

          {justSaved && (
            <div style={s.savedChip}>✅ Mood tersimpan!</div>
          )}

          <div style={s.lockInfo}>
            🔒 Kamu sudah mencatat mood hari ini.<br />
            <span style={{ color: '#0b6e6a', fontWeight: 700 }}>
              Bisa diubah lagi besok!
            </span>
          </div>

          {/* Countdown ke besok */}
          <MidnightCountdown />
        </div>
      ) : (
        /* ── FORM ISI MOOD ── */
        <div style={s.formCard}>
          <p style={s.formQuestion}>Bagaimana perasaanmu hari ini?</p>

          <div style={s.moodRow}>
            {MOODS.map(m => (
              <button
                key={m.key}
                style={{
                  ...s.moodBtn,
                  ...(selectedMood === m.key ? {
                    background: `${m.color}20`,
                    border: `2.5px solid ${m.color}`,
                  } : {}),
                }}
                onClick={() => setSelectedMood(m.key)}
              >
                <span style={{ fontSize: 30 }}>{m.emoji}</span>
                <span style={{
                  fontSize: 11,
                  color: selectedMood === m.key ? m.color : '#6b8f8b',
                  fontWeight: selectedMood === m.key ? 700 : 400,
                }}>
                  {m.key}
                </span>
              </button>
            ))}
          </div>

          <p style={s.noteLabel}>Catatan (Opsional)</p>
          <textarea
            style={s.textarea}
            placeholder="Hari ini kurang produktif, tapi masih merasa sedikit cemas soal deadline."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
          />

          <button
            style={{
              ...s.saveBtn,
              opacity: selectedMood && !saving ? 1 : 0.5,
            }}
            disabled={!selectedMood || saving}
            onClick={handleSave}
          >
            {saving ? 'Menyimpan...' : 'Simpan Mood'}
          </button>
        </div>
      )}

      {/* ── Riwayat ── */}
      <div style={s.historySection}>
        <p style={s.historyTitle}>Riwayat Terbaru</p>
        {history.length === 0 ? (
          <p style={s.emptyText}>Belum ada riwayat mood.</p>
        ) : (
          /* Tampilkan hanya 1 entri per hari (entry pertama per tanggal) */
          deduplicateByDate(history).slice(0, 10).map((h, i) => {
            const cfg  = getMoodConfig(h.mood);
            const date = new Date(h.timestamp || h.createdAt);
            return (
              <div key={i} style={s.historyItem}>
                <span style={{ fontSize: 22 }}>{cfg.emoji}</span>
                <span style={{ ...s.historyMood, color: cfg.color }}>{h.mood}</span>
                {h.note ? <span style={s.historyNote}>{h.note}</span> : null}
                <span style={s.historyDate}>{formatDate(date)}</span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-KOMPONEN: Hitung mundur ke tengah malam
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MidnightCountdown() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now  = new Date();
      const next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const diff = next - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={s.countdown}>
      <span style={s.countdownLabel}>Bisa isi mood baru dalam  </span>
      <span style={s.countdownTime}>{time}</span>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: hapus duplikat — 1 entri per tanggal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function deduplicateByDate(list) {
  const seen = new Set();
  return list.filter(h => {
    const d    = new Date(h.timestamp || h.createdAt);
    const key  = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TEAL = '#0ECFC0';
const GRAD = 'linear-gradient(135deg, #0ECFC0, #22C55E)';

const s = {
  wrap: {
    padding: '20px',
    maxWidth: 480,
    margin: '0 auto',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    background: '#f0faf8',
    color: '#1a2e2b',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: 36, height: 36,
    border: '3px solid #e0f2f0',
    borderTop: `3px solid ${TEAL}`,
    borderRadius: '50%',
  },

  // Header
  header: {
    display: 'flex', alignItems: 'center',
    gap: 12, marginBottom: 20,
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

  // Week row
  weekRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    background: '#fff',
    borderRadius: 14,
    padding: '14px 10px',
    border: '1px solid #e0f0ee',
  },
  dayCol: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
  },
  dayName: { fontSize: 11, color: '#6b8f8b' },
  dayCircle: {
    width: 36, height: 36,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    background: TEAL,
  },

  // Done banner
  doneBanner: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 20,
    border: '1px solid #e0f0ee',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  doneMoodRow: {
    display: 'flex', alignItems: 'center',
    gap: 16, marginBottom: 14,
  },
  doneMoodLabel: {
    fontSize: 12, color: '#6b8f8b', margin: '0 0 3px',
  },
  doneMoodVal: {
    fontSize: 20, fontWeight: 800, margin: 0,
  },
  doneNote: {
    fontSize: 13, color: '#6b8f8b',
    fontStyle: 'italic', margin: '4px 0 0',
  },
  savedChip: {
    background: '#22c55e18',
    color: '#15803d',
    border: '1px solid #22c55e40',
    borderRadius: 20,
    padding: '5px 14px',
    fontSize: 13, fontWeight: 600,
    display: 'inline-block',
    marginBottom: 12,
  },
  lockInfo: {
    background: '#f0faf8',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 13, color: '#6b8f8b',
    lineHeight: 1.6,
    marginBottom: 12,
    border: '1px solid #d0e8e5',
  },
  countdown: {
    display: 'flex', alignItems: 'center',
    gap: 6, flexWrap: 'wrap',
  },
  countdownLabel: { fontSize: 12, color: '#6b8f8b' },
  countdownTime: {
    fontSize: 16, fontWeight: 800,
    color: TEAL, fontFamily: 'monospace',
    letterSpacing: 1,
  },

  // Form card
  formCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 20,
    border: '1px solid #e0f0ee',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  },
  formQuestion: {
    fontSize: 15, fontWeight: 700,
    marginBottom: 16, color: '#1a2e2b',
  },
  moodRow: {
    display: 'flex', gap: 6,
    marginBottom: 16,
  },
  moodBtn: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 5,
    padding: '10px 4px',
    borderRadius: 12,
    border: '2px solid #e0f0ee',
    background: '#f7fffe',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  noteLabel: {
    fontSize: 12, color: '#6b8f8b',
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 10,
    border: `1.5px solid ${TEAL}40`,
    background: '#f7fffe',
    fontSize: 14, color: '#1a2e2b',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  saveBtn: {
    width: '100%', padding: '13px 24px',
    borderRadius: 28, border: 'none',
    background: GRAD, color: '#fff',
    fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'opacity .2s',
  },

  // History
  historySection: { marginTop: 4 },
  historyTitle: {
    fontSize: 15, fontWeight: 700,
    marginBottom: 12, color: '#1a2e2b',
  },
  historyItem: {
    display: 'flex', alignItems: 'center',
    gap: 10, background: '#fff',
    borderRadius: 12, padding: '13px 14px',
    marginBottom: 8,
    border: '1px solid #e0f0ee',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  historyMood: {
    fontWeight: 700, fontSize: 14,
  },
  historyNote: {
    fontSize: 12, color: '#6b8f8b',
    flex: 1, overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  historyDate: {
    fontSize: 12, color: '#6b8f8b',
    marginLeft: 'auto', flexShrink: 0,
  },
  emptyText: { color: '#6b8f8b', fontSize: 14 },
};

// Inject spinner animation
if (typeof document !== 'undefined' && !document.getElementById('fs-spin')) {
  const el = document.createElement('style');
  el.id = 'fs-spin';
  el.textContent = `@keyframes spin { to { transform: rotate(360deg) } }
    div[style*="border-top"] { animation: spin 1s linear infinite; }`;
  document.head.appendChild(el);
}
