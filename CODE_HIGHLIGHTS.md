# 💻 Code Highlights - Penjelasan Teknis

## 1. Animasi Login di AuthDesktop.jsx

### Konsep Flow
```
Input Nama → Click "Mulai"
    ↓
setIsLoading(true)
    ↓
[DELAY 1.5s] Loading screen dengan spinner
    ↓
setShowWelcome(true) → Show welcome screen
    ↓
[DELAY 1.3s lebih] Panggil completeOnboarding()
    ↓
App re-render → onboarded = true → show HomeDesktop
```

### Code Snippet
```jsx
const handleSubmit = (e) => {
  e.preventDefault()
  const trimmed = name.trim()
  if (!trimmed || isLoading) return

  setIsLoading(true)  // ← Mulai loading

  // Animasi loading 1.5 detik, terus show welcome screen
  setTimeout(() => {
    setShowWelcome(true)  // ← Welcome screen appear
  }, 1500)

  // Masuk ke home setelah welcome 1 detik
  setTimeout(() => {
    actions.completeOnboarding({ name: trimmed })  // ← State change
  }, 2800)  // Total: 1.5s + 1.3s = 2.8s
}
```

### Conditional Rendering
```jsx
// 1. Welcome screen tampil jika showWelcome = true
if (showWelcome) {
  return (
    <div className="min-h-screen flex items-center justify-center...">
      <div className="text-center animate-fade-in-scale">
        {/* Welcome UI dengan bounce animation */}
      </div>
    </div>
  )
}

// 2. Loading overlay saat isLoading = true
{isLoading && (
  <div className="fixed inset-0 bg-black/10... animate-fade-in z-50">
    <div className="bg-white rounded-3xl p-12 shadow-xl animate-scale-in">
      <Loader className="animate-spin" />
      <p>Mempersiapkan dashboard...</p>
    </div>
  </div>
)}

// 3. Input form dengan disabled state saat loading
<input
  disabled={isLoading}
  className="... disabled:bg-slate-50 disabled:text-slate-400"
/>
```

---

## 2. State Management untuk Fitur

### Di store.jsx

```javascript
// Tambah ke defaultState
const defaultState = {
  // ... existing ...
  openedFeature: null,  // null | 'journal' | 'relaksasi' | 'musik' | 'notifikasi'
  viewMode: 'desktop',  // 'desktop' | 'mobile'
}

// Tambah ke actions
const actions = useMemo(() => ({
  // ... existing actions ...
  openFeature(featureName) {
    setState((s) => ({ ...s, openedFeature: featureName }))
  },
  closeFeature() {
    setState((s) => ({ ...s, openedFeature: null }))
  },
  setViewMode(mode) {
    setState((s) => ({ ...s, viewMode: mode }))
  },
}), [state])
```

---

## 3. Modal Components Pattern

### Generic Modal Structure
```jsx
function FeatureModal({ onClose }) {
  const { state, actions } = useAppState()
  const [localState, setLocalState] = useState({})

  const handleAction = () => {
    // Do something
    // Then close
    onClose()
  }

  return (
    // Backdrop overlay
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      
      // Modal box dengan animation
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
        
        // Header dengan close button
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold...">Title</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100...">
            <X size={20} />
          </button>
        </div>

        // Content
        <div>
          {/* Modal content here */}
        </div>

        // Footer buttons
        <div className="flex gap-2 mt-4">
          <button onClick={onClose}>Batal</button>
          <button onClick={handleAction}>Simpan</button>
        </div>
      </div>
    </div>
  )
}
```

