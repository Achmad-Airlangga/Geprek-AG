import { gsap } from 'gsap';
import { $, reducedMotion } from './utils.js';
import { playChiliBurst } from './chili.js';

export function heroIntro() {
  if (reducedMotion()) return;
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.8)' } });
  // Hanya transform (tanpa opacity 0) supaya teks & foto hero tetap terhitung LCP sejak awal.
  tl.from('#hero-logo', { scale: 0.4, rotation: -20, duration: 0.6 })
    .from('.hero__line', { y: 40, rotation: -3, duration: 0.6, stagger: 0.1 }, '-=0.4')
    .from('.hero__sticker', { scale: 0.5, rotation: 12, duration: 0.5 }, '-=0.35')
    .from('.hero__ctas .btn', { scale: 0.85, duration: 0.45, stagger: 0.08 }, '-=0.3')
    .from('.hero__plate', { scale: 0.7, rotation: 10, y: 40, duration: 0.8, ease: 'elastic.out(1, 0.6)' }, 0.1);
  gsap.to('.hero__spark', { scale: 1.4, rotation: 45, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.3 });
}

/**
 * Ledakan cabai di belakang teks & foto hero, diputar setiap kali halaman dibuka
 * (saat loader mulai tergeser). Dilewati kalau pengunjung datang lewat link #section.
 */
export function heroChili() {
  if (reducedMotion() || location.hash.length > 1) return;
  const hero = $('#beranda');
  if (hero) playChiliBurst(hero);
}
