import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, MENU, ITEMS, esc, icon, rupiah, photoFor, reducedMotion, debounce } from './utils.js';

/** Ilustrasi sederhana per kategori, dipakai kalau foto menu belum ada. */
const CATEGORY_ART = {
  nasi: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26h32a16 16 0 0 1-32 0Z" fill="#D7262E"/><path d="M12 26c0-7 5-12 12-12s12 5 12 12Z" fill="#fff" stroke="#E8D8C3" stroke-width="1.5"/><path d="M26 16c4-4 10-2 11 2 1 3-2 6-6 6l-5-1Z" fill="#E08A2E"/><path d="M18 10c0-2 2-2 2-4M24 9c0-2 2-2 2-4" stroke="#C9B8A3" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  mie: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M30 4 22 24M36 6 26 24" stroke="#8E1B1F" stroke-width="2.5" stroke-linecap="round"/><path d="M6 24h36a18 18 0 0 1-36 0Z" fill="#D7262E"/><path d="M11 24c3-4 5 0 8-3s5 1 8-2 5 1 8-1 4 2 5 6" stroke="#F2B544" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  snack: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="25" r="16" fill="#E7A65A"/><circle cx="24" cy="25" r="12" fill="#F7D9E3"/><circle cx="24" cy="25" r="5" fill="#FFF7EC"/><path d="M15 20l2 1M30 17l1 2M33 28l-2 1M19 33l1-2M27 33l-1-2" stroke="#D7262E" stroke-width="2" stroke-linecap="round"/></svg>`,
  'ice-juice': `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 4l4 10" stroke="#D7262E" stroke-width="2.5" stroke-linecap="round"/><path d="M12 14h24l-3 28H15Z" fill="#fff" stroke="#E8D8C3" stroke-width="1.5"/><path d="M13.5 22h21l-2 20h-17Z" fill="#F28C28"/><circle cx="34" cy="14" r="6" fill="#FFE14A" stroke="#E0B800" stroke-width="1.5"/></svg>`,
  minuman: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 18h24v14a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10Z" fill="#D7262E"/><path d="M34 22h3a5 5 0 0 1 0 10h-3" stroke="#D7262E" stroke-width="3" fill="none"/><path d="M17 6c-2 3 2 5 0 8M25 6c-2 3 2 5 0 8" stroke="#C9B8A3" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  topping: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="18" ry="9" fill="#fff" stroke="#E8D8C3" stroke-width="1.5"/><ellipse cx="24" cy="28" rx="11" ry="5" fill="#D7262E"/><path d="M30 10c-6 2-10 8-10 14" stroke="#2F8F2A" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M28 12c4-1 7 2 6 6-1 5-6 9-11 10 3-4 3-10 5-16Z" fill="#E11D25"/></svg>`
};

const thumb = (item, cls = 'menu-item__thumb') => {
  const src = photoFor(item.id);
  const round = item.jenis === 'minuman' ? ` ${cls}--round` : '';
  if (src) return `<div class="${cls}${round}"><img src="${src}" alt="Foto ${esc(item.nama)}" loading="lazy" decoding="async" width="120" height="120" /></div>`;
  return `<div class="${cls}">${CATEGORY_ART[item.kategori] || CATEGORY_ART.nasi}</div>`;
};

// ================= Best seller =================
export function initBestSeller() {
  const track = $('#bs-track');
  const items = [...ITEMS.values()].filter((i) => i.bestSeller).sort((a, b) => a.bestSeller - b.bestSeller);
  track.innerHTML = items.map((item, i) => {
    const src = photoFor(item.id);
    const img = src
      ? `<img class="bs-card__img" src="${src}" alt="Foto ${esc(item.nama)}" loading="lazy" decoding="async" width="320" height="240" />`
      : `<div class="bs-card__img" style="display:grid;place-items:center">${CATEGORY_ART[item.kategori]}</div>`;
    return `
      <article class="bs-card" aria-label="${esc(item.nama)}">
        <div class="bs-card__top">
          <span class="bs-card__badge">${icon('i-star')} BEST SELLER</span>
          <span class="bs-card__rank" aria-hidden="true">#${i + 1}</span>
          ${img}
        </div>
        <div class="bs-card__body">
          <h3 class="bs-card__name">${esc(item.nama)}</h3>
          <p class="bs-card__desc">${esc(item.deskripsi || '')}</p>
          <div class="bs-card__foot">
            <span class="bs-card__price price-tag">${rupiah(item.harga)}</span>
          </div>
        </div>
      </article>`;
  }).join('');

  const step = () => (track.querySelector('.bs-card')?.offsetWidth || 300) + 18;
  $('[data-bs-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-bs-next]').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  if (reducedMotion()) return;
  const cards = $$('.bs-card', track);
  gsap.set(cards, { y: 90, rotation: -7 });
  ScrollTrigger.create({
    trigger: track,
    start: 'top 85%',
    once: true,
    onEnter: () => gsap.to(cards, {
      y: 0, rotation: (i) => (i % 2 ? 2 : -2), duration: 0.8, stagger: 0.09, ease: 'back.out(1.7)'
    })
  });
}

