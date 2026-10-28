import menuData from '../data/menu.json';
import photos from 'virtual:menu-photos';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmallScreen = () => window.matchMedia('(max-width: 767px)').matches;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** 12000 → "Rp 12.000" */
export const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

export const icon = (id, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

/** localStorage bisa diblokir (mode privat, iframe, dsb.), jadi semuanya dibungkus try/catch. */
export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* abaikan */ }
  }
};

export const waUrl = (number, text = '') =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// ---------- Data menu ----------
export const MENU = menuData;
export const ITEMS = new Map();
for (const kat of MENU.kategori) {
  for (const item of kat.items) ITEMS.set(item.id, { ...item, kategori: kat.id, jenis: kat.jenis });
}
export const getItem = (id) => ITEMS.get(id);
export const photoFor = (id) => photos[id] || null;

export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
