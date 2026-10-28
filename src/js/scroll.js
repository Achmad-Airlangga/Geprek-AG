import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './utils.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
/** reason → hard. Kunci "hard" juga memblokir wheel/touch/keyboard (loader & animasi cabai). */
const locks = new Map();
const root = document.documentElement;
const SCROLL_KEYS = new Set([' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);
let blocking = false;

const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const blockEvent = (e) => { if (e.cancelable) e.preventDefault(); };
const blockKeys = (e) => { if (SCROLL_KEYS.has(e.key) && !isTyping(e.target)) e.preventDefault(); };

function setBlocking(on) {
  if (on === blocking) return;
  blocking = on;
  const fn = on ? 'addEventListener' : 'removeEventListener';
  const opts = { passive: false, capture: true };
  window[fn]('wheel', blockEvent, opts);
  window[fn]('touchmove', blockEvent, opts);
  window[fn]('keydown', blockKeys, opts);
}

function apply() {
  const locked = locks.size > 0;
  root.classList.toggle('is-locked', locked);
  setBlocking([...locks.values()].some(Boolean));
  if (!lenis) return;
  if (locked) lenis.stop(); else lenis.start();
}

export function lockScroll(reason, hard = false) { locks.set(reason, hard); apply(); }
export function unlockScroll(reason) { locks.delete(reason); apply(); }

/** Setelah loader: mulai dari atas, atau dari section di #hash kalau pengunjung datang lewat link langsung. */
export function resetScroll() {
  const hashTarget = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true, force: true });
  if (hashTarget) scrollToTarget(hashTarget, { duration: 0.8 });
  return Boolean(hashTarget);
}

export function initLenis() {
  if (reducedMotion()) return null;
  lenis = new Lenis({ autoRaf: false, lerp: 0.12, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  apply();
  return lenis;
}

export function scrollToTarget(target, { offset = 0, duration = 1.2 } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
}

/** Link internal [data-scroll-to] bergeser halus lewat Lenis. */
export function bindScrollLinks(rootEl = document) {
  rootEl.addEventListener('click', (e) => {
    const a = e.target.closest('[data-scroll-to]');
    if (!a) return;
    e.preventDefault();
    scrollToTarget(a.dataset.scrollTo);
  });
}
