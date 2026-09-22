// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: src/screens/CheckIn.jsx
// FIX: Hanya bisa diisi SEKALI per hari
// NEW: Langkah terakhir berisi To-Do Planner (hari ini / besok)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, localDateKey } from '../state/store.jsx';
import useGoBack from '../hooks/useGoBack.js';

// ── Key localStorage berdasarkan tanggal hari ini ──
const getTodayKey = () => {
  const d = new Date();
  return `focusync_checkin_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getTodayFormatted = () =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

// ── Countdown ke tengah malam ──
function NextCheckInCountdown() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now      = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={s.countdown}>
      <p style={s.countdownLabel}>Check-in berikutnya tersedia dalam</p>
      <p style={s.countdownTime}>{timeLeft}</p>
    </div>
  );
}

// ── Pilihan hari untuk to-do ──
function DayPills({ value, onChange }) {
  return (
    <div style={s.dayPills}>
      {[['today', 'Hari ini'], ['tomorrow', 'Besok']].map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          style={{ ...s.dayPill, ...(value === k ? s.dayPillActive : {}) }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Langkah To-Do Planner di dalam form check-in ──
// Draft disimpan lokal dulu, baru masuk ke planner saat "Simpan Check-In".
function PlannerStep({ draft, setDraft, intention }) {
  const [text, setText] = useState('');
  const [day,  setDay]  = useState('today');

  const add = (t = text, d = day) => {
    const clean = t.trim();
    if (!clean || draft.length >= 15) return;
    setDraft(list => [...list, { id: crypto.randomUUID(), text: clean, day: d }]);
    setText('');
  };

  const intentionAdded = draft.some(t => t.text === (intention || '').trim());

  return (
    <div>
      <p style={s.plannerHint}>
        Tulis hal-hal yang ingin kamu kerjakan. Langkah ini boleh dilewati. Mau atur prioritas & tanggal lain? Buka To-Do Planner setelah check-in.
      </p>

      <div style={s.addRow}>
        <input
          style={s.input}
          placeholder="Contoh: Kerjakan bab 2 skripsi"
          value={text}
          maxLength={80}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button
          type="button"
          style={{ ...s.addBtn, opacity: text.trim() ? 1 : 0.5 }}
          disabled={!text.trim()}
          onClick={() => add()}
        >
          + Tambah
        </button>
      </div>
      <DayPills value={day} onChange={setDay} />

      {intention && intention.trim() && !intentionAdded && (
        <button
          type="button"
          style={s.suggestChip}
          onClick={() => add(intention, 'tomorrow')}
        >
          ➕ Jadikan to-do besok: “{intention.trim().slice(0, 50)}{intention.trim().length > 50 ? '…' : ''}”
        </button>
      )}

      {draft.length === 0 ? (
        <p style={s.emptyText}>Belum ada to-do. Tambahkan satu untuk memulai 🌱</p>
      ) : (
        <ul style={s.todoList}>
          {draft.map(t => (
            <li key={t.id} style={s.todoRow}>
              <span style={s.todoText}>{t.text}</span>
              <span style={s.todoBadge}>{t.day === 'tomorrow' ? 'Besok' : 'Hari ini'}</span>
              <button
                type="button"
                aria-label="Hapus to-do"
                style={s.todoDel}
                onClick={() => setDraft(list => list.filter(x => x.id !== t.id))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Papan To-Do (tampil di layar "sudah check-in") ──
function PlannerBoard() {
  const { state, actions } = useAppState();
  const [text, setText] = useState('');
  const [day,  setDay]  = useState('today');

  const todos    = state.todos || [];
  const today    = localDateKey(0);
  const tomorrow = localDateKey(1);
  const todayList    = todos.filter(t => t.date === today);
  const tomorrowList = todos.filter(t => t.date === tomorrow);
  const doneCount    = todayList.filter(t => t.done).length;

  const add = () => {
    if (!text.trim()) return;
    actions.addTodos([{ text, day }]);
    setText('');
  };

  const renderList = (list) => (
    <ul style={s.todoList}>
      {list.map(t => (
        <li key={t.id} style={s.todoRow}>
          <button
            type="button"
            aria-label={t.done ? 'Tandai belum selesai' : 'Tandai selesai'}
            onClick={() => actions.toggleTodo(t.id)}
            style={{ ...s.checkBox, ...(t.done ? s.checkBoxOn : {}) }}
          >
            {t.done ? '✓' : ''}
          </button>
          <span style={{ ...s.todoText, ...(t.done ? s.todoTextDone : {}) }}>{t.text}</span>
          <button
            type="button"
            aria-label="Hapus to-do"
            style={s.todoDel}
            onClick={() => actions.removeTodo(t.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div style={s.boardBox}>
      <div style={s.boardHead}>
        <p style={{ ...s.summaryTitle, marginBottom: 0 }}>📝 To-Do Planner</p>
        {todayList.length > 0 && (
          <span style={s.todoBadge}>{doneCount}/{todayList.length} selesai</span>
        )}
      </div>

      <p style={s.boardSub}>Hari ini</p>
      {todayList.length ? renderList(todayList) : <p style={s.emptyText}>Belum ada to-do untuk hari ini.</p>}

      {tomorrowList.length > 0 && (
        <>
          <p style={s.boardSub}>Besok</p>
          {renderList(tomorrowList)}
        </>
      )}

      <div style={{ ...s.addRow, marginTop: 12 }}>
        <input
          style={s.input}
          placeholder="Tambah to-do baru…"
          value={text}
          maxLength={80}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button
          type="button"
          style={{ ...s.addBtn, opacity: text.trim() ? 1 : 0.5 }}
          disabled={!text.trim()}
          onClick={add}
        >
          + Tambah
        </button>
      </div>
      <DayPills value={day} onChange={setDay} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KOMPONEN UTAMA — nama tetap CheckIn agar tidak perlu
// ubah import di file lain
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function CheckIn({ onBack, navigation }) {
  const [loading,     setLoading]     = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [currentQ,    setCurrentQ]    = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [planDraft,   setPlanDraft]   = useState([]);
  const { actions } = useAppState();
  const smartBack = useGoBack();
  const navigate  = useNavigate();

  const questions = [
    {
      key: 'stressor',
      type: 'textarea',
      label: 'Apa yang paling membuatmu stres hari ini?',
      placeholder: 'Tugas menumpuk dan takut hasilnya belum maksimal.',
    },
    {
      key: 'sleep',
      type: 'choice',
      label: 'Bagaimana kualitas tidurmu semalam?',
      options: ['😴 Sangat Baik', '😊 Baik', '😐 Buruk', '😞 Sangat Buruk'],
    },
    {
      key: 'energy',
      type: 'scale',
      label: 'Seberapa berenergi kamu hari ini? (1 = sangat lelah, 5 = sangat semangat)',
    },
    {
      key: 'win',
      type: 'textarea',
      label: 'Satu hal kecil yang kamu syukuri hari ini?',
      placeholder: 'Misal: berhasil menyelesaikan 1 tugas, atau tidur lebih awal.',
    },
    {
      key: 'intention',
      type: 'textarea',
      label: 'Apa yang ingin kamu selesaikan besok?',
      placeholder: 'Tulis satu target kecil yang realistis untuk besok.',
    },
    {
      key: 'planner',
      type: 'planner',
      label: 'Susun To-Do Planner-mu 📝',
    },
  ];

  // ── Cek apakah hari ini sudah check-in ──
  useEffect(() => {
    const todayKey = getTodayKey();
    if (localStorage.getItem(todayKey) === 'done') {
      setAlreadyDone(true);
    }
    setLoading(false);
  }, []);

  const handleAnswer = (key, value) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(q => q + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  };

  // ── Simpan ke localStorage saat submit ──
  const handleSubmit = async () => {
    // Tandai sudah selesai hari ini
    localStorage.setItem(getTodayKey(), 'done');

    // Masukkan draft to-do ke To-Do Planner
    actions.addTodos(planDraft);

    // Kirim ke backend kalau ada
    try {
      const token = localStorage.getItem('focusync_token');
      if (token) {
        await fetch('/api/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stressLevel:  answers.energy    || 3,
            sleepQuality: answers.sleep     || '',
            mainStressor: answers.stressor  || '',
            responses:    answers,
            completed:    true,
          }),
        });
      }
    } catch (_) { /* simpan lokal saja sudah cukup */ }

    setSubmitted(true);
    setAlreadyDone(true);
  };

  // ── Helper navigasi mundur ──
  // Sebelumnya tombol back tidak jalan karena CheckIn dipanggil tanpa props onBack/navigation.
  // Sekarang jatuh ke react-router (kembali ke halaman sebelumnya, atau Beranda).
  const goBack = () => {
    if (onBack)                      onBack();
    else if (navigation?.goBack)     navigation.goBack();
    else                             smartBack();
  };

  const goHome = () => {
    if (onBack) onBack();
    else        navigate('/');
  };

  // Batal check-in: konfirmasi dulu kalau sudah ada jawaban yang terisi.
  const hasProgress = Object.keys(answers).length > 0 || planDraft.length > 0;
  const handleCancel = () => {
    if (hasProgress && !window.confirm('Batalkan check-in? Jawaban yang sudah kamu isi tidak akan disimpan.')) return;
    goBack();
  };

  const q           = questions[currentQ];
  const currentAns  = answers[q?.key];
  const isLastQ     = currentQ === questions.length - 1;
  // Langkah planner bersifat opsional, jadi selalu boleh lanjut.
  const canProceed  = q?.type === 'planner'
    || (currentAns !== undefined && String(currentAns).trim() !== '');

  // ─────────────── LOADING ───────────────
  if (loading) {
    return (
      <div style={s.wrap}>
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={s.grayText}>Memuat...</p>
        </div>
      </div>
    );
  }

  // ─────────────── SUDAH CHECK-IN HARI INI ───────────────
  if (alreadyDone) {
    return (
      <div style={s.wrap}>
        <header style={s.header}>
          <button style={s.backBtn} onClick={goBack}>‹</button>
          <div>
            <p style={s.headerTitle}>Daily Check-In</p>
            <p style={s.headerSub}>Pertanyaan reflektif harian untuk lebih mengenal diri</p>
          </div>
        </header>

        <div style={s.doneCard}>
          <div style={s.doneEmoji}>✅</div>
          <h3 style={s.doneTitle}>
            {submitted ? 'Check-In Tersimpan!' : 'Sudah Check-In Hari Ini'}
          </h3>
          <p style={s.doneSub}>
            {submitted
              ? 'Terima kasih sudah meluangkan waktu untuk refleksi. Kamu hebat! 💚'
              : 'Kamu sudah mengisi check-in untuk hari ini. Sampai jumpa besok!'}
          </p>
          <div style={s.dateBadge}>📅 {getTodayFormatted()}</div>

          {/* Ringkasan jawaban (hanya muncul saat baru submit) */}
          {submitted && Object.keys(answers).length > 0 && (
            <div style={s.summaryBox}>
              <p style={s.summaryTitle}>Ringkasan hari ini</p>
              {questions.map(qItem =>
                answers[qItem.key] ? (
                  <div key={qItem.key} style={s.summaryRow}>
                    <span style={s.summaryLabel}>{qItem.label}</span>
                    <span style={s.summaryValue}>{answers[qItem.key]}</span>
                  </div>
                ) : null
              )}
            </div>
          )}

          <PlannerBoard />

          <NextCheckInCountdown />

          <button style={{ ...s.nextBtn, marginBottom: 10 }} onClick={() => navigate('/todo')}>
            Buka To-Do Planner 📝
          </button>

          <button style={s.outlineBtn} onClick={goHome}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── FORM CHECK-IN ───────────────
  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={currentQ > 0 ? handlePrev : handleCancel}>
          ‹
        </button>
        <div>
          <p style={s.headerTitle}>Daily Check-In</p>
          <p style={s.headerSub}>Pertanyaan reflektif harian untuk lebih mengenal diri</p>
        </div>
      </header>

      {/* Progress bar */}
      <div style={s.progressTrack}>
        <div style={{
          ...s.progressFill,
          width: `${((currentQ + 1) / questions.length) * 100}%`,
        }} />
      </div>

      {/* Question */}
      <div style={s.card}>
        <h3 style={s.qLabel}>{q.label}</h3>

        {q.type === 'textarea' && (
          <textarea
            style={s.textarea}
            placeholder={q.placeholder}
            value={currentAns || ''}
            onChange={e => handleAnswer(q.key, e.target.value)}
            rows={4}
          />
        )}

        {q.type === 'choice' && (
          <div style={s.choiceList}>
            {q.options.map(opt => (
              <button
                key={opt}
                style={{ ...s.choiceBtn, ...(currentAns === opt ? s.choiceBtnActive : {}) }}
                onClick={() => handleAnswer(q.key, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === 'planner' && (
          <PlannerStep
            draft={planDraft}
            setDraft={setPlanDraft}
            intention={answers.intention}
          />
        )}

        {q.type === 'scale' && (
          <>
            <div style={s.scaleRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  style={{ ...s.scaleBtn, ...(Number(currentAns) === n ? s.scaleBtnActive : {}) }}
                  onClick={() => handleAnswer(q.key, n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={s.scaleLabels}>
              <span>😫 Sangat lelah</span>
              <span>🔥 Sangat semangat</span>
            </div>
          </>
        )}
      </div>

      {/* Tombol aksi */}
      {isLastQ ? (
        <button
          style={{ ...s.nextBtn, opacity: canProceed ? 1 : 0.5 }}
          disabled={!canProceed}
          onClick={handleSubmit}
        >
          Simpan Check-In ✓
        </button>
      ) : (
        <button
          style={{ ...s.nextBtn, opacity: canProceed ? 1 : 0.5 }}
          disabled={!canProceed}
          onClick={handleNext}
        >
          Selanjutnya
        </button>
      )}
    </div>
  );
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
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,
  },
  spinner: {
    width: 36, height: 36,
    border: '3px solid #e0f2f0',
    borderTop: `3px solid ${TEAL}`,
    borderRadius: '50%',
  },
  grayText: { color: '#6b8f8b', fontSize: 14 },

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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#1a2e2b', flexShrink: 0,
  },
  headerTitle: { fontSize: 16, fontWeight: 700, margin: 0 },
  headerSub:   { fontSize: 12, color: '#6b8f8b', margin: '2px 0 0' },

  // Progress
  progressTrack: {
    height: 6, background: '#d0e8e5',
    borderRadius: 3, overflow: 'hidden', marginBottom: 20,
  },
  progressFill: {
    height: '100%', background: GRAD,
    borderRadius: 3, transition: 'width .4s ease',
  },

  // Card
  card: {
    background: '#fff', borderRadius: 16,
    padding: '22px 20px', marginBottom: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e0f0ee',
  },
  qLabel: {
    fontSize: 16, fontWeight: 700,
    marginBottom: 16, lineHeight: 1.4,
  },
  textarea: {
    width: '100%', padding: '11px 13px',
    borderRadius: 10, border: `1.5px solid ${TEAL}40`,
    background: '#f7fffe', fontSize: 14,
    color: '#1a2e2b', resize: 'vertical',
    fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', lineHeight: 1.6,
  },
  choiceList: { display: 'flex', flexDirection: 'column', gap: 10 },
  choiceBtn: {
    padding: '11px 15px', borderRadius: 10,
    border: '1.5px solid #d0e8e5',
    background: '#f7fffe', fontSize: 14,
    cursor: 'pointer', textAlign: 'left',
    color: '#1a2e2b', transition: 'all .2s',
  },
  choiceBtnActive: {
    background: `${TEAL}15`,
    border: `1.5px solid ${TEAL}`,
    color: '#0b6e6a', fontWeight: 700,
  },
  scaleRow: {
    display: 'flex', gap: 10, marginBottom: 8,
  },
  scaleBtn: {
    flex: 1, height: 44, borderRadius: 10,
    border: '1.5px solid #d0e8e5',
    background: '#f7fffe', fontSize: 16,
    fontWeight: 700, cursor: 'pointer',
    color: '#1a2e2b', transition: 'all .2s',
  },
  scaleBtnActive: {
    background: GRAD, border: 'none', color: '#fff',
  },
  scaleLabels: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: '#6b8f8b',
  },

  // Next button
  nextBtn: {
    width: '100%', padding: '14px 24px',
    borderRadius: 28, border: 'none',
    background: GRAD, color: '#fff',
    fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'opacity .2s',
  },

  // Done screen
  doneCard: {
    background: '#fff', borderRadius: 20,
    padding: '32px 22px', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e0f0ee',
  },
  doneEmoji: { fontSize: 52, marginBottom: 14 },
  doneTitle: {
    fontSize: 20, fontWeight: 800,
    marginBottom: 8, color: '#1a2e2b',
  },
  doneSub: {
    fontSize: 14, color: '#6b8f8b',
    lineHeight: 1.6, marginBottom: 14,
  },
  dateBadge: {
    display: 'inline-block',
    background: `${TEAL}18`,
    color: '#0b6e6a',
    padding: '5px 14px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, marginBottom: 18,
  },

  // Summary
  summaryBox: {
    background: '#f7fffe', borderRadius: 12,
    padding: 16, marginBottom: 18,
    border: '1px solid #d0e8e5', textAlign: 'left',
  },
  summaryTitle: {
    fontSize: 11, color: '#6b8f8b',
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: .5, marginBottom: 10,
  },
  summaryRow: { marginBottom: 10 },
  summaryLabel: {
    display: 'block', fontSize: 11,
    color: '#6b8f8b', marginBottom: 2,
  },
  summaryValue: {
    display: 'block', fontSize: 13,
    color: '#1a2e2b', fontWeight: 500,
  },

  // Countdown
  countdown: {
    background: '#f0faf8', borderRadius: 12,
    padding: '12px 16px', marginBottom: 18,
    border: '1px solid #d0e8e5',
  },
  countdownLabel: { fontSize: 12, color: '#6b8f8b', margin: '0 0 4px' },
  countdownTime: {
    fontSize: 22, fontWeight: 800,
    color: TEAL, margin: 0,
    fontFamily: 'monospace', letterSpacing: 2,
  },

  // Planner
  plannerHint: { fontSize: 13, color: '#6b8f8b', margin: '-6px 0 12px', lineHeight: 1.5 },
  addRow: { display: 'flex', gap: 8, marginBottom: 8 },
  input: {
    flex: 1, minWidth: 0, padding: '10px 12px',
    borderRadius: 10, border: `1.5px solid ${TEAL}40`,
    background: '#f7fffe', fontSize: 14, color: '#1a2e2b',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  addBtn: {
    padding: '0 14px', borderRadius: 10, border: 'none',
    background: GRAD, color: '#fff', fontWeight: 700,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  dayPills: { display: 'flex', gap: 6, marginBottom: 10 },
  dayPill: {
    padding: '5px 12px', borderRadius: 20,
    border: '1.5px solid #d0e8e5', background: '#f7fffe',
    fontSize: 12, fontWeight: 600, color: '#6b8f8b', cursor: 'pointer',
  },
  dayPillActive: { background: `${TEAL}15`, border: `1.5px solid ${TEAL}`, color: '#0b6e6a' },
  suggestChip: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '9px 12px', marginBottom: 10, borderRadius: 10,
    border: `1.5px dashed ${TEAL}80`, background: `${TEAL}0d`,
    fontSize: 12, color: '#0b6e6a', cursor: 'pointer', lineHeight: 1.4,
  },
  emptyText: { fontSize: 13, color: '#6b8f8b', margin: '8px 0', textAlign: 'center' },
  todoList: { listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 8 },
  todoRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 10,
    background: '#f7fffe', border: '1px solid #d0e8e5', textAlign: 'left',
  },
  todoText: { flex: 1, fontSize: 14, color: '#1a2e2b', wordBreak: 'break-word' },
  todoTextDone: { textDecoration: 'line-through', color: '#8aa8a4' },
  todoBadge: {
    fontSize: 11, fontWeight: 700, color: '#0b6e6a',
    background: `${TEAL}18`, padding: '3px 9px', borderRadius: 12, whiteSpace: 'nowrap',
  },
  todoDel: {
    border: 'none', background: 'transparent', color: '#9bb5b1',
    fontSize: 14, cursor: 'pointer', padding: 4,
  },
  checkBox: {
    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
    border: '2px solid #b8d8d3', background: '#fff', color: '#fff',
    fontSize: 13, fontWeight: 800, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  checkBoxOn: { background: GRAD, border: '2px solid transparent' },
  boardBox: {
    background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18,
    border: '1px solid #d0e8e5', textAlign: 'left',
  },
  boardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  boardSub: { fontSize: 12, fontWeight: 700, color: '#6b8f8b', margin: '10px 0 0' },

  // Back button
  outlineBtn: {
    width: '100%', padding: '12px 24px',
    borderRadius: 28,
    border: `1.5px solid ${TEAL}50`,
    background: 'transparent',
    color: '#0b6e6a', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
  },
};
