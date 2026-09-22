# 🚀 Setup Focusync Update - Quick Start

## 📥 Step 1: Extract Files

```bash
# Extract archive
tar -xzf focusync.tar.gz

# Navigate ke folder
cd focusync-updated  # atau nama folder project kamu

# Alternative jika sudah ada project:
# Copy folder src/ ke project kamu
# Replace: tailwind.config.js, vite.config.js, package.json (jika ada perubahan)
```

## 🛠️ Step 2: Install Dependencies

```bash
npm install
```

> **Note**: Jika udah punya `node_modules`, bisa skip atau run `npm install` lagi untuk update

## ▶️ Step 3: Run Development Server

```bash
npm run dev
```

Output akan mirip:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

## 🌐 Step 4: Open di Browser

Buka **http://localhost:5173/** di browser

---

## ✨ Test Fitur Baru

### 1️⃣ **Animasi Login**
- [ ] Input nama (misal: "Aku Fokus")
- [ ] Click "Mulai" button
- [ ] Lihat loading spinner (1.5 detik)
- [ ] Lihat welcome screen dengan nama + emoji (1 detik)
- [ ] Masuk ke home page dengan smooth fade

### 2️⃣ **Fitur Modal di Profil Page**
- [ ] Click "Profil" di navbar → go to Profil page
- [ ] Scroll down ke section "Fitur Pendukung Lainnya"

**a) Jurnal & Refleksi** 📝
- [ ] Click tombol "Jurnal & Refleksi"
- [ ] Modal terbuka dengan textarea
- [ ] Type: "Hari ini aku merasa produktif! 🎉"
- [ ] Click "Simpan" button
- [ ] Modal close, lihat pesan terakhir di bawah

**b) Relaksasi** 🧘
- [ ] Click tombol "Relaksasi"
- [ ] Modal terbuka dengan 4 teknik relaksasi
- [ ] Click salah satu teknik → modal close
- [ ] Klik X button untuk close tanpa memilih

**c) Musik Fokus** 🎵
- [ ] Click tombol "Musik Fokus"
- [ ] Modal terbuka dengan 4 playlist
- [ ] Lihat durasi & jumlah plays untuk setiap playlist
- [ ] Click salah satu → modal close
- [ ] X button untuk close

**d) Notifikasi Pintar** 🔔
- [ ] Click tombol "Notifikasi Pintar"
- [ ] Modal terbuka dengan 4 toggle switches
- [ ] Toggle beberapa switches on/off
- [ ] Click "Simpan Pengaturan"
- [ ] Modal close

### 3️⃣ **View Mode Toggle** 📱↔️🖥️
- [ ] Di Profil page, lihat top-right header
- [ ] Ada 2 buttons: "Desktop" & "HP"
- [ ] **Click "HP"** → layout berubah ke mobile view (responsive, full width)
- [ ] **Click "Desktop"** → kembali ke desktop layout (grid, max-width)
- [ ] State persist saat navigate halaman lain

---

## 🎬 Demo Video Flow

```
1. Start app → Input nama "Test User"
2. Click "Mulai" → See loading + welcome animation
3. Land on Home page
4. Click "Profil" navbar → Go to Profile
5. See header dengan "Desktop" & "HP" toggle buttons
6. Click "HP" → Mobile layout appears
7. Click "Desktop" → Desktop layout back
8. Scroll down → See 4 feature buttons
9. Click "Jurnal & Refleksi" → Modal appears
10. Type journal entry → Click "Simpan"
11. Try other modals (Relaksasi, Musik, Notifikasi)
12. Close modals dengan X button atau click outside
```

---

## 🔍 Troubleshooting

### Port 5173 already in use?
```bash
# Use different port
npm run dev -- --port 3000
```

### Browser showing blank page?
```bash
# Clear cache & hard reload
Ctrl+Shift+Delete  (Chrome)
Cmd+Shift+Delete   (Mac)
```

### Console errors about state?
- Make sure `useAppState()` is inside `AppStateProvider`
- Check `src/main.jsx` has proper provider setup

### Modal not appearing?
- Check DevTools → ensure `state.openedFeature` changes
- Verify click handlers are attached (F12 → click button)
- Check if modal component renders correctly

---

## 📚 File Structure

```
focusync-updated/
├── src/
│   ├── screens/
│   │   ├── AuthDesktop.jsx       ← Animasi login ✨
│   │   ├── Profile.jsx           ← Modal fitur + toggle ✨
│   │   ├── ProfileDesktop.jsx    ← Modal fitur + toggle ✨
│   │   └── ... (other screens)
│   ├── state/
│   │   └── store.jsx             ← State management ✨
│   ├── components/
│   ├── layout/
│   ├── hooks/
│   ├── App.jsx                   ← View mode routing ✨
│   └── main.jsx
├── public/
├── tailwind.config.js            ← Custom animations ✨
├── vite.config.js
├── package.json
├── index.html
└── postcss.config.js

✨ = File yang dimodifikasi/ditambahkan
```

---

## 🎯 Next Steps

Setelah semua test berhasil:

1. **Deploy** ke production (Vercel, Netlify, etc)
2. **Add real data** untuk journal, musik, notifikasi
3. **Integrate API** untuk authentication
4. **Add more pages** dengan animasi serupa
5. **Mobile optimization** untuk view mode HP

---

## 💬 Common Questions

**Q: Apakah animasi login bisa di skip?**  
A: Sekarang tidak, tapi bisa di-customize delay di `AuthDesktop.jsx` baris ~16-20

**Q: Fitur modal menyimpan data ke mana?**  
A: State React + localStorage (`focusync_state_v1` key) - Simpan auto saat state berubah

**Q: Bisa customize duration animasi?**  
A: Yes! Edit di `tailwind.config.js` → ubah nilai timing (ms)

**Q: Apakah view mode preference persistent?**  
A: Yes! Tersimpan di state + localStorage

---

## 🎊 Enjoy!

Animasi login sudah smooth, semua fitur modal aktif, dan view toggle ready to go! 🚀

Jika ada pertanyaan atau bug, check CHANGELOG.md untuk detail teknis.
