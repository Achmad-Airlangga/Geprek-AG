# Geprek AG — Website

Website one-page untuk warung Geprek AG (Lirboyo, Kediri): katalog menu online, tanpa pemesanan lewat web. Dibuat dengan Vite + JavaScript biasa + GSAP + Lenis.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil statis di folder dist/
npm run preview    # cek hasil build di http://localhost:4173
```

## Deploy

- **Netlify:** hubungkan repo, `netlify.toml` sudah mengatur build `npm run build` dan folder `dist`. Atau seret folder `dist/` ke app.netlify.com/drop.
- **Vercel:** import repo, framework otomatis terdeteksi sebagai Vite (build `npm run build`, output `dist`).
- Setelah punya domain, isi `siteUrl` di `src/config.js` lalu build ulang supaya Open Graph & canonical memakai URL lengkap.

## Yang sering diubah

| Mau ubah | File |
|---|---|
| Nomor WA, link sosmed, GoFood/GrabFood/ShopeeFood, jam buka, peta | `src/config.js` |
| Nama menu & harga, best seller, tanggal berlaku harga | `src/data/menu.json` |
| Suara kokok | taruh file di `public/assets/audio/kokok.mp3` |
| Foto menu | `public/assets/menu/<id-menu>.webp` (id ada di `menu.json`), otomatis tampil |
| Foto hero | `public/assets/hero/nasi-geprek.webp` |

Konversi foto ke WebP (contoh dengan ffmpeg, lebar 600px):

```bash
ffmpeg -i foto.jpg -vf scale=600:-1 -quality 82 public/assets/menu/nasi-ag-tempe.webp
```

## Struktur

```
index.html            loader + logo SVG berlayer + kerangka section
vite.config.js        plugin: daftar foto menu otomatis, JSON-LD Restaurant dari config/menu
src/config.js         data yang bisa berubah
src/data/             menu.json
src/styles/           tokens, base, sections
src/js/               scroll (Lenis + kunci scroll), loader, sound, hero, chili, menu, level, terserah, extras, footer
design-reference/     gambar referensi asli (tidak ikut deploy)
```