// ================= Menu lengkap =================
export function initMenu() {
  const tabsEl = $('#menu-tabs');
  const list = $('#menu-list');
  const empty = $('#menu-empty');
  const search = $('#menu-search');
  const panel = $('#menu-panel');
  let active = MENU.kategori[0].id;

  $('#menu-note').innerHTML = `<strong>*Harga berlaku mulai ${esc(MENU.berlaku)}</strong>`;

  tabsEl.innerHTML = MENU.kategori.map((k) => `
    <button type="button" class="tab" role="tab" id="tab-${k.id}" data-tab="${k.id}"
      aria-controls="menu-panel" aria-selected="${k.id === active}" tabindex="${k.id === active ? 0 : -1}">
      ${esc(k.nama)}<span class="tab__count">${k.items.length}</span>
    </button>`).join('');

  const rowsHtml = (items) => items.map((item) => `
    <li class="menu-item">
      ${thumb(item)}
      <div>
        <p class="menu-item__name">${esc(item.nama)}</p>
        <p class="menu-item__price">${rupiah(item.harga)}</p>
      </div>
    </li>`).join('');

  const animateIn = () => {
    if (reducedMotion()) return;
    gsap.from($$('.menu-item', list).slice(0, 10), { y: 16, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out', clearProps: 'all' });
  };
  const refresh = debounce(() => ScrollTrigger.refresh(), 150);

  const render = () => {
    const q = search.value.trim().toLowerCase();
    if (q) {
      const groups = MENU.kategori
        .map((k) => ({ k, items: k.items.filter((i) => i.nama.toLowerCase().includes(q)).map((i) => ITEMS.get(i.id)) }))
        .filter((g) => g.items.length);
      list.innerHTML = groups.map((g) => `<li class="menu-group-title"><span class="pill">${esc(g.k.nama)}</span></li>${rowsHtml(g.items)}`).join('');
      empty.hidden = groups.length > 0;
      panel.removeAttribute('aria-labelledby');
    } else {
      const kat = MENU.kategori.find((k) => k.id === active);
      list.innerHTML = rowsHtml(kat.items.map((i) => ITEMS.get(i.id)));
      empty.hidden = true;
      panel.setAttribute('aria-labelledby', `tab-${active}`);
    }
    $$('.tab', tabsEl).forEach((t) => {
      const on = !q && t.dataset.tab === active;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on || (q && t === tabsEl.firstElementChild) ? 0 : -1;
    });
    animateIn();
    refresh();
  };

  const select = (id, focus = false) => {
    active = id;
    search.value = '';
    render();
    const tab = $(`#tab-${id}`);
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    if (focus) tab.focus({ preventScroll: true });
    // Kalau tab sticky sudah lewat, kembalikan ke awal daftar menu
    const top = $('#menu-tabs-wrap').getBoundingClientRect().top;
    if (top <= 1) $('#menu-list').scrollIntoView({ block: 'start' });
  };

  tabsEl.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) select(t.dataset.tab);
  });
  tabsEl.addEventListener('keydown', (e) => {
    const ids = MENU.kategori.map((k) => k.id);
    const i = ids.indexOf(document.activeElement?.dataset.tab);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % ids.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + ids.length) % ids.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = ids.length - 1;
    if (n === null) return;
    e.preventDefault();
    select(ids[n], true);
  });
  search.addEventListener('input', debounce(render, 120));

  render();
}
