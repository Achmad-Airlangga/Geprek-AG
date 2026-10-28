import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $ } from './js/utils.js';
import { initLenis, bindScrollLinks, resetScroll } from './js/scroll.js';
import { initSoundToggle } from './js/sound.js';
import { runLoader, cloneLogo } from './js/loader.js';
import { heroIntro, heroChili } from './js/hero.js';
import { initBestSeller, initMenu } from './js/menu.js';
import { initLevel } from './js/level.js';
import { initTerserah } from './js/terserah.js';
import { initApps, initReveals } from './js/extras.js';
import { bindConfig, initOpenStatus, initFooter, initMeander } from './js/footer.js';

window.__gagBoot = true;
window.scrollTo(0, 0);

// Logo hero adalah salinan logo loader (dibuat sebelum loader dihapus).
const heroLogo = cloneLogo('hero');
if (heroLogo) $('#hero-logo').appendChild(heroLogo);

initSoundToggle($('#sound-toggle'));
initLenis();
bindScrollLinks();

// Bagian statis dirender sekarang, di belakang loader.
bindConfig();
initOpenStatus();
initMeander();
initBestSeller();
initMenu();
initLevel();
initTerserah();
initApps();
initFooter();

runLoader({ onReveal: () => { heroIntro(); heroChili(); } }).then(() => {
  initReveals();
  ScrollTrigger.refresh();
  resetScroll();
});
