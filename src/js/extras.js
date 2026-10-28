import { gsap } from 'gsap';
import { CONFIG } from '../config.js';
import { $, $$, esc, icon, reducedMotion } from './utils.js';

// ================= Pesan lewat aplikasi =================
// Tambah platform baru cukup di sini; kartu otomatis tersembunyi kalau link di config kosong.
const PLATFORMS = [
  { key: 'gofood', nama: 'GoFood', warna: '#1F7A3A' },
  { key: 'grabfood', nama: 'GrabFood', warna: '#13804A' },
  { key: 'shopeefood', nama: 'ShopeeFood', warna: '#C2410C' }
];

export function initApps() {
  const list = $('#apps-list');
  const available = PLATFORMS.filter((p) => CONFIG[p.key]);
  if (!available.length) { $('#pesan-aplikasi').hidden = true; return; }
  list.innerHTML = available.map((p) => `
    <a class="app-card" style="--app:${p.warna}" href="${esc(CONFIG[p.key])}" target="_blank" rel="noopener">
      <span class="app-card__icon">${icon('i-bike')}</span>
      <span>
        <span class="app-card__name">Pesan via ${esc(p.nama)}</span>
        <span class="app-card__text" style="display:block">Buka Geprek AG di ${esc(p.nama)}</span>
      </span>
      <span class="app-card__arrow">${icon('i-out')}</span>
    </a>`).join('');
}

// ================= Animasi masuk umum =================
export function initReveals() {
  if (reducedMotion()) return;
  $$('.section-title').forEach((el) => {
    gsap.from(el, {
      y: 40, rotation: -2, duration: 0.7, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  $$('.app-card').forEach((el, i) => {
    gsap.from(el, {
      y: 30, duration: 0.6, delay: (i % 3) * 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });
}
