# Panduan Pengembangan & Deploy

Catatan teknis untuk proyek **AR Bandul Sederhana**. Dokumentasi umum ada di [README.md](./README.md).

## 1. Kompilasi marker → `targets.mind` (WAJIB sekali) — MULTI-FOTO

MindAR butuh berkas `targets.mind` (hasil kompilasi gambar marker). **Satu berkas
`targets.mind` bisa memuat BANYAK foto sekaligus** — tiap foto jadi `targetIndex`
0, 1, 2, … sesuai urutan upload, dan semua foto akan bisa dipindai.

1. Buka **MindAR Image Targets Compiler**:
   https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. **Upload SEMUA foto** yang ingin bisa dipindai sekaligus (mis. `media/bandul-1..4.png`
   + `media/marker-bandul.png` + `media/bandul-5.png`). Urutan upload = urutan `targetIndex`.
3. Klik **Start**, tunggu selesai, lalu **Download** hasilnya.
4. Ganti nama menjadi `targets.mind` dan taruh di folder ini (sejajar `index.html`),
   menimpa yang lama.
5. Buka `index.html`, samakan **`TARGET_COUNT`** (di dalam `<script>`) dengan **jumlah foto**
   yang kamu compile. Saat ini `TARGET_COUNT = 6` (bandul-1..4 + marker + bandul-5).

> ⚠️ **Perlu di-compile ulang:** `targets.mind` yang sekarang masih berisi 5 foto. Setelah
> menambah `bandul-5.png`, ulangi langkah di atas dengan **6 foto** agar diagram A/B/C juga
> bisa dipindai. (Sebelum di-compile ulang, foto ke-6 tidak akan terdeteksi — tidak error.)
>
> Semua foto menampilkan bandul A–B–C yang sama. Jadi urutan foto tidak masalah — yang
> penting jumlahnya cocok dengan `TARGET_COUNT`.
>
> Tips marker bagus: kaya tekstur & kontras tinggi (compiler menampilkan skor tiap gambar).
> Cetak jelas, hindari pantulan cahaya saat dipindai. Foto yang bidangnya polos/kurang detail
> lebih sulit dilacak.

Tanpa `targets.mind`, halaman tetap terbuka tetapi kamera tidak bisa melacak marker.

## 2. Menjalankan & uji di HP (lokal)

Kamera browser butuh HTTPS, jadi pakai tunnel:

```bash
npx serve .            # catat port yang tercetak
cloudflared tunnel --url http://localhost:PORT
```

Buka URL `https://...` dari tunnel di HP. Desktop tanpa webcam hanya menampilkan UI.

## 3. Arsitektur singkat

```
index.html     Menu Mulai, panel penjelasan (?), scene A-Frame + MindAR, pencahayaan
js/pendulum.js Komponen <a-entity pendulum-lab> (bandul A/B/C)
targets.mind   Target image-tracking 6 foto (buat sendiri, lihat bagian 1)
assets/        Ikon + logo + og-image
vendor/        A-Frame + MindAR (self-hosted)
media/         Bahan cetak marker
```

Alur: tekan **Mulai** di menu → kamera AR dinyalakan → MindAR mengenali marker →
komponen `pendulum-lab` menampilkan **satu bandul** yang berayun A→B→C dengan animasi
kemunculan. Setiap anchor (foto) menampilkan bandul yang sama.

### Parameter komponen `pendulum-lab`

Diatur lewat atribut di `index.html`, contoh:

```html
<a-entity pendulum-lab="length: 0.40; amplitudeDeg: 32; gravity: 9.8"></a-entity>
```

| Parameter | Default | Arti |
|---|---|---|
| `length` | `0.40` | Panjang tali L (**meter**) — memengaruhi periode & posisi A/C. Panjang di layar = `L × UNITS_PER_M` |
| `gravity` | `9.8` | Percepatan gravitasi g (m/s²) — memengaruhi periode |
| `amplitudeDeg` | `32` | Simpangan sudut ke posisi A (kiri) & C (kanan), derajat |
| `lift` | `0.06` | Tinggi melayang di atas marker |
| `showLabels` | `true` | Tampilkan judul, rumus, label A/B/C, dan panel angka |

Fisika: `theta(t) = amplitudeDeg·cos(ωt)`, `ω = √(g/L)`, sehingga `T = 2π√(L/g)`.
Posisi A = −amplitudeDeg (kiri), B = 0 (tengah), C = +amplitudeDeg (kanan).

## 4. Deploy — sudah LIVE

Proyek ini **berdiri sendiri** (repo + domain sendiri). GitHub Pages: **1 repo = 1 domain kustom**.

- **Repo GitHub:** `chensqy` (branch `main`, Pages dari root `/`).
- **Domain:** `chensqy.my.id` (DNS di Cloudflare → A/AAAA record ke IP GitHub Pages).
- Berkas **`CNAME`** (root, berisi `chensqy.my.id`) mengunci custom domain. **Jangan dihapus.**
- **`.nojekyll`** mematikan Jekyll agar semua berkas disajikan apa adanya. **Jangan dihapus.**

### Update situs

```bash
git add -A && git commit -m "..." && git push
```

GitHub Pages membangun ulang otomatis (~1 menit).

### Catatan DNS (Cloudflare)

Domain apex `chensqy.my.id` diarahkan ke GitHub Pages lewat 4 A record:
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
(+ AAAA `2606:50c0:8000::153` dst). Set **DNS only** (abu-abu) agar GitHub bisa
menerbitkan sertifikat HTTPS-nya sendiri, lalu aktifkan **Enforce HTTPS** di Settings → Pages.
