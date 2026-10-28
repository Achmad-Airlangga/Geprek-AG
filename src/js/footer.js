import { CONFIG } from '../config.js';
import { $, $$, esc, icon, waUrl } from './utils.js';

/** Isi semua teks/link yang berasal dari config: [data-wa], [data-link], [data-text], dsb. */
export function bindConfig() {
  $$('[data-wa]').forEach((a) => { a.href = waUrl(CONFIG.whatsapp[Number(a.dataset.wa)].wa); });
  $$('[data-wa-display]').forEach((el) => { el.textContent = CONFIG.whatsapp[Number(el.dataset.waDisplay)].display; });
  $$('[data-wa-label]').forEach((el) => {
    const w = CONFIG.whatsapp[Number(el.dataset.waLabel)];
    el.textContent = `${w.label} (${w.display})`;
  });
  $$('[data-link]').forEach((a) => { a.href = CONFIG[a.dataset.link]; });
  $$('[data-text]').forEach((el) => { el.textContent = CONFIG[el.dataset.text]; });
  $$('[data-hours]').forEach((el) => { el.textContent = `${fmt(CONFIG.jamBuka.buka)}–${fmt(CONFIG.jamBuka.tutup)} WIB`; });
  $('#year').textContent = String(new Date().getFullYear());
}

const fmt = (hhmm) => hhmm.replace(':', '.');
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Jam sekarang di zona waktu warung (Asia/Jakarta), apa pun zona waktu HP pengunjung. */
function nowMinutes(timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  return get('hour') * 60 + get('minute');
}

export function initOpenStatus() {
  const { buka, tutup, timezone } = CONFIG.jamBuka;
  const render = () => {
    const now = nowMinutes(timezone);
    const open = now >= toMin(buka) && now < toMin(tutup);
    const text = open
      ? `🟢 Sedang Buka · tutup ${fmt(tutup)} WIB`
      : `🔴 Sudah Tutup · buka lagi ${fmt(buka)} WIB`;
    $$('[data-open-status]').forEach((el) => { el.textContent = text; });
  };
  render();
  setInterval(render, 60 * 1000);
}

export function initFooter() {
  $('#footer-phones').innerHTML = CONFIG.whatsapp.map((w) => `
    <li><a href="${waUrl(w.wa)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(w.label)} ${esc(w.display)}">
      ${icon('i-wa')}<span><small>${esc(w.label)}</small><br>${esc(w.display)}</span>
    </a></li>`).join('');

  const socials = [
    { label: 'Instagram Geprek AG', href: CONFIG.instagram, ic: 'i-ig' },
    { label: 'TikTok Geprek AG', href: CONFIG.tiktok, ic: 'i-tiktok' },
    { label: 'WhatsApp Geprek AG', href: waUrl(CONFIG.whatsapp[0].wa), ic: 'i-wa' },
    { label: 'Geprek AG di GoFood', href: CONFIG.gofood, ic: 'i-bike' }
  ].filter((s) => s.href);
  $('#socials').innerHTML = socials.map((s) => `
    <li><a href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${icon(s.ic)}</a></li>`).join('');

  lazyMap();
}

/** Iframe peta baru dipasang saat mendekati layar, jadi tidak ikut dihitung loader. */
function lazyMap() {
  const box = $('#map');
  const mount = () => {
    if (box.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = CONFIG.mapsEmbedSrc;
    iframe.title = `Peta lokasi Geprek AG, ${CONFIG.alamat}`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => box.querySelector('.map__placeholder')?.remove(), { once: true });
    box.appendChild(iframe);
  };
  if (!('IntersectionObserver' in window)) return mount();
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); mount(); }
  }, { rootMargin: '400px 0px' });
  io.observe(box);
}

/** Pojok motif meander di setiap elemen .meander-frame */
export function initMeander() {
  $$('.meander-frame').forEach((frame) => {
    ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
      frame.insertAdjacentHTML('beforeend',
        `<svg class="meander meander--${pos}" aria-hidden="true" focusable="false"><use href="#meander-corner"/></svg>`);
    });
  });
}
