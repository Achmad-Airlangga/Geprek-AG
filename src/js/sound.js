import { storage } from './utils.js';

const KEY = 'gag-sound';
const SRC = '/assets/audio/kokok.mp3';
let enabled = storage.get(KEY, true) !== false;
let audio = null;

/**
 * Unduh suara lewat fetch supaya progresnya pasti selesai di semua browser
 * (iOS tidak memuat <audio> sebelum ada sentuhan). File hilang = dianggap selesai.
 */
export async function preloadSound() {
  try {
    const res = await fetch(SRC);
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('audio')) throw new Error('kokok.mp3 belum ada');
    const blob = await res.blob();
    audio = new Audio(URL.createObjectURL(blob));
    audio.preload = 'auto';
  } catch {
    audio = null;
  }
}

export function playKokok() {
  if (!enabled || !audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    // Autoplay sering diblokir sebelum pengunjung menyentuh layar. Animasi tetap jalan tanpa suara.
    if (p && p.catch) p.catch(() => {});
  } catch { /* abaikan */ }
}

export function initSoundToggle(btn) {
  const render = () => {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', `Suara kokok: ${enabled ? 'nyala' : 'mati'}`);
    btn.title = enabled ? 'Matikan suara' : 'Nyalakan suara';
  };
  render();
  btn.addEventListener('click', () => {
    enabled = !enabled;
    storage.set(KEY, enabled);
    render();
    if (enabled) playKokok();
    else if (audio) audio.pause();
  });
}
