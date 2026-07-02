<p align="center">
  <img src="./assets/og-image.jpg" alt="AR Bandul Sederhana" width="100%">
</p>

<h1 align="center">🕰️ AR Bandul Sederhana</h1>

<p align="center">
  <b>Media pembelajaran berbasis Augmented Reality untuk memvisualisasikan gerak bandul sederhana (simple pendulum) secara 3D — langsung dari browser HP, tanpa instal aplikasi.</b>
</p>

<p align="center">
  <a href="https://chensqy.my.id/"><b>🚀 Buka Demo Langsung</b></a>
</p>

<p align="center">
  <img alt="A-Frame"  src="https://img.shields.io/badge/A--Frame-1.5-ef2d5e">
  <img alt="MindAR"   src="https://img.shields.io/badge/MindAR-image%20tracking-1f8fff">
  <img alt="WebAR"    src="https://img.shields.io/badge/WebAR-tanpa%20instal%20app-22c55e">
</p>

---

## Tentang

Proyek ini dibuat sebagai **media ajar untuk sidang skripsi**. Pengguna memindai
sebuah **marker cetak** (kartu bergambar alat bandul), lalu muncul alat bandul 3D
yang **berayun sesuai fisika sungguhan** di atas kartu. Panjang tali di layar
sebanding dengan panjang tali sebenarnya (dalam meter), sehingga periode ayunan yang
terlihat konsisten dengan rumus yang ditampilkan.

## Fitur — 3 mode

| Mode | Materi | Yang ditunjukkan |
|---|---|---|
| **A** | Bandul Tunggal | Satu bandul berayun; tampil live sudut simpangan θ, panjang tali L, dan periode `T = 2π√(L/g)` |
| **B** | Pengaruh Panjang Tali | Tiga bandul beda panjang dilepas bersamaan → makin panjang makin lambat (`T ∝ √L`) |
| **C** | Kekekalan Energi | Bar energi EP ⇄ EK berubah saat berayun; jumlah EP + EK tetap |

Tombol **?** di layar menampilkan penjelasan singkat tiap mode (berguna saat presentasi).

## Cara pakai

1. **Cetak marker**: bisa **beberapa foto sekaligus** (mis. `media/marker-bandul.png`
   dan/atau `media/bandul-1..4.png`) — semuanya bisa dipindai. Cetak di kertas / tempel di karton.
2. Buka situs ini di **browser HP** (Chrome/Safari), izinkan akses kamera.
3. Pilih materi di menu pembuka → arahkan kamera ke **salah satu foto** → bandul 3D muncul di atasnya.
4. Gerakkan HP mengelilingi marker untuk melihat dari berbagai sudut.

> Beberapa foto didukung sekaligus lewat **multi-marker** (satu `targets.mind` berisi banyak foto).
> Detail cara compile ada di [PANDUAN.md](./PANDUAN.md).

> Kamera web butuh **HTTPS** — jalan otomatis di GitHub Pages / hosting mana pun; untuk uji lokal lihat [PANDUAN.md](./PANDUAN.md).

## Fisika singkat

Bandul sederhana untuk simpangan kecil (θ ≲ 15°) mengikuti Gerak Harmonik Sederhana:

```
T = 2π √(L / g)
```

- `T` = periode (detik) — waktu satu ayunan penuh
- `L` = panjang tali (meter)
- `g` = percepatan gravitasi (≈ 9,8 m/s²)

Periode **tidak** bergantung pada massa beban maupun (untuk sudut kecil) besar simpangan.

## Struktur berkas

```
chensqy/
├── index.html        UI: menu, tombol mode, panel penjelasan (?), scene A-Frame + MindAR
├── targets.mind      Target image-tracking (5 foto hasil kompilasi) — lihat PANDUAN.md
├── CNAME             Domain kustom: chensqy.my.id
├── 404.html          Halaman 404
├── .nojekyll         Nonaktifkan Jekyll (GitHub Pages)
├── js/
│   └── pendulum.js   Komponen <a-entity pendulum-lab>: rangka + bandul 3D, fisika, label, mode A/B/C
├── assets/           Ikon situs + logo + gambar pratinjau (favicon, logo, og-image)
├── vendor/           A-Frame + MindAR (self-hosted)
└── media/            Bahan cetak marker: marker-bandul.png + bandul-1..4.png (foto sumber)
```

## Deploy & domain

Proyek ini **berdiri sendiri** (terpisah dari media AR lain) dan disiapkan untuk
**repo + domain sendiri**. Detail langkah ada di [PANDUAN.md](./PANDUAN.md).

## Lisensi

MIT © Ksatria Bintang Samudra
