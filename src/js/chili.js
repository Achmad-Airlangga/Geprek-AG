import { gsap } from 'gsap';
import { isSmallScreen } from './utils.js';

const rand = (a, b) => a + Math.random() * (b - a);
const TOTAL_MS = 2300;

/**
 * Puluhan cabai SVG terbang dari bawah ke atas di dalam `host`, dengan bara api di canvas.
 * Lapisannya berada di belakang konten host (lihat .chili-layer di sections.css).
 * Posisi cabai dihitung sendiri tiap frame supaya canvas tahu di mana "ekor" tiap cabai.
 */
export function playChiliBurst(host) {
  const mobile = isSmallScreen();
  const COUNT = mobile ? 20 : 34;
  const MAX_EMBERS = mobile ? 140 : 320;
  const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
  const W = host.clientWidth;
  const H = host.clientHeight;

  const layer = document.createElement('div');
  layer.className = 'chili-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<canvas></canvas>';
  const canvas = layer.querySelector('canvas');
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const chilies = Array.from({ length: COUNT }, (_, i) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', 'chili');
    el.setAttribute('viewBox', '0 0 40 100');
    const green = i % 6 === 5;
    el.innerHTML = `<use href="#chili-${green ? 'green' : 'red'}"/>`;
    layer.appendChild(el);
    const scale = rand(0.55, mobile ? 1.05 : 1.3);
    return {
      el, scale,
      x0: rand(-20, W - 20),
      y0: H + rand(20, 160),
      y1: -180 - rand(0, 120),
      delay: rand(0, 650),
      dur: rand(1050, 1650),
      amp: rand(18, mobile ? 46 : 80),
      freq: rand(0.8, 2.2),
      phase: rand(0, Math.PI * 2),
      tilt: rand(-22, 22),
      x: 0, y: 0, rot: 0, alive: false
    };
  });
  host.prepend(layer);

  const embers = [];
  const start = performance.now();
  let frame = 0;

  return new Promise((resolve) => {
    const tick = () => {
      const now = performance.now() - start;
      frame += 1;
      ctx.clearRect(0, 0, W, H);

      for (const c of chilies) {
        const t = (now - c.delay) / c.dur;
        if (t < 0 || t > 1) {
          if (c.alive) { c.el.style.visibility = 'hidden'; c.alive = false; }
          continue;
        }
        c.alive = true;
        const eased = t * t * (1.6 - 0.6 * t); // akselerasi seperti roket
        const wave = Math.sin(t * c.freq * Math.PI * 2 + c.phase);
        c.x = c.x0 + wave * c.amp;
        c.y = c.y0 + (c.y1 - c.y0) * eased;
        c.rot = c.tilt + Math.cos(t * c.freq * Math.PI * 2 + c.phase) * 14;
        c.el.style.visibility = 'visible';
        c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) rotate(${c.rot}deg) scale(${c.scale})`;

        // Bara keluar dari pangkal cabai (bagian bawah saat terbang ke atas)
        if (embers.length < MAX_EMBERS && (!mobile || frame % 2 === 0)) {
          const rad = (c.rot * Math.PI) / 180;
          const half = 46 * c.scale;
          const tx = c.x + 20 - Math.sin(rad) * half;
          const ty = c.y + 50 + Math.cos(rad) * half;
          const n = mobile ? 1 : 2;
          for (let k = 0; k < n; k++) {
            embers.push({
              x: tx + rand(-4, 4), y: ty + rand(-2, 6),
              vx: rand(-0.6, 0.6), vy: rand(-1.4, -0.3),
              life: 1, decay: rand(0.018, 0.035),
              r: rand(1.2, 3.6) * (0.7 + c.scale * 0.4),
              hue: rand(18, 48)
            });
          }
        }
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02;
        p.life -= p.decay;
        if (p.life <= 0) { embers.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${p.hue}, 100%, ${50 + p.life * 20}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.5 + p.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (now >= TOTAL_MS) {
        gsap.ticker.remove(tick);
        gsap.to(layer, { opacity: 0, duration: 0.2, onComplete: () => { layer.remove(); resolve(); } });
      }
    };
    gsap.ticker.add(tick);
  });
}