### Contoh: JournalModal
```jsx
function JournalModal({ onClose }) {
  const { state, actions } = useAppState()
  const [journalText, setJournalText] = useState('')

  const handleSubmit = () => {
    if (journalText.trim()) {
      actions.addJournalEntry(journalText)  // ← Save to state
      setJournalText('')  // ← Clear form
      onClose()  // ← Close modal
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" /> Jurnal & Refleksi
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Aku hari ini merasa... 💭"
          className="w-full h-32 p-3 border border-slate-200 rounded-xl..."
        />

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose}>Batal</button>
          <button onClick={handleSubmit} disabled={!journalText.trim()}>
            <Send size={15} /> Simpan
          </button>
        </div>

        {/* Show last entry */}
        {state.journalEntries.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Jurnal Terakhir
            </p>
            <p className="text-sm text-slate-600 line-clamp-3">
              {state.journalEntries[0].text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 4. Modal Rendering di Component

```jsx
export default function Profile() {
  const { state, actions } = useAppState()

  return (
    <div className="...">
      {/* Main UI */}
      
      {/* Modals - render berdasarkan state */}
      {state.openedFeature === 'journal' && (
        <JournalModal onClose={() => actions.closeFeature()} />
      )}
      {state.openedFeature === 'relaksasi' && (
        <RelaksasiModal onClose={() => actions.closeFeature()} />
      )}
      {state.openedFeature === 'musik' && (
        <MusikModal onClose={() => actions.closeFeature()} />
      )}
      {state.openedFeature === 'notifikasi' && (
        <NotifikasiModal onClose={() => actions.closeFeature()} />
      )}
    </div>
  )
}
```

---

## 5. Fitur Button dengan onClick

```jsx
{features.map(({ icon: Icon, label, desc, color }) => {
  // Map label ke feature key
  const featureKey = 
    label === 'Jurnal & Refleksi' ? 'journal'
    : label === 'Relaksasi' ? 'relaksasi'
    : label === 'Musik Fokus' ? 'musik'
    : 'notifikasi'

  return (
    <button
      key={label}
      onClick={() => actions.openFeature(featureKey)}  // ← Trigger modal
      className="flex items-start gap-4 rounded-2xl bg-white... hover:shadow-md..."
    >
      <span className={`flex h-10 w-10 shrink-0... rounded-xl ${color}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </button>
  )
})}
```

---

## 6. View Mode Toggle

### Toggle Buttons di Header
```jsx
<div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
  <button
    onClick={() => actions.setViewMode('desktop')}  // ← Set state
    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
      state.viewMode === 'desktop'
        ? 'bg-white text-emerald-600 shadow-sm'  // Active style
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Monitor size={14} /> Desktop
  </button>
  
  <button
    onClick={() => actions.setViewMode('mobile')}
    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
      state.viewMode === 'mobile'
        ? 'bg-white text-emerald-600 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Smartphone size={14} /> HP
  </button>
</div>
```

### Conditional Rendering di App.jsx
```jsx
export default function App() {
  const { state } = useAppState()

  if (!state.onboarded) {
    return <AuthDesktop />
  }

  // Mobile View
  if (state.viewMode === 'mobile') {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profile />} />
          {/* ... mobile routes ... */}
        </Routes>
      </div>
    )
  }

  // Desktop View (default)
  return (
    <DesktopLayout>
      <Routes>
        <Route path="/" element={<HomeDesktop />} />
        <Route path="/profil" element={<ProfileDesktop />} />
        {/* ... desktop routes ... */}
      </Routes>
    </DesktopLayout>
  )
}
```

---

## 7. Custom Animations di Tailwind

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-scale': 'fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
}
```

### Usage
```jsx
<div className="animate-fade-in">Ini fade in</div>
<div className="animate-scale-in">Ini scale bounce</div>
<div className="animate-fade-in-scale">Ini kombinasi</div>
```

---

## 8. Best Practices Used

✅ **State Management**
- Centralized state di store.jsx
- Pure functions untuk actions
- Persistent state via localStorage

✅ **Component Patterns**
- Reusable modal components
- Controlled components (textarea, input)
- Conditional rendering untuk UI logic

✅ **Performance**
- No unnecessary re-renders
- useMemo untuk actions
- Lazy rendering dengan conditional

✅ **Styling**
- Tailwind utility classes
- Custom animations di config
- Consistent color scheme

✅ **Accessibility**
- Semantic HTML (button, input)
- Proper z-index layering
- Focus states & hover states

---

## 🎓 Learning Resources

- **Animations**: CSS keyframes, Tailwind animation docs
- **State**: React hooks (useState, useContext), custom context pattern
- **Modals**: Overlay pattern, fixed positioning, z-index stacking
- **View mode**: Conditional rendering, router pattern

Semua konsep di atas menggunakan React fundamentals tanpa external library!
