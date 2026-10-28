import { gsap } from 'gsap';
import { $, $$, reducedMotion } from './utils.js';
import { lockScroll, unlockScroll } from './scroll.js';
import { preloadSound, playKokok } from './sound.js';

const CIRC = 2 * Math.PI * 46; // keliling lingkaran progres (r = 46)
const FAILSAFE_MS = 12000;

function imageReady(img) {
  if (img.complete) return Promise.resolve();
  return new Promise((res) => {
    img.addEventListener('load', res, { once: true });
    img.addEventListener('error', res, { once: true });
  });
}

function fontTasks() {
  if (!document.fonts) return [];
  const faces = ['500 1em Poppins', '700 1em Poppins', '400 1em "Bebas Neue"', '400 1em "Kaushan Script"'];
  return faces.map((f) => document.fonts.load(f)).concat(document.fonts.ready);
}

/** Semua yang dihitung loader: gambar non-lazy, font, audio, dan window.load. Iframe peta tidak ikut. */
function collectTasks() {
  const imgs = $$('img').filter((img) => img.loading !== 'lazy').map(imageReady);
  const pageLoad = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((res) => window.addEventListener('load', res, { once: true }));
  return [...imgs, ...fontTasks(), preloadSound(), pageLoad];
}

/**
 * Menjalankan loader. `onReveal` dipanggil saat overlay mulai tergeser (untuk intro hero),
 * promise selesai setelah overlay hilang dan scroll dibuka.
 */
export function runLoader({ onReveal } = {}) {
  const loader = $('#loader');
  if (!loader) { onReveal?.(); return Promise.resolve(); }

  lockScroll('loader', true);
  const bar = $('#loader-bar');
  const pct = $('#loader-pct');
  const shown = { p: 0 };
  const render = () => {
    bar.style.strokeDashoffset = String(CIRC * (1 - shown.p));
    pct.textContent = String(Math.round(shown.p * 100));
  };

  return new Promise((resolve) => {
    const tasks = collectTasks();
    const total = tasks.length;
    let done = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(failsafe);
      celebrate(loader, onReveal).then(resolve);
    };

    const step = () => {
      const target = Math.min(done / total, 1);
      gsap.to(shown, {
        p: target, duration: 0.45, ease: 'power2.out', overwrite: true, onUpdate: render,
        onComplete: () => { if (target >= 1) finish(); }
      });
    };

    const failsafe = setTimeout(() => { done = total; step(); }, FAILSAFE_MS);
    tasks.forEach((t) => Promise.resolve(t).catch(() => {}).finally(() => { done += 1; step(); }));
  });
}

function celebrate(loader, onReveal) {
  const disc = $('#loader-disc');
  const ring = $('#loader-ring');
  const text = $('#loader-text');
  const bubble = $('#crow-bubble');
  const lines = $('.crow-bubble__lines', bubble);
  const chicken = $('#chicken');
  const comb = $('#comb');
  const beakTop = $('#beak-top');
  const beakBottom = $('#beak-bottom');
  const bar = $('#loader-bar');

  return new Promise((resolve) => {
    const end = () => {
      loader.remove();
      document.documentElement.classList.remove('is-loading');
      unlockScroll('loader');
      resolve();
    };

    if (reducedMotion()) {
      // Versi singkat: tanpa lompatan, cukup paruh membuka sekali lalu memudar.
      gsap.timeline({ onComplete: end })
        .set(bar, { strokeDashoffset: 0 })
        .to([ring, text], { opacity: 0, duration: 0.2 })
        .call(playKokok)
        .set(beakTop, { rotation: -20, svgOrigin: '672 330' })
        .set(beakBottom, { rotation: 26, svgOrigin: '684 384' })
        .to(bubble, { opacity: 1, scale: 1, duration: 0.2 }, '<')
        .set([beakTop, beakBottom], { rotation: 0 }, '+=0.6')
        .call(() => onReveal?.())
        .to(loader, { opacity: 0, duration: 0.35 });
      return;
    }

    const lift = Math.min(disc.offsetHeight * 0.5, 140);
    const tl = gsap.timeline({ onComplete: end });

    // 1. Lingkaran menutup penuh lalu memudar
    tl.to(bar, { strokeDashoffset: 0, duration: 0.2, ease: 'power1.out' })
      .to(ring, { opacity: 0, scale: 1.25, duration: 0.35, ease: 'power2.out' }, '+=0.05')
      .to(text, { opacity: 0, y: 10, duration: 0.25 }, '<')

    // 2. Lompat seperti ayam: squash → stretch → naik → mendarat dengan squash kecil
      .to(disc, { scaleX: 1.16, scaleY: 0.78, transformOrigin: '50% 100%', duration: 0.16, ease: 'power2.out' })
      .to(disc, { scaleX: 0.9, scaleY: 1.12, y: -lift, duration: 0.34, ease: 'power2.out' })
      .to(disc, { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'sine.out' }, '-=0.16')
      .to(disc, { y: 0, duration: 0.28, ease: 'power2.in' })
      .to(disc, { scaleX: 1.08, scaleY: 0.9, duration: 0.09, ease: 'power1.out' })
      .to(disc, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' })

    // 3–4. Berkokok: kepala mendongak, paruh buka-tutup 3x + suara, jengger bergoyang, gelembung teks
      .addLabel('crow', '-=0.35')
      .to(chicken, { rotation: -14, svgOrigin: '520 470', duration: 0.3, ease: 'back.out(2)' }, 'crow')
      .call(playKokok, null, 'crow+=0.12')
      .to(beakTop, { rotation: -24, svgOrigin: '672 330', duration: 0.16, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 'crow+=0.12')
      .to(beakBottom, { rotation: 30, svgOrigin: '684 384', duration: 0.16, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 'crow+=0.12')
      .to(comb, { rotation: 7, svgOrigin: '560 300', duration: 0.09, repeat: 11, yoyo: true, ease: 'sine.inOut' }, 'crow+=0.1')
      .fromTo(bubble, { scale: 0, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.35, ease: 'back.out(2.6)' }, 'crow+=0.15')
      .fromTo(lines, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1.08, duration: 0.07, repeat: 9, yoyo: true, transformOrigin: '50% 50%' }, 'crow+=0.2')
      .to(bubble, { x: '+=3', duration: 0.05, repeat: 13, yoyo: true, ease: 'none' }, 'crow+=0.45')
      .to(chicken, { rotation: 0, duration: 0.35, ease: 'power2.inOut' }, 'crow+=1.2')
      .to(bubble, { scale: 0, opacity: 0, duration: 0.25, ease: 'back.in(2)' }, 'crow+=1.3')

    // 5. Overlay tergeser ke atas
      .call(() => onReveal?.(), null, '+=0.05')
      .to(loader, { yPercent: -100, duration: 0.75, ease: 'power3.inOut' }, '<');
  });
}

/** Salinan logo untuk hero, id diganti supaya tetap unik di dokumen. */
export function cloneLogo(prefix) {
  const src = $('#logo');
  if (!src) return null;
  const svg = src.cloneNode(true);
  svg.removeAttribute('class');
  svg.setAttribute('aria-label', 'Geprek AG');
  svg.querySelectorAll('[id]').forEach((el) => { el.id = `${prefix}-${el.id}`; });
  svg.querySelectorAll('textPath').forEach((tp) => tp.setAttribute('href', `#${prefix}-geprek-arc`));
  svg.id = `${prefix}-logo`;
  return svg;
}
