import { gsap } from 'gsap';
import { $, ITEMS, esc, rupiah, reducedMotion } from './utils.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const parseRupiah = (s) => Number(String(s).replace(/\D/g, '')) || 0;

const FOODS = [...ITEMS.values()].filter((i) => i.jenis === 'makanan');
const DRINKS = [...ITEMS.values()].filter((i) => i.jenis === 'minuman');
const MIN_COMBO = Math.min(...FOODS.map((f) => f.harga)) + Math.min(...DRINKS.map((d) => d.harga));

/** Pasangan acak makanan + minuman yang muat di budget (0 = bebas). */
function choose(budget) {
  if (!budget) return { food: pick(FOODS), drink: pick(DRINKS) };
  const pairs = [];
  for (const food of FOODS) {
    for (const drink of DRINKS) if (food.harga + drink.harga <= budget) pairs.push({ food, drink });
  }
  return pairs.length ? pick(pairs) : null;
}

const cell = (item) => `<div class="slot__cell"><span>${esc(item.nama)}<small>${rupiah(item.harga)}</small></span></div>`;

function spinReel(strip, pool, result, duration) {
  const filler = Array.from({ length: 18 }, () => pick(pool));
  strip.innerHTML = [...filler, result].map(cell).join('');
  const h = strip.firstElementChild.offsetHeight;
  if (reducedMotion()) {
    gsap.set(strip, { y: -h * filler.length });
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    gsap.fromTo(strip, { y: 0 }, {
      y: -h * filler.length, duration, ease: 'power3.out', onComplete: resolve
    });
  });
}

export function initTerserah() {
  const form = $('#terserah-form');
  const budgetInput = $('#budget');
  const btn = $('#spin-btn');
  const result = $('#terserah-result');
  const slot = $('#slot');
  const reelFood = $('#reel-food');
  const reelDrink = $('#reel-drink');

  reelFood.innerHTML = cell(FOODS[0]);
  reelDrink.innerHTML = cell(DRINKS.find((d) => d.id === 'ice-tea') || DRINKS[0]);

  budgetInput.addEventListener('input', () => {
    const n = parseRupiah(budgetInput.value);
    budgetInput.value = n ? n.toLocaleString('id-ID') : '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const budget = parseRupiah(budgetInput.value);
    const combo = choose(budget);
    if (!combo) {
      result.innerHTML = `<p class="result__title">Waduh, budgetnya kurang 😅</p>
        <p>Paket termurah makanan + minuman mulai <strong>${rupiah(MIN_COMBO)}</strong>. Tambah dikit lagi ya!</p>`;
      return;
    }
    btn.disabled = true;
    slot.classList.add('is-spinning');
    result.innerHTML = '';
    await Promise.all([
      spinReel(reelFood, FOODS, combo.food, 1.6),
      spinReel(reelDrink, DRINKS, combo.drink, 2.1)
    ]);
    slot.classList.remove('is-spinning');
    btn.disabled = false;
    const sum = combo.food.harga + combo.drink.harga;
    result.innerHTML = `
      <p class="result__title">Udah, makan ini aja!</p>
      <ul class="result__list">
        <li><span>${esc(combo.food.nama)}</span><span>${rupiah(combo.food.harga)}</span></li>
        <li><span>${esc(combo.drink.nama)}</span><span>${rupiah(combo.drink.harga)}</span></li>
      </ul>
      <p class="result__total"><span>Total</span><span>${rupiah(sum)}${budget ? ` <small>(sisa ${rupiah(budget - sum)})</small>` : ''}</span></p>
      <p class="result__note">Tinggal sebut ke kasir pas mampir ya!</p>
      <div class="result__actions">
        <button type="submit" form="terserah-form" class="btn btn--ghost">Putar Lagi</button>
      </div>`;
    if (!reducedMotion()) gsap.from(result, { y: 20, scale: 0.96, duration: 0.45, ease: 'back.out(2)' });
  });
}
