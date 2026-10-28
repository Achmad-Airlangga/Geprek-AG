import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './src/config.js';

const MENU_PHOTO_DIR = path.resolve('public/assets/menu');
const MENU_JSON = path.resolve('src/data/menu.json');
const PHOTO_EXT = /\.(webp|jpe?g|png|avif)$/i;

/**
 * `import photos from 'virtual:menu-photos'` → { "nasi-ag-spesial": "/assets/menu/nasi-ag-spesial.webp", ... }
 * Cukup taruh file bernama <id-menu>.webp di public/assets/menu/ dan fotonya otomatis tampil.
 */
function menuPhotos() {
  const id = 'virtual:menu-photos';
  const resolved = '\0' + id;
  const read = () => {
    const map = {};
    if (!fs.existsSync(MENU_PHOTO_DIR)) return map;
    for (const file of fs.readdirSync(MENU_PHOTO_DIR)) {
      if (!PHOTO_EXT.test(file)) continue;
      const key = file.replace(PHOTO_EXT, '');
      // Kalau ada beberapa format untuk id yang sama, WebP menang.
      if (!map[key] || file.endsWith('.webp')) map[key] = `/assets/menu/${file}`;
    }
    return map;
  };
  return {
    name: 'menu-photos',
    resolveId: (source) => (source === id ? resolved : null),
    load: (source) => (source === resolved ? `export default ${JSON.stringify(read())};` : null),
    configureServer(server) {
      const reload = (file) => {
        if (!path.resolve(file).startsWith(MENU_PHOTO_DIR)) return;
        const mod = server.moduleGraph.getModuleById(resolved);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(MENU_PHOTO_DIR);
      server.watcher.on('add', reload);
      server.watcher.on('unlink', reload);
    }
  };
}

/** Menyuntikkan schema.org Restaurant + URL Open Graph dari config.js dan menu.json ke index.html. */
function seoFromConfig() {
  return {
    name: 'seo-from-config',
    transformIndexHtml(html) {
      const menu = JSON.parse(fs.readFileSync(MENU_JSON, 'utf8'));
      const site = CONFIG.siteUrl.replace(/\/$/, '');
      const abs = (p) => (site ? site + p : p);
      const prices = menu.kategori.flatMap((k) => k.items.map((i) => i.harga));
      const [buka, tutup] = [CONFIG.jamBuka.buka, CONFIG.jamBuka.tutup];

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Geprek AG',
        slogan: 'Yang Penting Murah, Yang Penting Enak',
        image: abs('/assets/og-image.jpg'),
        logo: abs('/assets/logo.png'),
        ...(site && { url: site + '/' }),
        telephone: '+' + CONFIG.whatsapp[0].wa,
        servesCuisine: ['Indonesia', 'Ayam Geprek'],
        priceRange: `Rp${Math.min(...prices) / 1000}rb - Rp${Math.max(...prices) / 1000}rb`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jl. KH. Abdul Karim No.1B, Lirboyo',
          addressLocality: 'Kota Kediri',
          addressRegion: 'Jawa Timur',
          addressCountry: 'ID'
        },
        geo: { '@type': 'GeoCoordinates', latitude: CONFIG.geo.lat, longitude: CONFIG.geo.lng },
        hasMap: CONFIG.mapsLink,
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: buka,
          closes: tutup
        }],
        sameAs: [CONFIG.instagram, CONFIG.tiktok, CONFIG.gofood, CONFIG.grabfood, CONFIG.shopeefood].filter(Boolean),
        hasMenu: {
          '@type': 'Menu',
          name: 'Menu Geprek AG',
          hasMenuSection: menu.kategori.map((k) => ({
            '@type': 'MenuSection',
            name: k.nama,
            hasMenuItem: k.items.map((i) => ({
              '@type': 'MenuItem',
              name: i.nama,
              offers: { '@type': 'Offer', price: i.harga, priceCurrency: 'IDR' }
            }))
          }))
        }
      };

      const tags = [
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema), injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: abs('/assets/og-image.jpg') }, injectTo: 'head' }
      ];
      if (site) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: site + '/' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: site + '/' }, injectTo: 'head' }
        );
      }
      return { html, tags };
    }
  };
}

export default defineConfig({
  plugins: [menuPhotos(), seoFromConfig()],
  build: { target: 'es2020', cssMinify: true }
});
