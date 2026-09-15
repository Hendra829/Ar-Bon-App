# AR'BON App

Aplikasi mobile **AR'BON** untuk manajemen dan penyimpanan file (gambar, video, dokumen, audio) dengan desain modern.

> Status saat ini: **Local-first MVP** (Expo + TypeScript).  
> Lihat diagnosis & audit lengkap di [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md).

```
   █████╗ ██████╗ ██╗██████╗  ██████╗ ███╗   ██╗
  ██╔══██╗██╔══██╗╚═╝██╔══██╗██╔═══██╗████╗  ██║
  ███████║██████╔╝   ██████╔╝██║   ██║██╔██╗ ██║
  ██╔══██║██╔══██╗   ██╔══██╗██║   ██║██║╚██╗██║
  ██║  ██║██║  ██║   ██████╔╝╚██████╔╝██║ ╚████║
  ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝

  AR'BON - File Storage App
  Simpan Semua File Anda dengan Aman
```

## Fitur

- Autentikasi lokal: register, login, logout, remember me, forgot password (simulasi)
- Upload dokumen & media
- Preview gambar, video, audio, dan dokumen
- Kategori otomatis, folder, sorting, pencarian + filter tipe
- Trash / restore / secure delete
- Share file ke aplikasi lain
- Dark / light / system theme
- Storage usage indicator
- Settings: auto-backup flag, PIN, biometrik

## Tech Stack

- Expo SDK 57
- React Native + TypeScript
- React Navigation (stack + tabs)
- Zustand
- AsyncStorage, SecureStore, FileSystem, ImagePicker, DocumentPicker, AV, Local Authentication

## Struktur

```
Ar-Bon-App/
├── App.tsx
├── src/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── docs/AUDIT_REPORT.md
├── quickstarts/          # notebook eksternal (bukan runtime app)
└── package.json
```

## Cara Menjalankan

### Prasyarat

- Node.js 20+
- npm 10+
- Expo Go (opsional) atau Android Studio / Xcode

### Instalasi

```bash
npm install
```

### Development

```bash
npm start
# lalu tekan a (Android), i (iOS), atau w (web)
```

### Typecheck

```bash
npm run typecheck
```

## Akun Demo

Tidak ada backend. Daftar akun baru dari layar **Register**. Data user dan file disimpan lokal di perangkat.

## Catatan Keamanan

Build ini adalah fondasi MVP:

- Password demo disimpan lokal (tidak untuk produksi)
- Enkripsi file masih berupa flag metadata
- Cloud backup/sync belum terhubung ke provider

Detail temuan dan rekomendasi ada di laporan audit.

## Lisensi

Proyek ini memakai lisensi yang tertera pada repository (jika ada file `LICENSE`).
