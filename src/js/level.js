import { gsap } from 'gsap';
import { $, $$, ITEMS, rupiah, reducedMotion } from './utils.js';

const LEVELS = {
  1: { bg: '#F4A340', komentar: 'Aman buat pemula. Masih bisa senyum manis 😄' },
  2: { bg: '#EC7A2E', komentar: 'Mulai anget-anget di lidah, belum keringetan.' },
  3: { bg: '#E04A28', komentar: 'Keringetan dikit, tapi nagihnya kebangetan.' },
  4: { bg: '#C4262A', komentar: 'Mulut kebakar, hati bahagia. Siapin es teh!' },
  5: { bg: '#7E1418', komentar: 'Siapin susu ya... Ini bukan buat yang lemah iman 🥵' }
};

export function initLevel() {
  const section = $('#level-pedas');
  const range = $('#level-range');
  const chilies = $('#level-chilies');
  const card = $('.level__card', section);
  const byLevel = new Map([...ITEMS.values()].filter((i) => i.levelPedas).map((i) => [i.levelPedas, i]));

  chilies.innerHTML = [1, 2, 3, 4, 5].map((n) =>
    `<svg class="level__chili" data-n="${n}" viewBox="0 0 40 100"><use href="#chili-red"/></svg>`).join('');
  const icons = $$('.level__chili', chilies);
  let current = 0;

  const update = (lv, animate = true) => {
    const item = byLevel.get(lv);
    const info = LEVELS[lv];
    $('#level-num').textContent = String(lv);
    $('#level-price').textContent = rupiah(item.harga);
    $('#level-comment').textContent = info.komentar;
    range.setAttribute('aria-valuetext', `Level ${lv}, ${rupiah(item.harga)}`);
    icons.forEach((el, i) => el.classList.toggle('is-on', i < lv));

    const motion = animate && !reducedMotion();
    gsap.to(section, { backgroundColor: info.bg, duration: motion ? 0.5 : 0 });
    if (motion) {
      if (lv > current) gsap.fromTo(icons[lv - 1], { scale: 0.3, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' });
      gsap.fromTo('#level-comment', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
      if (lv >= 4) {
        gsap.fromTo(card, { x: -5 }, {
          x: 5, duration: 0.05, repeat: lv === 5 ? 7 : 3, yoyo: true, ease: 'none',
          onComplete: () => gsap.set(card, { x: 0 })
        });
      }
    }
    current = lv;
  };

  range.addEventListener('input', () => update(Number(range.value)));
  update(1, false);
}
