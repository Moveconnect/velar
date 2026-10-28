(() => {
'use strict';

/* =========================================================
   CONFIGURAZIONE
   In produzione questi valori arrivano dal pannello di gestione.
   ========================================================= */
const CONFIG = {
  baseUrl: 'https://velar.it',
  // Video della hero: inserire i file compressi (sotto i 4 MB) e le immagini statiche iniziali.
  heroVideo: {
    desktop: { webm: '', mp4: '', poster: '' },   // orizzontale
    mobile:  { webm: '', mp4: '', poster: '' }    // verticale 9:16
  },
  profiles: {                                     // da verificare
    tiktok: 'https://www.tiktok.com/@velar',
    youtube: 'https://www.youtube.com/@velar',
    instagram: 'https://www.instagram.com/velar'
  },
  contacts: { shop: 'shop@velar.it', returns: 'resi@velar.it', phone: '' } // telefono da verificare
};

/* ---------- utilità ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const pad = n => String(n).padStart(2, '0');
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const store = {
  get(k, d) { try { const v = localStorage.getItem('velar:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('velar:' + k, JSON.stringify(v)); } catch (e) { /* archiviazione non disponibile */ } }
};

/* =========================================================
   TESTI (italiano / inglese). Il claim resta in inglese.
   ========================================================= */
const STR = window.VELAR_STR;

/* Indirizzi: nella cartella del sito ogni lingua ha la sua pagina (/it/ e /en/, data-route="folders");
   nell'anteprima a file unico la lingua si cambia nella pagina (#it / #en). */
const ROUTE = document.documentElement.dataset.route === 'folders' ? 'folders' : 'hash';
const PAGE_LANG = document.documentElement.dataset.locale;
let lang = (() => {
  if (ROUTE === 'folders') return PAGE_LANG === 'en' ? 'en' : 'it';
  const h = location.hash.replace('#', '');
  if (h === 'it' || h === 'en') return h;
  return store.get('lang', 'it') === 'en' ? 'en' : 'it';
})();
const t = (k, v) => {
  let s = STR[lang][k] ?? STR.it[k] ?? k;
  if (v) s = s.replace(/\{(\w+)\}/g, (m, x) => (v[x] ?? m));
  return s;
};
const L = arr => arr[lang === 'it' ? 0 : 1];           // [it, en]
const LC = col => col[lang === 'it' ? 1 : 2];          // [hex, it, en]
const fmt = n => new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-IE', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2
}).format(n);
const joinList = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + arr[arr.length - 1];

/* =========================================================
   CATALOGO (dimostrativo)
   s: stile · c: categoria · f: formalità 1–3 · fit · pal: palette · se: stagioni
   v: forma dell'illustrazione · col: [hex, it, en] · out: taglie esaurite
   ========================================================= */
const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOT_SIZES = ['44', '46', '48', '50', '52', '54'];
const PRODUCTS = [
  // Minimal Elegante
  { id: 'm1', s: 'minimal', c: 'knit', v: 'crew', n: ['Maglione girocollo in merino', 'Merino crew-neck sweater'], sh: ['maglione in merino', 'merino sweater'], p: 89, f: 2, fit: 'regular', pal: 'neutral', se: ['mid', 'cold'], col: [['#9C9A94', 'Grigio melange', 'Grey melange'], ['#E6DFD2', 'Panna', 'Cream'], ['#2E2E2E', 'Antracite', 'Charcoal']], out: ['XXL'] },
  { id: 'm2', s: 'minimal', c: 'knit', v: 'turtle', n: ['Dolcevita in cashmere', 'Cashmere turtleneck'], sh: ['dolcevita in cashmere', 'cashmere turtleneck'], p: 149, f: 3, fit: 'slim', pal: 'dark', se: ['mid', 'cold'], col: [['#1D1D1D', 'Nero', 'Black'], ['#5A4A3E', 'Moka', 'Mocha']], out: ['XS'], nw: 1 },
  { id: 'm3', s: 'minimal', c: 'knit', v: 'cardigan', n: ['Cardigan in mohair', 'Mohair cardigan'], sh: ['cardigan in mohair', 'mohair cardigan'], p: 119, f: 2, fit: 'relaxed', pal: 'light', se: ['mid', 'cold'], col: [['#EDE6D9', 'Avorio', 'Ivory'], ['#C9B9A2', 'Sabbia', 'Sand']], out: [] },
  { id: 'm4', s: 'minimal', c: 'tee', v: 'tee', n: ['T-shirt in cotone pima', 'Pima cotton T-shirt'], sh: ['t-shirt in pima', 'pima T-shirt'], p: 35, f: 1, fit: 'regular', pal: 'light', se: ['warm', 'mid'], col: [['#FBFBF9', 'Bianco', 'White'], ['#1E1E1E', 'Nero', 'Black'], ['#B9B4AA', 'Grigio pietra', 'Stone grey']], out: [] },
  { id: 'm5', s: 'minimal', c: 'tee', v: 'polo', n: ['Polo in maglia fine', 'Fine-knit polo'], sh: ['polo in maglia', 'knit polo'], p: 59, f: 2, fit: 'slim', pal: 'dark', se: ['warm', 'mid'], col: [['#23283A', 'Blu notte', 'Midnight blue'], ['#1E1E1E', 'Nero', 'Black']], out: ['XXL'] },
  { id: 'm6', s: 'minimal', c: 'tee', v: 'tee', n: ['T-shirt boxy in jersey pesante', 'Heavy jersey boxy T-shirt'], sh: ['t-shirt boxy', 'boxy T-shirt'], p: 39, f: 1, fit: 'relaxed', pal: 'neutral', se: ['warm', 'mid'], col: [['#CFC6B6', 'Sabbia', 'Sand'], ['#8E8B84', 'Grigio', 'Grey']], out: [] },
  { id: 'm7', s: 'minimal', c: 'tee', v: 'tee', n: ['T-shirt a costine', 'Ribbed T-shirt'], sh: ['t-shirt a costine', 'ribbed T-shirt'], p: 42, f: 1.5, fit: 'slim', pal: 'color', se: ['warm', 'mid'], col: [['#9DAA94', 'Salvia', 'Sage']], out: ['XS'] },
  { id: 'm8', s: 'minimal', c: 'pants', v: 'tailored', n: ['Pantalone sartoriale con pinces', 'Pleated tailored trousers'], sh: ['pantalone sartoriale', 'tailored trousers'], p: 99, f: 3, fit: 'regular', pal: 'neutral', se: ['warm', 'mid', 'cold'], col: [['#8C8678', 'Tortora', 'Taupe'], ['#2A2A2A', 'Antracite', 'Charcoal']], out: ['54'] },
  { id: 'm9', s: 'minimal', c: 'pants', v: 'chino', n: ['Chino in twill di cotone', 'Cotton twill chinos'], sh: ['chino', 'chinos'], p: 79, f: 2, fit: 'slim', pal: 'light', se: ['warm', 'mid'], col: [['#E3D9C6', 'Ecru', 'Ecru'], ['#C2B396', 'Kaki', 'Khaki']], out: [] },
  { id: 'm10', s: 'minimal', c: 'pants', v: 'tailored', n: ['Pantalone ampio in lana fredda', 'Wide-leg tropical wool trousers'], sh: ['pantalone ampio in lana', 'wide wool trousers'], p: 119, f: 3, fit: 'relaxed', pal: 'dark', se: ['mid', 'cold'], col: [['#1D1D1F', 'Nero', 'Black'], ['#3B3A46', 'Grafite', 'Graphite']], out: ['44'] },
  { id: 'm11', s: 'minimal', c: 'jacket', v: 'blazer', n: ['Blazer destrutturato in lana', 'Unstructured wool blazer'], sh: ['blazer in lana', 'wool blazer'], p: 219, f: 3, fit: 'regular', pal: 'dark', se: ['mid', 'cold'], col: [['#262A33', 'Blu navy', 'Navy'], ['#2B2B2B', 'Antracite', 'Charcoal']], out: [] },
  { id: 'm12', s: 'minimal', c: 'jacket', v: 'trench', n: ['Trench in gabardine', 'Gabardine trench coat'], sh: ['trench', 'trench coat'], p: 249, f: 2, fit: 'relaxed', pal: 'neutral', se: ['mid'], col: [['#C8B28C', 'Beige', 'Beige'], ['#8A7D6A', 'Fango', 'Mud']], out: ['XS'] },
  { id: 'm13', s: 'minimal', c: 'jacket', v: 'work', n: ['Giacca camicia in lana', 'Wool shirt jacket'], sh: ['giacca camicia', 'shirt jacket'], p: 169, f: 2, fit: 'slim', pal: 'color', se: ['mid', 'cold'], col: [['#3F5444', 'Verde bosco', 'Forest green']], out: [] },
  { id: 'm14', s: 'minimal', c: 'shirt', v: 'shirt', n: ['Camicia in popeline', 'Poplin shirt'], sh: ['camicia in popeline', 'poplin shirt'], p: 69, f: 3, fit: 'slim', pal: 'light', se: ['warm', 'mid', 'cold'], col: [['#F8F8F6', 'Bianco', 'White'], ['#CBD5E1', 'Celeste', 'Light blue']], out: [] },
  { id: 'm15', s: 'minimal', c: 'shirt', v: 'shirt', n: ['Camicia in lino', 'Linen shirt'], sh: ['camicia in lino', 'linen shirt'], p: 75, f: 1.5, fit: 'relaxed', pal: 'neutral', se: ['warm'], col: [['#D8CDB8', 'Naturale', 'Natural'], ['#F4F1EA', 'Bianco latte', 'Off-white']], out: ['XS'] },
  { id: 'm16', s: 'minimal', c: 'shirt', v: 'oxford', n: ['Camicia oxford azzurra', 'Blue oxford shirt'], sh: ['camicia oxford', 'oxford shirt'], p: 69, f: 2, fit: 'regular', pal: 'color', se: ['warm', 'mid', 'cold'], col: [['#A9C0DA', 'Azzurro', 'Blue']], out: [], nw: 1 },
  // Streetwear & Oversize
  { id: 's1', s: 'street', c: 'knit', v: 'hoodie', n: ['Felpa oversize con cappuccio', 'Oversized hoodie'], sh: ['felpa con cappuccio', 'hoodie'], p: 79, f: 1, fit: 'relaxed', pal: 'dark', se: ['mid', 'cold'], col: [['#232323', 'Nero', 'Black'], ['#6E6E6A', 'Grigio fumo', 'Smoke grey']], out: [] },
  { id: 's2', s: 'street', c: 'knit', v: 'chunky', n: ['Girocollo in maglia grossa', 'Chunky crew-neck knit'], sh: ['maglione in maglia grossa', 'chunky knit'], p: 95, f: 2, fit: 'relaxed', pal: 'neutral', se: ['cold'], col: [['#D9D1C3', 'Panna', 'Cream'], ['#7A6E5F', 'Tabacco', 'Tobacco']], out: ['XS'] },
  { id: 's3', s: 'street', c: 'knit', v: 'sweat', n: ['Felpa girocollo tinta in capo', 'Garment-dyed sweatshirt'], sh: ['felpa girocollo', 'sweatshirt'], p: 69, f: 1, fit: 'regular', pal: 'color', se: ['mid', 'cold'], col: [['#B5653E', 'Ruggine', 'Rust'], ['#5E7A8C', 'Blu polvere', 'Dusty blue']], out: [], nw: 1 },
  { id: 's4', s: 'street', c: 'tee', v: 'tee', n: ['T-shirt oversize heavyweight', 'Heavyweight oversized T-shirt'], sh: ['t-shirt oversize', 'oversized T-shirt'], p: 39, f: 1, fit: 'relaxed', pal: 'light', se: ['warm', 'mid'], col: [['#F6F5F1', 'Bianco', 'White'], ['#1E1E1E', 'Nero', 'Black']], out: [] },
  { id: 's5', s: 'street', c: 'tee', v: 'graphic', n: ['T-shirt con stampa', 'Graphic T-shirt'], sh: ['t-shirt con stampa', 'graphic T-shirt'], p: 45, f: 1, fit: 'regular', pal: 'dark', se: ['warm', 'mid'], col: [['#1E1E1E', 'Nero', 'Black'], ['#3D4A3A', 'Verde militare', 'Army green']], out: ['XS'] },
  { id: 's6', s: 'street', c: 'tee', v: 'stripes', n: ['Maglia a righe a maniche lunghe', 'Striped long-sleeve T-shirt'], sh: ['maglia a righe', 'striped long-sleeve'], p: 49, f: 1.5, fit: 'regular', pal: 'color', se: ['mid'], col: [['#F3F1EC', 'Righe blu', 'Blue stripes']], c2: '#2D3A6B', out: [] },
  { id: 's7', s: 'street', c: 'pants', v: 'cargo', n: ['Cargo in ripstop', 'Ripstop cargo trousers'], sh: ['cargo', 'cargos'], p: 89, f: 1, fit: 'relaxed', pal: 'neutral', se: ['warm', 'mid', 'cold'], col: [['#7C7A62', 'Oliva', 'Olive'], ['#2A2A2A', 'Nero', 'Black']], out: [] },
  { id: 's8', s: 'street', c: 'pants', v: 'jeans', n: ['Jeans baggy', 'Baggy jeans'], sh: ['jeans baggy', 'baggy jeans'], p: 99, f: 1.5, fit: 'relaxed', pal: 'dark', se: ['warm', 'mid', 'cold'], col: [['#2F3D55', 'Denim scuro', 'Dark denim'], ['#7088A8', 'Denim chiaro', 'Light denim']], out: ['54'], nw: 1 },
  { id: 's9', s: 'street', c: 'pants', v: 'carpenter', n: ['Pantalone carpenter in tela', 'Canvas carpenter trousers'], sh: ['carpenter in tela', 'carpenter trousers'], p: 85, f: 2, fit: 'regular', pal: 'light', se: ['warm', 'mid'], col: [['#E2D8C3', 'Ecru', 'Ecru'], ['#B79B6E', 'Ocra', 'Ochre']], out: [] },
  { id: 's10', s: 'street', c: 'pants', v: 'jeans', n: ['Jeans affusolato nero', 'Black tapered jeans'], sh: ['jeans affusolato', 'tapered jeans'], p: 89, f: 2, fit: 'slim', pal: 'dark', se: ['warm', 'mid', 'cold'], col: [['#1F1F22', 'Nero', 'Black']], out: [] },
  { id: 's11', s: 'street', c: 'jacket', v: 'bomber', n: ['Bomber imbottito', 'Padded bomber jacket'], sh: ['bomber', 'bomber'], p: 159, f: 1.5, fit: 'regular', pal: 'dark', se: ['mid', 'cold'], col: [['#1F2326', 'Nero', 'Black'], ['#4A5240', 'Verde militare', 'Army green']], out: [] },
  { id: 's12', s: 'street', c: 'jacket', v: 'work', n: ['Giacca workwear in tela', 'Canvas workwear jacket'], sh: ['giacca workwear', 'workwear jacket'], p: 139, f: 2, fit: 'relaxed', pal: 'neutral', se: ['mid'], col: [['#A07D52', 'Tabacco', 'Tobacco'], ['#2B2B2B', 'Nero', 'Black']], out: ['XXL'] },
  { id: 's13', s: 'street', c: 'jacket', v: 'varsity', n: ['Giacca varsity in lana', 'Wool varsity jacket'], sh: ['giacca varsity', 'varsity jacket'], p: 189, f: 1, fit: 'relaxed', pal: 'color', se: ['mid', 'cold'], col: [['#6B1F24', 'Bordeaux', 'Burgundy'], ['#2B3550', 'Blu college', 'College blue']], c2: '#EEE7DA', out: ['XS'], nw: 1 },
  { id: 's14', s: 'street', c: 'shirt', v: 'flannel', n: ['Overshirt in flanella a quadri', 'Checked flannel overshirt'], sh: ['overshirt in flanella', 'flannel overshirt'], p: 79, f: 1, fit: 'relaxed', pal: 'color', se: ['mid', 'cold'], col: [['#8C3B32', 'Rosso mattone', 'Brick red']], out: [] },
  { id: 's15', s: 'street', c: 'shirt', v: 'shirt', n: ['Camicia oversize in popeline', 'Oversized poplin shirt'], sh: ['camicia oversize', 'oversized shirt'], p: 69, f: 2, fit: 'relaxed', pal: 'light', se: ['warm', 'mid'], col: [['#F6F6F3', 'Bianco', 'White'], ['#C9D6E3', 'Celeste', 'Light blue']], out: [] },
  { id: 's16', s: 'street', c: 'shirt', v: 'denim', n: ['Camicia in denim', 'Denim shirt'], sh: ['camicia in denim', 'denim shirt'], p: 75, f: 1.5, fit: 'regular', pal: 'dark', se: ['warm', 'mid'], col: [['#3E5576', 'Denim', 'Denim']], out: [] }
];
const P = {};
PRODUCTS.forEach(p => { p.slug = slugify(p.n[0]); P[p.id] = p; });
const sizesFor = p => p.c === 'pants' ? BOT_SIZES : TOP_SIZES;
const avail = (p, s) => !p.out.includes(s);

/* Outfit del mese: scelti dal negozio con sconto e data di fine (qui relative al momento di apertura) */
const NOW = Date.now(), DAY = 864e5, HR = 36e5, MIN = 6e4;
const OM = [
  { id: 'om1', slug: 'citta-d-autunno', n: ['Città d’autunno', 'City autumn'], promo: ['Promo autunno', 'Autumn promo'], off: 20, ends: NOW + 12 * DAY + 8 * HR + 45 * MIN + 30e3, items: ['m12', 'm1', 'm8'] },
  { id: 'om2', slug: 'weekend-oversize', n: ['Weekend oversize', 'Oversized weekend'], promo: ['Promo weekend', 'Weekend promo'], off: 15, ends: NOW + 5 * DAY + 3 * HR + 12 * MIN + 30e3, items: ['s12', 's1', 's7'] },
  { id: 'om3', slug: 'sera-in-nero', n: ['Sera in nero', 'Black evening'], promo: ['Speciale sera', 'Evening special'], off: 25, ends: NOW + 2 * DAY + 6 * HR + 30 * MIN + 30e3, items: ['m11', 'm2', 'm10'] }
];
const OMBY = Object.fromEntries(OM.map(o => [o.id, o]));

/* Le cinque novità scelte a mano: la prima è quella grande */
const NEW_IN = ['s13', 'm2', 'm16', 's8', 's3'];

/* Video social: il negozio incolla il link dal pannello */
const VIDEOS = [
  { url: 'https://www.tiktok.com/@velar/video/7431000000000000001', t: ['Tre modi di portare il trench', 'Three ways to wear a trench'], art: ['m12', 'm4', 'm9'], bg: '#E8E7E3' },
  { url: 'https://www.youtube.com/shorts/velarDemo01', t: ['Il layering di mezza stagione', 'In-between season layering'], art: ['s12', 's5', 's7'], bg: '#DEDCD7' },
  { url: 'https://www.tiktok.com/@velar/video/7431000000000000002', t: ['Oversize senza esagerare', 'Oversized, not overdone'], art: ['s1', 's8'], bg: '#E4E2DC' },
  { url: 'https://www.youtube.com/shorts/velarDemo02', t: ['Dal lavoro alla sera con un blazer', 'Desk to dinner in one blazer'], art: ['m11', 'm2', 'm10'], bg: '#EAE9E6' },
  { url: 'https://www.tiktok.com/@velar/video/7431000000000000003', t: ['Come scegliere la vestibilità', 'How to choose your fit'], art: ['s4', 's9'], bg: '#DFDDD7' }
];
const PLAT = { tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram' };
function parseVideo(url) {
  let m = url.match(/youtube\.com\/shorts\/([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/) || url.match(/[?&]v=([\w-]{6,})/);
  if (m) return { plat: 'youtube', embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&playsinline=1&rel=0` };
  m = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (m) return { plat: 'tiktok', embed: `https://www.tiktok.com/player/v1/${m[1]}?autoplay=1` };
  return null;
}

/* Indirizzi delle pagine (le pagine stesse arriveranno con le prossime sezioni) */
const PAGES = {
  'page.new': ['/it/novita', '/en/new-in'], 'page.terms': ['/it/condizioni-di-vendita', '/en/terms-of-sale'],
  'page.shipping': ['/it/spedizioni', '/en/shipping'], 'page.returns': ['/it/resi-e-rimborsi', '/en/returns'],
  'page.sizes': ['/it/guida-taglie', '/en/size-guide'], 'page.faq': ['/it/faq', '/en/faq'],
  'page.privacy': ['/it/privacy', '/en/privacy'], 'page.cookie': ['/it/cookie', '/en/cookies'],
  'page.minimal': ['/it/minimal-elegante', '/en/minimal-elegant'], 'page.street': ['/it/streetwear-oversize', '/en/streetwear-oversize']
};
const path = (kind, slug) => `/${lang}/${{ product: lang === 'it' ? 'prodotto' : 'product', outfit: 'outfit', quiz: 'outfit-quiz' }[kind]}/${slug}`;

/* =========================================================
   ILLUSTRAZIONI SEGNAPOSTO DELLE FOTO
   Capi disegnati in SVG su fondo grigio chiaro, da sostituire con le foto reali
   (prodotto 4:5, outfit 3:4).
   ========================================================= */
const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const shade = (h, a) => '#' + rgb(h).map(v => Math.round(Math.max(0, Math.min(255, a < 0 ? v * (1 + a) : v + (255 - v) * a))).toString(16).padStart(2, '0')).join('');
const lum = h => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
const detC = h => lum(h) < 0.22 ? shade(h, 0.3) : shade(h, -0.2);
const innC = h => lum(h) < 0.22 ? shade(h, -0.5) : shade(h, -0.28);
const mir = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${+(200 - x).toFixed(1)},${y}`);
let uidN = 0; const uid = () => 'g' + (++uidN);

const SHAPE = {
  TE: 'M70,46 Q100,54 130,46 L160,54 L192,92 L170,112 L156,98 L156,212 L44,212 L44,98 L30,112 L8,92 L40,54 Z',
  LS: 'M70,46 Q100,54 130,46 L160,56 Q180,64 186,96 L194,200 L172,205 L160,116 L158,214 L42,214 L40,116 L28,205 L6,200 L14,96 Q20,64 40,56 Z',
  SH: 'M70,46 Q100,54 130,46 L160,56 Q180,64 186,96 L194,200 L172,205 L160,116 L158,210 Q100,224 42,210 L40,116 L28,205 L6,200 L14,96 Q20,64 40,56 Z',
  JK: 'M72,44 Q100,50 128,44 L162,52 Q184,58 188,92 L196,214 L172,219 L162,120 L160,230 L40,230 L38,120 L28,219 L4,214 L12,92 Q16,58 38,52 Z',
  TR: 'M72,44 Q100,50 128,44 L162,52 Q184,58 188,92 L196,214 L172,219 L162,120 L170,244 L30,244 L38,120 L28,219 L4,214 L12,92 Q16,58 38,52 Z',
  BO: 'M70,46 Q100,54 130,46 L164,56 Q188,64 190,98 L196,196 L172,202 L164,124 L164,204 Q100,212 36,204 L36,124 L28,202 L4,196 L10,98 Q12,64 36,56 Z',
  NECK: 'M70,46 Q100,54 130,46 Q100,72 70,46 Z'
};

function garment(p, hex, fitOv) {
  const c = hex || p.col[0][0];
  const fit = fitOv || p.fit;
  const D = detC(c), I = innC(c);
  const F = (d, col = c) => `<path d="${d}" fill="${col}" stroke="${D}" stroke-width="1.3" stroke-linejoin="round"/>`;
  const S = d => `<path d="${d}" fill="url(#vsheen)"/>`;
  const Ln = (d, w = 1.2, col = D, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const Dot = (x, y, r = 2.6, col = D) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
  const both = d => d + ' ' + mir(d);
  const inner = d => `<path d="${d}" fill="${I}"/>`;
  const cuffs = Ln(both('M171,194 L195,189'));
  const hem = Ln('M42,202 L158,202');
  const shirtBase = (fill = c) =>
    F(SHAPE.SH, fill) + S(SHAPE.SH) + inner('M80,42 Q100,48 120,42 L100,60 Z') +
    F('M80,40 L100,60 L90,82 L70,52 Z', fill) + F(mir('M80,40 L100,60 L90,82 L70,52 Z'), fill) +
    Ln('M100,60 L100,216') + [92, 116, 140, 164, 188].map(y => Dot(103.5, y, 2.1)).join('') + Ln(both('M171,190 L194,186'), 1);
  let g = '';

  if (p.c === 'pants') {
    const leg = {
      slim: 'M60,30 L140,30 L136,236 L106,236 L100,98 L94,236 L64,236 Z',
      regular: 'M59,30 L141,30 L146,236 L107,236 L100,98 L93,236 L54,236 Z',
      relaxed: 'M58,30 L142,30 L160,236 L106,236 L100,102 L94,236 L40,236 Z'
    }[fit] || '';
    const bl = { slim: 79, regular: 74, relaxed: 67 }[fit];
    const fly = Ln('M106,31 L106,72 Q106,80 100,84');
    g = F(leg) + S(leg) + F('M59,18 L141,18 L141,31 L59,31 Z', shade(c, -0.06)) + Ln('M68,18 L68,31 M90,18 L90,31 M110,18 L110,31 M132,18 L132,31', 1.6);
    if (p.v === 'tailored') g += fly + Ln('M66,31 L76,62 M134,31 L124,62') + Ln('M84,31 L85,48 M116,31 L115,48', 1) + Ln(`M80,48 L${bl},230 M120,48 L${200 - bl},230`, 1, D, 'opacity=".5"');
    else if (p.v === 'chino') g += fly + Ln('M66,31 L76,60 M134,31 L124,60') + Ln(`M${bl - 14},226 L${bl + 14},226 M${200 - bl - 14},226 L${200 - bl + 14},226`, 1);
    else if (p.v === 'cargo') {
      const x = { slim: 62, regular: 56, relaxed: 48 }[fit];
      const pk = `M${x},112 L${x + 28},110 L${x + 30},160 L${x + 3},162 Z`;
      g += fly + Ln('M66,31 L74,56 M134,31 L126,56') + F(pk, shade(c, -0.05)) + F(mir(pk), shade(c, -0.05)) + Ln(both(`M${x},121 L${x + 29},119`), 1);
    } else if (p.v === 'jeans') {
      const st = '#C9A15A';
      g += Ln('M106,31 L106,70 Q106,80 99,84', 1.1, st, 'stroke-dasharray="3 2.5"') + Ln(both('M62,31 Q66,52 86,50'), 1.2) +
        Ln('M118,34 L130,34 L130,44', 1, st, 'stroke-dasharray="2 2"') + Ln(both('M64,36 Q70,54 84,50'), 1, st, 'stroke-dasharray="2.5 2.5"');
    } else if (p.v === 'carpenter') {
      g += fly + Ln('M66,31 L74,58 M134,31 L126,58') + F('M126,100 L146,98 L148,140 L128,142 Z', shade(c, -0.05)) + Ln('M52,96 L62,96 L62,128', 1.8);
    }
  } else {
    switch (p.v) {
      case 'tee':
        g = F(SHAPE.TE) + S(SHAPE.TE) + inner(SHAPE.NECK) + Ln('M73,48 Q100,75 127,48') + Ln(both('M10,86 L32,106'), 1) + Ln('M44,204 L156,204', 1); break;
      case 'graphic': {
        const pc = lum(c) < 0.3 ? '#E9E5DC' : '#1E1E1E';
        g = F(SHAPE.TE) + S(SHAPE.TE) + inner(SHAPE.NECK) + Ln('M73,48 Q100,75 127,48') + Ln(both('M10,86 L32,106'), 1) + Ln('M44,204 L156,204', 1) +
          `<rect x="84" y="86" width="32" height="32" fill="none" stroke="${pc}" stroke-width="2.4"/><circle cx="100" cy="102" r="7.5" fill="${pc}"/><rect x="84" y="124" width="32" height="3" fill="${pc}"/>`;
        break;
      }
      case 'polo':
        g = F(SHAPE.TE) + S(SHAPE.TE) + inner('M84,46 Q100,51 116,46 L100,66 Z') + F('M70,45 L98,64 L86,77 L64,54 Z') + F('M130,45 L102,64 L114,77 L136,54 Z') +
          Ln('M96,64 L96,104 L104,104 L104,64') + Dot(100, 78, 2.1) + Dot(100, 94, 2.1) + Ln(both('M10,86 L32,106'), 1) + Ln('M44,204 L156,204', 1); break;
      case 'stripes': {
        const id = uid(); let st = '';
        for (let y = 58; y < 216; y += 13) st += `<rect x="0" y="${y}" width="200" height="5" fill="${p.c2 || '#2D3A6B'}"/>`;
        g = `<clipPath id="${id}"><path d="${SHAPE.LS}"/></clipPath>` + F(SHAPE.LS) + `<g clip-path="url(#${id})">${st}</g>` +
          `<path d="${SHAPE.LS}" fill="url(#vsheen)" stroke="${D}" stroke-width="1.3"/>` + inner(SHAPE.NECK) + Ln('M73,48 Q100,75 127,48') + cuffs; break;
      }
      case 'crew': case 'sweat': case 'chunky':
        g = F(SHAPE.LS) + S(SHAPE.LS) + inner(SHAPE.NECK) + Ln('M73,48 Q100,75 127,48') + Ln('M77,49 Q100,70 123,49', 1, D, 'opacity=".6"') + cuffs + hem;
        if (p.v === 'sweat') g += Ln('M94,64 L100,74 L106,64');
        if (p.v === 'chunky') {
          [72, 100, 128].forEach(x => {
            let d = `M${x},76`;
            for (let y = 76; y < 192; y += 24) d += ` Q${x + 6},${y + 6} ${x},${y + 12} Q${x - 6},${y + 18} ${x},${y + 24}`;
            g += Ln(d, 1.1, D, 'opacity=".55"');
          });
        }
        break;
      case 'turtle':
        g = F(SHAPE.LS) + S(SHAPE.LS) + F('M78,50 L79,22 Q100,17 121,22 L122,50 Q100,56 78,50 Z') + Ln('M79,33 Q100,28 121,33') +
          Ln('M80,41 Q100,37 120,41', 1, D, 'opacity=".5"') + cuffs + hem; break;
      case 'hoodie':
        g = F('M64,58 Q56,12 100,10 Q144,12 136,58 Q100,64 64,58 Z', shade(c, -0.07)) + F(SHAPE.LS) + S(SHAPE.LS) +
          inner('M76,46 Q100,38 124,46 Q116,76 100,80 Q84,76 76,46 Z') + Ln('M74,47 Q100,37 126,47') +
          Ln('M93,76 L91,110 M107,76 L109,110', 1.5) + Dot(91, 111, 1.8) + Dot(109, 111, 1.8) + Ln('M52,198 L62,150 L138,150 L148,198') + cuffs + hem; break;
      case 'cardigan':
        g = F(SHAPE.LS) + S(SHAPE.LS) + inner('M72,46 Q100,54 128,46 L100,114 Z') + Ln('M72,46 L100,114 L128,46') + Ln('M100,114 L100,214') +
          Ln('M104,114 L104,214', 1, D, 'opacity=".5"') + [130, 154, 178, 202].map(y => Dot(108, y)).join('') + cuffs + hem; break;
      case 'shirt':
        g = shirtBase(); break;
      case 'oxford':
        g = shirtBase() + Ln('M60,92 L84,92 L84,116 L72,121 L60,116 Z') + Dot(84, 74, 1.6) + Dot(116, 74, 1.6); break;
      case 'flannel': {
        const id = uid(), dk = shade(c, -0.35);
        g = `<defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${c}"/><rect width="24" height="8" fill="${dk}" opacity=".55"/><rect width="8" height="24" fill="${dk}" opacity=".55"/><rect y="15" width="24" height="1.4" fill="#EFE6DA" opacity=".55"/><rect x="15" width="1.4" height="24" fill="#EFE6DA" opacity=".55"/></pattern></defs>` +
          shirtBase(`url(#${id})`) + Ln(both('M58,90 L86,90 L86,118 L58,118 Z'), 1.2) + Ln(both('M58,97 L86,97'), 1);
        break;
      }
      case 'denim': {
        const pk = 'M58,90 L86,90 L86,97 L72,101 L58,97 Z';
        g = shirtBase() + F(pk, shade(c, -0.08)) + F(mir(pk), shade(c, -0.08)) + Ln(both('M58,97 L58,120 L86,120 L86,97'), 1.2) +
          Ln('M106,62 L106,215', 1, '#C9A15A', 'stroke-dasharray="3 2.5"');
        break;
      }
      case 'blazer': {
        const lp = 'M76,44 L64,62 L80,98 L72,106 L100,142 Z';
        g = F(SHAPE.JK) + S(SHAPE.JK) + inner('M76,44 Q100,50 124,44 L100,142 Z') + F(lp) + F(mir(lp)) + Ln('M100,142 L102,230') +
          Dot(106, 162, 3.4) + Dot(106, 188, 3.4) + Ln('M50,178 L84,176 M116,176 L150,178') + Ln('M118,104 L144,101') + Ln(both('M171,208 L195,203'), 1); break;
      }
      case 'trench': {
        const lp = 'M78,44 L60,64 L74,100 L64,110 L100,136 Z';
        g = F(SHAPE.TR) + S(SHAPE.TR) + inner('M78,44 Q100,50 122,44 L100,136 Z') + F(lp) + F(mir(lp)) + Ln('M112,136 L118,244') +
          F('M38,148 L162,148 L163,160 L37,160 Z', shade(c, -0.08)) + `<rect x="92" y="146" width="16" height="16" fill="none" stroke="${D}" stroke-width="1.6"/>` +
          [[84, 118], [118, 118], [86, 186], [122, 186], [87, 212], [123, 212]].map(([x, y]) => Dot(x, y, 3.1)).join('') +
          Ln(both('M42,56 L70,48'), 2) + Ln(both('M172,196 L195,191'), 2.2) + Ln('M120,58 L146,92 L158,82', 1); break;
      }
      case 'bomber': {
        const cf = 'M172,190 L195,185 L196,196 L172,202 Z';
        g = F(SHAPE.BO) + S(SHAPE.BO) + F('M68,44 Q100,56 132,44 L134,53 Q100,67 66,53 Z', shade(c, -0.12)) + Ln('M100,62 L100,208', 1.6) +
          `<rect x="97" y="64" width="6" height="11" fill="${D}"/>` + F('M36,192 Q100,201 164,192 L164,204 Q100,212 36,204 Z', shade(c, -0.12)) +
          F(cf, shade(c, -0.12)) + F(mir(cf), shade(c, -0.12)) + Ln('M14,118 L30,117 L31,137 L15,138 Z', 1.1) + Ln('M56,140 L64,176 M144,140 L136,176'); break;
      }
      case 'work': {
        const cl = 'M76,40 L100,64 L88,90 L64,54 Z', pk = 'M48,160 L84,160 L84,202 L48,202 Z';
        g = F(SHAPE.JK) + S(SHAPE.JK) + inner('M76,42 Q100,48 124,42 L100,64 Z') + F(cl) + F(mir(cl)) + Ln('M100,64 L100,230') +
          [98, 128, 158, 188, 216].map(y => Dot(104, y, 3)).join('') + Ln('M56,102 L84,102 L84,132 L56,132 Z') + Ln(pk) + Ln(mir(pk)) + Ln(both('M171,208 L195,203'), 1); break;
      }
      case 'varsity': {
        const c2 = p.c2 || '#EEE7DA', cf = 'M172,190 L195,185 L196,196 L172,202 Z';
        g = F(SHAPE.BO, c2) + S(SHAPE.BO) + F('M70,46 Q100,54 130,46 L156,56 L162,124 L164,204 Q100,212 36,204 L38,124 L44,56 Z') +
          F('M68,44 Q100,56 132,44 L134,53 Q100,67 66,53 Z') + Ln('M68,49 Q100,61 132,49', 1.4, c2) +
          F('M36,192 Q100,201 164,192 L164,204 Q100,212 36,204 Z') + Ln('M36,197 Q100,206 164,197', 1.4, c2) +
          F(cf) + F(mir(cf)) + Ln(both('M172,195 L196,190'), 1.2, c2) + [78, 104, 130, 156, 182].map(y => Dot(106, y, 2.6, c2)).join('') +
          Ln('M100,58 L100,206') + Ln('M54,142 L62,178 M146,142 L138,178', 2, c2); break;
      }
      default:
        g = F(SHAPE.TE);
    }
  }
  const sx = p.c === 'pants' ? 0.86 : 0.86 * ({ slim: 0.9, regular: 1, relaxed: 1.14 }[fit] || 1);
  return `<g transform="translate(100 125) scale(${sx.toFixed(3)} 0.86) translate(-100 -125)"><g filter="url(#vsh)">${g}</g></g>`;
}

function productAlt(p, ci = 0) { return `${L(p.n)}, ${LC(p.col[ci]).toLowerCase()}`; }
function productArt(p, ci = 0, o = {}) {
  const a = o.decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(productAlt(p, ci))}"`;
  return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid meet" ${a} focusable="false">${garment(p, o.hex || p.col[ci][0], o.fit)}</svg>`;
}
function outfitAlt(list) { return t('alt.outfit', { items: joinList(list.map(p => L(p.sh))) }); }
function outfitArt(list, o = {}) {
  const items = list.filter(Boolean).map(x => (x.id ? { p: x } : x));   // accetta prodotti o {p, hex, fit}
  const J = items.find(x => x.p.c === 'jacket');
  const T = items.find(x => ['knit', 'tee', 'shirt'].includes(x.p.c));
  const B = items.find(x => x.p.c === 'pants');
  const pl = (x, tx, ty, k) => x ? `<g transform="translate(${tx} ${ty}) scale(${k})">${garment(x.p, o.mono || x.hex, x.fit)}</g>` : '';
  const body = J ? pl(B, 74, 166, 0.9) + pl(J, 4, 10, 0.92) + pl(T, 112, 36, 0.84)
                 : pl(B, 52, 150, 0.98) + pl(T, 50, 6, 1);
  const a = o.decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(o.alt || outfitAlt(items.map(x => x.p)))}"`;
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" ${a} focusable="false">${body}</svg>`;
}

/* =========================================================
   ICONE
   ========================================================= */
const ICON = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V20h14v-7.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3"/></svg>',
  play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.5 1.8v12.4L14 8z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/></svg>'
};

/* =========================================================
   STATO: carrello, preferiti, consenso
   ========================================================= */
let cart = store.get('cart', []).filter(l => l && l.qty > 0 && (l.type === 'p' ? P[l.id] : OMBY[l.id]));
let favs = new Set(store.get('favs', []).filter(validFav));
let consent = store.get('consent', null);
function validFav(k) {
  if (typeof k !== 'string') return false;
  const [type, id] = [k.slice(0, 1), k.slice(2)];
  if (type === 'p') return !!P[id];
  if (type === 'o') return !!OMBY[id];
  if (type === 'q') return id.split('+').every(x => P[x]);
  return false;
}

/* ---------- Toast ---------- */
let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('is-on'), 3800);
}

/* =========================================================
   LIVELLI (pannelli, foglio, modali, quiz) con focus intrappolato
   ========================================================= */
const Layers = (() => {
  const stack = [];
  const scrim = $('#scrim');
  const FOC = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,iframe,[tabindex]:not([tabindex="-1"])';
  const focusables = el => $$(FOC, el).filter(x => x.getClientRects().length);
  function restack() {
    let scrimZ = null;
    stack.forEach((l, i) => { l.el.style.zIndex = String(100 + i * 2); if (l.scrim) scrimZ = 99 + i * 2; });
    if (scrimZ !== null) { scrim.style.zIndex = String(scrimZ); scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-on')); }
    else { scrim.classList.remove('is-on'); setTimeout(() => { if (!stack.some(l => l.scrim)) scrim.hidden = true; }, 360); }
    document.documentElement.style.overflow = stack.length ? 'hidden' : '';
  }
  function open(el, o = {}) {
    if (stack.some(l => l.el === el)) return;
    stack.push({ el, prev: document.activeElement, scrim: o.scrim !== false });
    el.hidden = false;
    restack();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
    setTimeout(() => { const f = (o.focus && $(o.focus, el)) || focusables(el)[0] || el; f.focus({ preventScroll: true }); }, 80);
  }
  function close(el) {
    const i = stack.findIndex(l => l.el === el);
    if (i < 0) return;
    const [layer] = stack.splice(i, 1);
    el.classList.remove('is-open');
    el.dispatchEvent(new CustomEvent('layer:close'));
    setTimeout(() => { if (!stack.some(l => l.el === el)) { el.hidden = true; el.style.zIndex = ''; } }, reduceMotion.matches ? 0 : 440);
    restack();
    if (layer.prev && document.contains(layer.prev) && layer.prev.getClientRects().length) layer.prev.focus({ preventScroll: true });
  }
  const top = () => stack[stack.length - 1]?.el || null;
  const isOpen = el => stack.some(l => l.el === el);
  function trap(e) {
    const el = top(); if (!el) return;
    const f = focusables(el); if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  scrim.addEventListener('click', () => { const l = [...stack].reverse().find(x => x.scrim); if (l) close(l.el); });
  return { open, close, top, isOpen, trap };
})();

/* =========================================================
   COMPONENTI RIUTILIZZATI
   ========================================================= */
function favBtn(key, name) {
  const on = favs.has(key);
  return `<button class="fav" type="button" data-act="fav" data-key="${esc(key)}" data-name="${esc(name)}" aria-pressed="${on}" aria-label="${esc(t(on ? 'fav.remove' : 'fav.add', { name }))}">${ICON.heart}</button>`;
}
function shareBtn(kind, id, name, cls = 'ibtn') {
  return `<button class="${cls}" type="button" data-act="share" data-kind="${kind}" data-id="${esc(id)}" aria-label="${esc(t('share', { name }))}">${ICON.share}</button>`;
}
function omPrice(om) {
  const full = om.items.reduce((s, id) => s + P[id].p, 0);
  const active = om.ends - Date.now() > 0;
  const now = active ? Math.round(full * (1 - om.off / 100)) : full;
  return { full, now, save: full - now, active };
}
function priceHTML(pr) {
  if (!pr.active) return `<p class="price"><span class="price__now">${fmt(pr.full)}</span></p>`;
  return `<p class="price"><span class="price__now is-sale">${fmt(pr.now)}</span><s class="price__was"><span class="sr">${t('price.was')} </span>${fmt(pr.full)}</s><span class="price__save">${t('save', { x: fmt(pr.save) })}</span></p>`;
}
function cdParts(ms) { const tm = Math.floor(ms / MIN); return { d: Math.floor(tm / 1440), h: Math.floor((tm % 1440) / 60), m: tm % 60 }; }
function cdText(ms) { const { d, h, m } = cdParts(ms); return `${d} ${t('u.d')} ${pad(h)} ${t('u.h')} ${pad(m)} ${t('u.m')}`; }
function cdAria(ms) { return t('cd.aria', cdParts(ms)); }

/* =========================================================
   SEZIONI DELLA HOME
   ========================================================= */
function renderOM() {
  $('#omList').innerHTML = OM.map((om, i) => {
    const pr = omPrice(om), items = om.items.map(id => P[id]), name = L(om.n), url = path('outfit', om.slug);
    const ms = om.ends - Date.now();
    return `<article class="ocard" data-ri style="--i:${i + 1}">
      <div class="ocard__promo">
        <span class="label">${esc(L(om.promo))}</span>
        ${pr.active ? `<span class="label cd" data-cd="${om.id}" aria-label="${esc(cdAria(ms))}">${cdText(ms)}</span>` : `<span class="label cd cd--off">${t('om.expired')}</span>`}
      </div>
      <div class="ocard__media">
        <a href="${url}" data-page="page.outfit" tabindex="-1" aria-hidden="true"><div class="ph ph--34">${outfitArt(items, { decorative: true })}</div></a>
        ${pr.active ? `<span class="tag" aria-hidden="true">−${om.off}%</span>` : ''}
        ${favBtn('o:' + om.id, name)}
      </div>
      <div class="ocard__body">
        <h3 class="ocard__name"><a href="${url}" data-page="page.outfit">${esc(name)}</a></h3>
        <p class="ocard__items">${esc(capFirst(items.map(p => L(p.sh)).join(', ')))}</p>
        ${priceHTML(pr)}
        <div class="ocard__actions">
          <button class="btn btn--solid" type="button" data-act="om-add" data-id="${om.id}">${t('add')}</button>
          ${shareBtn('outfit', om.id, name)}
        </div>
      </div>
    </article>`;
  }).join('');
}

function renderStyles() {
  const data = [
    { key: 'minimal', page: 'page.minimal', items: ['m11', 'm14', 'm10'] },
    { key: 'street', page: 'page.street', items: ['s11', 's5', 's8'] }
  ];
  $('#styleList').innerHTML = data.map((s, i) => `<article class="style" data-ri style="--i:${i}">
      <a class="style__link" href="${PAGES[s.page][lang === 'it' ? 0 : 1]}" data-page="${s.page}">
        <div class="ph style__ph">${outfitArt(s.items.map(id => P[id]), { decorative: true })}</div>
        <div class="style__meta"><h3 class="style__name">${t('style.' + s.key)}</h3><span class="label style__cta">${t('styles.cta')}</span></div>
      </a>
    </article>`).join('');
}

function sizeButtonsHover(p) {
  return sizesFor(p).map(s => avail(p, s)
    ? `<button type="button" data-act="size-add" data-id="${p.id}" data-size="${s}">${s}</button>`
    : `<button type="button" disabled aria-label="${s}, ${t('soldout')}">${s}</button>`).join('');
}
function renderNew() {
  $('#nwList').innerHTML = NEW_IN.map((id, i) => {
    const p = P[id], name = L(p.n), url = path('product', p.slug);
    return `<article class="pcard${i === 0 ? ' pcard--lead' : ''}" data-ri style="--i:${i + 1}">
      <div class="pcard__media">
        <a href="${url}" data-page="page.product" tabindex="-1" aria-hidden="true"><div class="ph ph--45">${productArt(p, 0, { decorative: true })}</div></a>
        <span class="tag">${t('new.badge')}</span>
        ${favBtn('p:' + p.id, name)}
        <div class="sizes-hover" role="group" aria-label="${esc(t('new.sizesAria', { name }))}">
          <span class="label">${t('new.add')}</span>${sizeButtonsHover(p)}
        </div>
        <button class="plus" type="button" data-act="sheet" data-id="${p.id}" aria-label="${esc(t('plus', { name }))}">${ICON.plus}</button>
      </div>
      <div class="pcard__body">
        <h3 class="pcard__name"><a href="${url}" data-page="page.product">${esc(name)}</a></h3>
        ${shareBtn('product', p.id, name)}
        <p class="pcard__price">${fmt(p.p)}</p>
        <ul class="swatches" aria-label="${esc(p.col.length > 1 ? t('colors', { n: p.col.length }) : t('color1'))}">
          ${p.col.map(c => `<li style="background:${c[0]}" title="${esc(LC(c))}"><span class="sr">${esc(LC(c))}</span></li>`).join('')}
        </ul>
      </div>
    </article>`;
  }).join('');
}

let VIDS = [];
function renderSocial() {
  VIDS = VIDEOS.map(v => ({ ...v, ...parseVideo(v.url) })).filter(v => v.plat).slice(0, 5);
  const sec = $('#social');
  if (VIDS.length < 4) { sec.hidden = true; return; }   // con meno di 4 video la sezione non compare
  sec.hidden = false;
  const list = $('#soList');
  list.style.setProperty('--n', VIDS.length);
  list.innerHTML = VIDS.map((v, i) => `<div class="vid" data-ri style="--i:${i + 1}">
      <button class="vid__btn" type="button" data-act="video" data-i="${i}" aria-label="${esc(t('social.play', { p: PLAT[v.plat], title: L(v.t) }))}">
        <span class="ph vid__ph" style="display:block;background:${v.bg}">${outfitArt(v.art.map(id => P[id]), { decorative: true })}
          <span class="tag tag--light vid__plat" aria-hidden="true">${PLAT[v.plat]}</span>
          <span class="vid__play" aria-hidden="true">${ICON.play}</span>
        </span>
        <span class="vid__title" aria-hidden="true">${esc(L(v.t))}</span>
      </button>
    </div>`).join('');
  $('#soFollow').innerHTML = ['tiktok', 'youtube', 'instagram'].map(k =>
    `<a class="btn btn--ghost" href="${CONFIG.profiles[k]}" target="_blank" rel="noopener">${t('social.follow', { p: PLAT[k] })}</a>`).join('');
}

/* ---------- Quiz: domande e immagini delle risposte ---------- */
const Q = [
  { k: 'style', q: 'q.style', o: ['minimal', 'street', 'both'] },
  { k: 'occ', q: 'q.occ', o: ['work', 'everyday', 'evening', 'weekend'] },
  { k: 'season', q: 'q.season', o: ['warm', 'mid', 'cold'] },
  { k: 'fit', q: 'q.fit', o: ['slim', 'regular', 'relaxed'] },
  { k: 'pal', q: 'q.pal', o: ['neutral', 'dark', 'light', 'color'] },
  { k: 'sizes', q: 'q.sizes' }
];
const ART_SETS = {
  style: { minimal: ['m11', 'm14', 'm10'], street: ['s11', 's4', 's7'], both: ['m12', 's1', 's8'] },
  occ: {
    minimal: { work: ['m11', 'm14', 'm8'], everyday: ['m4', 'm9'], evening: ['m2', 'm10'], weekend: ['m15', 'm9'] },
    street: { work: ['s12', 's15', 's10'], everyday: ['s4', 's7'], evening: ['s11', 's5', 's10'], weekend: ['s1', 's8'] }
  },
  season: {
    minimal: { warm: ['m4', 'm9'], mid: ['m12', 'm4', 'm8'], cold: ['m11', 'm1', 'm10'] },
    street: { warm: ['s4', 's9'], mid: ['s12', 's5', 's7'], cold: ['s11', 's1', 's8'] }
  },
  pal: { neutral: ['#CFC6B6', '#8C8678'], dark: ['#1E1E1E', '#2F3D55'], light: ['#FAFAF8', '#E3D9C6'], color: ['#B5653E', '#D9D1C3'] }
};
function optArt(k, v, a) {
  const st = a.style === 'street' ? 'street' : 'minimal';
  if (k === 'style') return outfitArt(ART_SETS.style[v].map(id => P[id]), { decorative: true });
  if (k === 'occ' || k === 'season') return outfitArt(ART_SETS[k][st][v].map(id => P[id]), { decorative: true });
  const top = P[st === 'street' ? 's4' : 'm4'], bot = P[st === 'street' ? 's9' : 'm9'];
  if (k === 'fit') return outfitArt([{ p: top, fit: v, hex: top.col[0][0] }, { p: bot, fit: v }], { decorative: true });
  if (k === 'pal') { const [a1, a2] = ART_SETS.pal[v]; return outfitArt([{ p: top, hex: a1 }, { p: bot, hex: a2, fit: 'regular' }], { decorative: true }); }
  return '';
}
function optBtn(act, k, v, sel, a) {
  return `<button class="opt" type="button" data-act="${act}" data-k="${k}" data-v="${v}" aria-pressed="${sel}">
      <span class="ph opt__ph" style="display:block">${optArt(k, v, a)}</span>
      <span class="opt__label"><span class="opt__box">${ICON.check}</span>${t('o.' + v)}</span>
    </button>`;
}
function renderInvite() {
  $('#qsOpts').innerHTML = Q[0].o.map(v => optBtn('invite-opt', 'style', v, quiz.a.style === v, {})).join('');
}

/* ---------- Footer ---------- */
function renderFooter() {
  const c = CONFIG.contacts;
  $('#ftrContacts').innerHTML = `
    <li><span class="ftr__dim">${t('ftr.orders')}</span><br><a href="mailto:${c.shop}">${c.shop}</a></li>
    <li><span class="ftr__dim">${t('ftr.returns')}</span><br><a href="mailto:${c.returns}">${c.returns}</a></li>
    <li><span class="ftr__dim">${t('ftr.phone')}</span><br>${c.phone ? `<a href="tel:${c.phone.replace(/\s/g, '')}">${esc(c.phone)}</a>` : t('ftr.phoneTbd')}</li>`;
  // Icone social: inserire i loghi ufficiali dai kit grafici delle piattaforme
  $('#ftrSocial').innerHTML = ['instagram', 'tiktok', 'youtube'].map(k =>
    `<a href="${CONFIG.profiles[k]}" target="_blank" rel="noopener">${PLAT[k]}</a>`).join('');
  $('#payList').innerHTML = ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'].map(x => `<li>${x}</li>`).join('');
}

/* =========================================================
   PREFERITI
   ========================================================= */
function toggleFav(key, name) {
  const on = !favs.has(key);
  on ? favs.add(key) : favs.delete(key);
  store.set('favs', [...favs]);
  // In produzione: se l'utente ha effettuato l'accesso, sincronizzare con il suo account.
  $$('[data-act="fav"]').filter(b => b.dataset.key === key).forEach(b => {
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', t(on ? 'fav.remove' : 'fav.add', { name: b.dataset.name || name || '' }));
  });
  updateCounts();
  if (Layers.isOpen($('#favDrawer'))) renderFavs();
  toast(t(on ? 'fav.added' : 'fav.removed'));
}
function renderFavs() {
  const body = $('#favBody');
  if (!favs.size) {
    body.innerHTML = `<div class="empty"><p>${t('favs.empty')}</p></div><p class="drawer__note">${t('favs.note')}</p>`;
    return;
  }
  const rows = [...favs].reverse().map(k => {
    const type = k[0], id = k.slice(2);
    if (type === 'p') {
      const p = P[id], name = L(p.n);
      return `<li class="line">
        <div class="ph line__ph">${productArt(p, 0, { decorative: true })}</div>
        <div>
          <div class="line__top"><a class="line__name" href="${path('product', p.slug)}" data-page="page.product">${esc(name)}</a><span class="line__price">${fmt(p.p)}</span></div>
          <p class="line__meta">${esc(LC(p.col[0]))}</p>
          <div class="line__bottom"><button class="textbtn" type="button" data-act="fav" data-key="${k}" data-name="${esc(name)}">${t('favs.remove')}</button></div>
        </div></li>`;
    }
    if (type === 'o') {
      const om = OMBY[id], pr = omPrice(om), name = L(om.n);
      return `<li class="line">
        <div class="ph line__ph ph--34">${outfitArt(om.items.map(x => P[x]), { decorative: true })}</div>
        <div>
          <div class="line__top"><a class="line__name" href="${path('outfit', om.slug)}" data-page="page.outfit">${esc(name)}</a>
            <span class="line__price"><span class="price__now${pr.active ? ' is-sale' : ''}">${fmt(pr.now)}</span></span></div>
          <p class="line__meta">${esc(capFirst(om.items.map(x => L(P[x].sh)).join(', ')))}</p>
          <div class="line__bottom"><button class="btn btn--solid" type="button" data-act="fav-om-add" data-id="${om.id}" style="min-height:38px;padding:0 14px">${t('add')}</button>
            <button class="textbtn" type="button" data-act="fav" data-key="${k}" data-name="${esc(name)}">${t('favs.remove')}</button></div>
        </div></li>`;
    }
    const ids = id.split('+'), items = ids.map(x => P[x]);
    return `<li class="line">
      <div class="ph line__ph ph--34">${outfitArt(items, { decorative: true })}</div>
      <div>
        <div class="line__top"><span class="line__name">${t('favs.quiz')}</span><span class="line__price">${fmt(items.reduce((s, p) => s + p.p, 0))}</span></div>
        <p class="line__meta">${esc(capFirst(items.map(p => L(p.sh)).join(', ')))}</p>
        <div class="line__bottom"><button class="textbtn" type="button" data-act="fav" data-key="${k}" data-name="${esc(t('favs.quiz'))}">${t('favs.remove')}</button></div>
      </div></li>`;
  }).join('');
  body.innerHTML = `<ul>${rows}</ul><p class="drawer__note" style="margin-top:16px">${t('favs.note')}</p>`;
}

/* =========================================================
   CARRELLO
   ========================================================= */
function saveCart() { store.set('cart', cart); updateCounts(); }
function addProduct(id, size, qty = 1) {
  const key = `p:${id}:${size}`, ex = cart.find(l => l.key === key);
  ex ? (ex.qty += qty) : cart.push({ key, type: 'p', id, size, qty });
  saveCart();
}
function addBundle(omId, sizes) {
  const om = OMBY[omId], key = `o:${omId}:${om.items.map(id => sizes[id]).join('-')}`, ex = cart.find(l => l.key === key);
  ex ? (ex.qty += 1) : cart.push({ key, type: 'o', id: omId, sizes: { ...sizes }, qty: 1 });
  saveCart();
}
function lineUnit(l) {
  if (l.type === 'p') return { now: P[l.id].p, was: null };
  const pr = omPrice(OMBY[l.id]);
  return { now: pr.now, was: pr.active ? pr.full : null };
}
const cartQty = () => cart.reduce((s, l) => s + l.qty, 0);
function updateCounts() {
  const q = cartQty();
  $('#cartCount').textContent = q ? String(q) : '';
  $('#favCount').textContent = favs.size ? String(favs.size) : '';
  $('#cartTitleCount').textContent = q ? `(${q})` : '';
}
function openCart() { renderCart(); Layers.open($('#cartDrawer')); }
function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot');
  updateCounts();
  if (!cart.length) {
    body.innerHTML = `<div class="empty"><p>${t('cart.empty')}</p><button class="btn btn--solid" type="button" data-act="cart-quiz">${t('hero.cta')}</button></div>`;
    foot.hidden = true;
    return;
  }
  foot.hidden = false;
  let sub = 0;
  body.innerHTML = `<ul>${cart.map(l => {
    const u = lineUnit(l); sub += u.now * l.qty;
    const qty = `<div class="qty" role="group" aria-label="${t('cart.qty')}">
        <button type="button" data-act="qty" data-key="${esc(l.key)}" data-d="-1" aria-label="${t('cart.dec')}">${ICON.minus}</button>
        <output aria-live="polite">${l.qty}</output>
        <button type="button" data-act="qty" data-key="${esc(l.key)}" data-d="1" aria-label="${t('cart.inc')}">${ICON.plus}</button></div>`;
    const price = `<div class="line__price"><span class="price__now${u.was ? ' is-sale' : ''}">${fmt(u.now * l.qty)}</span>${u.was ? `<br><s class="price__was">${fmt(u.was * l.qty)}</s>` : ''}</div>`;
    if (l.type === 'p') {
      const p = P[l.id];
      return `<li class="line">
        <div class="ph line__ph">${productArt(p, 0, { decorative: true })}</div>
        <div>
          <div class="line__top"><p class="line__name">${esc(L(p.n))}</p>${price}</div>
          <p class="line__meta">${esc(t('cart.meta', { color: LC(p.col[0]), size: l.size }))}</p>
          <div class="line__bottom">${qty}<button class="textbtn" type="button" data-act="remove" data-key="${esc(l.key)}">${t('cart.remove')}</button></div>
        </div></li>`;
    }
    const om = OMBY[l.id];
    return `<li class="line">
      <div class="ph line__ph ph--34">${outfitArt(om.items.map(x => P[x]), { decorative: true })}</div>
      <div>
        <div class="line__top"><div><p class="line__meta" style="margin:0 0 2px">${t('cart.outfit')}</p><p class="line__name">${esc(L(om.n))}</p></div>${price}</div>
        <ul class="line__sub" style="margin-top:6px">${om.items.map(id => `<li>${esc(t('cart.itemSize', { name: capFirst(L(P[id].sh)), size: l.sizes[id] }))}</li>`).join('')}</ul>
        <div class="line__bottom">${qty}<button class="textbtn" type="button" data-act="remove" data-key="${esc(l.key)}">${t('cart.remove')}</button></div>
      </div></li>`;
  }).join('')}</ul>`;
  foot.innerHTML = `<div class="row"><span>${t('cart.subtotal')}</span><strong>${fmt(sub)}</strong></div>
    <p class="drawer__note">${t('cart.ship')}</p>
    <button class="btn btn--solid btn--block" type="button" data-act="checkout">${t('cart.checkout')}</button>`;
}
function checkout() {
  /* In produzione:
     fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lang, cart }) })
       .then(r => r.json()).then(({ url }) => { location.href = url; });
     Il server ricalcola prezzi e scadenze delle promo, crea la sessione Stripe Checkout
     (carte, Apple Pay, Google Pay) e restituisce l'indirizzo della pagina di pagamento. */
  toast(t('cart.demo'));
}

/* ---------- Scelta taglie per l'outfit del mese ---------- */
let sizeSel = null;
function openSizeDrawer(omId) { sizeSel = { omId, sizes: {} }; renderSizeDrawer(); Layers.open($('#sizeDrawer')); }
function renderSizeDrawer() {
  const om = OMBY[sizeSel.omId], pr = omPrice(om);
  $('#sizeDrawerBody').innerHTML = `<p class="h3" style="margin:16px 0 4px">${esc(L(om.n))}</p>
    <p class="muted" style="font-size:14px;margin-bottom:8px">${t('sizes.hint')}</p>
    ${om.items.map(id => {
      const p = P[id], name = L(p.n);
      return `<div class="sizepick">
        <div class="ph line__ph">${productArt(p, 0, { decorative: true })}</div>
        <div><p class="line__name">${esc(name)}</p><p class="line__meta">${esc(LC(p.col[0]))}</p>
          <div class="chips" role="group" aria-label="${esc(t('sizes.for', { name }))}">
            ${sizesFor(p).map(s => `<button class="chip" type="button" data-act="pick-size" data-id="${id}" data-size="${s}" aria-pressed="${sizeSel.sizes[id] === s}" ${avail(p, s) ? '' : `disabled aria-label="${s}, ${t('soldout')}"`}>${s}</button>`).join('')}
          </div></div></div>`;
    }).join('')}`;
  renderSizeFoot(pr);
}
function renderSizeFoot(pr = omPrice(OMBY[sizeSel.omId])) {
  const om = OMBY[sizeSel.omId], ready = om.items.every(id => sizeSel.sizes[id]);
  $('#sizeDrawerFoot').innerHTML = `<div class="row"><span>${esc(L(om.n))}</span>
      <span><strong class="${pr.active ? 'price__now is-sale' : 'price__now'}">${fmt(pr.now)}</strong>${pr.active ? ` <s class="price__was">${fmt(pr.full)}</s>` : ''}</span></div>
    <button class="btn btn--solid btn--block" type="button" data-act="size-confirm" ${ready ? '' : 'disabled'}>${t('sizes.confirm')}</button>`;
}

/* ---------- Scelta taglia dal basso (mobile) ---------- */
function openSheet(id) {
  const p = P[id];
  $('#sheetBody').innerHTML = `<div class="sizepick" style="border:0;padding-top:4px;padding-bottom:0">
      <div class="ph line__ph">${productArt(p, 0, { decorative: true })}</div>
      <div><p class="line__name">${esc(L(p.n))}</p><p class="line__meta">${fmt(p.p)}</p></div></div>
    <div class="chips" role="group" aria-label="${esc(t('sizes.for', { name: L(p.n) }))}">
      ${sizesFor(p).map(s => `<button class="chip" type="button" data-act="sheet-size" data-id="${id}" data-size="${s}" ${avail(p, s) ? '' : `disabled aria-label="${s}, ${t('soldout')}"`}>${s}</button>`).join('')}
    </div>`;
  Layers.open($('#sizeSheet'));
}

/* =========================================================
   CONDIVIDI
   ========================================================= */
function shareTarget(kind, id) {
  if (kind === 'product') { const p = P[id]; return { title: L(p.n), url: CONFIG.baseUrl + path('product', p.slug) }; }
  if (kind === 'outfit') { const o = OMBY[id]; return { title: L(o.n), url: CONFIG.baseUrl + path('outfit', o.slug) }; }
  return { title: t('favs.quiz'), url: `${CONFIG.baseUrl}/${lang}/outfit-quiz?capi=${encodeURIComponent(id)}` };
}
let shareMenu = null;
function closeShareMenu(restore = true) {
  if (!shareMenu) return;
  const { el, btn } = shareMenu; shareMenu = null;
  el.remove();
  if (restore && btn && document.contains(btn)) btn.focus({ preventScroll: true });
}
async function doShare(btn) {
  const { title, url } = shareTarget(btn.dataset.kind, btn.dataset.id);
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {   // mobile: foglio di condivisione del telefono
    try { await navigator.share({ title: `${title} | VELAR`, url }); } catch (e) { /* annullato */ }
    return;
  }
  if (shareMenu && shareMenu.btn === btn) { closeShareMenu(); return; }
  closeShareMenu(false);
  const e = encodeURIComponent;
  const el = document.createElement('div');
  el.className = 'share-menu';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', t('sh.menu'));
  el.innerHTML = `<button type="button" data-act="copy" data-url="${esc(url)}">${ICON.link}${t('sh.copy')}</button>
    <a href="https://wa.me/?text=${e(title + ' ' + url)}" target="_blank" rel="noopener">${ICON.ext}WhatsApp</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${e(url)}" target="_blank" rel="noopener">${ICON.ext}Facebook</a>
    <a href="https://pinterest.com/pin/create/button/?url=${e(url)}&description=${e(title)}" target="_blank" rel="noopener">${ICON.ext}Pinterest</a>`;
  (Layers.top() || document.body).appendChild(el);
  const r = btn.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  const left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
  const top = r.bottom + 6 + h > innerHeight - 8 ? r.top - h - 6 : r.bottom + 6;
  el.style.left = left + 'px'; el.style.top = Math.max(8, top) + 'px';
  shareMenu = { el, btn };
  el.querySelector('button,a').focus({ preventScroll: true });
}
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = s; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    ta.remove(); return ok;
  }
}

/* =========================================================
   VIDEO SOCIAL
   ========================================================= */
function openExternal(url) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}
function playVideo(i) {
  const v = VIDS[i]; if (!v) return;
  if (!consent || !consent.media) {   // senza consenso: video sulla piattaforma, in una nuova scheda
    openExternal(v.url);
    toast(t('social.opened', { p: PLAT[v.plat] }));
    return;
  }
  $('#playerTitle').textContent = L(v.t);
  $('#playerFrame').innerHTML = `<iframe src="${v.embed}" title="${esc(L(v.t))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  $('#playerAlt').innerHTML = `${t('player.alt')} <a href="${esc(v.url)}" target="_blank" rel="noopener">${PLAT[v.plat]}</a>`;
  Layers.open($('#player'), { scrim: false, focus: '.player__close' });
}
$('#player').addEventListener('layer:close', () => { $('#playerFrame').innerHTML = ''; });

/* =========================================================
   QUIZ
   ========================================================= */
const OCC_F = { work: 3, everyday: 1.5, evening: 2.5, weekend: 1 };
/* Libreria di outfit composti in anticipo ed etichettati (occasione, stagione, vestibilità, palette).
   Qui è generata dal catalogo dimostrativo; in produzione la compone il negozio dal pannello. */
const LIB = (() => {
  const fits = ['regular', 'slim', 'relaxed'], pals = ['neutral', 'dark', 'light', 'color'], lib = [];
  let k = 0;
  const pick = (style, cat, tg) => PRODUCTS.filter(p => p.s === style && p.c === cat)
    .map(p => ({ p, s: -Math.abs(p.f - tg.f) * 1.6 + (p.fit === tg.fit ? 2 : 0) + (p.pal === tg.pal ? 2.2 : 0) + (p.pal === 'neutral' ? 0.4 : 0) + (p.se.includes(tg.season) ? 1.5 : -2) }))
    .sort((a, b) => b.s - a.s)[0].p.id;
  for (const style of ['minimal', 'street'])
    for (const season of ['warm', 'mid', 'cold'])
      for (const occ of Object.keys(OCC_F))
        for (const v of [0, 1]) {
          const fit = fits[(k + v) % 3], pal = pals[(k + 2 * v) % 4]; k++;
          const f = OCC_F[occ];
          const topCat = (f >= 2.5) !== (v === 1) ? 'shirt' : 'tee';
          // caldo: maglietta o camicia + pantalone · mezza stagione: + giacca · freddo: maglione + pantalone + giacca
          const slots = season === 'warm' ? [topCat, 'pants'] : season === 'mid' ? ['jacket', topCat, 'pants'] : ['jacket', 'knit', 'pants'];
          const items = slots.map((cat, si) => pick(style, cat, { f, fit, season, pal: pal === 'color' ? (si === 0 ? 'color' : 'neutral') : pal }));
          lib.push({ id: `${style}-${season}-${occ}-${v}`, style, season, occ, fit, pal, items });
        }
  return lib;
})();

const quiz = { step: 0, a: {}, result: null };
function scoreOutfit(o, a) {
  let s = o.occ === a.occ ? 6 : Math.max(0, 3 - Math.abs(OCC_F[o.occ] - OCC_F[a.occ]) * 2);
  s += o.fit === a.fit ? 3 : 0;
  s += o.pal === a.pal ? 3 : (o.pal === 'neutral' ? 1 : 0);
  return s;
}
function bestAlt(p, size, exclude, a = {}) {
  return PRODUCTS.filter(q => q.c === p.c && q.id !== p.id && q.s === p.s && avail(q, size) && !exclude.includes(q.id))
    .map(q => ({ q, s: -Math.abs(q.f - p.f) * 2 + (q.fit === p.fit ? 2 : 0) + (q.pal === p.pal ? 2 : 0) + (q.se.some(x => p.se.includes(x)) ? 1 : 0)
      + (q.pal === a.pal ? 2 : 0) - (a.pal && a.pal !== 'color' && q.pal === 'color' ? 2 : 0) }))
    .sort((x, y) => y.s - x.s)[0]?.q || null;
}
function resolveItems(o, a) {
  const used = [...o.items];
  return o.items.map(id => {
    const p = P[id], size = p.c === 'pants' ? a.bottom : a.top;
    if (avail(p, size)) return { id, size, swapped: false };
    const alt = bestAlt(p, size, used, a);   // capo non disponibile nella taglia: alternativa equivalente
    if (alt) { used.push(alt.id); return { id: alt.id, size, swapped: true }; }
    return { id, size: sizesFor(p).find(s => avail(p, s)), swapped: false };
  });
}
function computeResult() {
  const a = quiz.a;
  const pool = LIB.filter(o => (a.style === 'both' || o.style === a.style) && o.season === a.season)
    .map(o => ({ o, s: scoreOutfit(o, a) })).sort((x, y) => y.s - x.s);
  const seen = new Set(), list = [];
  for (const { o } of pool) {
    const items = resolveItems(o, a), sig = items.map(x => x.id).sort().join();
    if (seen.has(sig)) continue;
    seen.add(sig); list.push({ o, items });
    if (list.length === 3) break;
  }
  quiz.result = { list, idx: 0, change: null };
}
function openQuiz(step = 0) {
  quiz.step = step; quiz.result = null;
  renderQuiz(false);
  Layers.open($('#quiz'), { scrim: false, focus: '#quizQ' });
}
function answered(step) {
  const q = Q[step];
  return q.k === 'sizes' ? !!(quiz.a.top && quiz.a.bottom) : !!quiz.a[q.k];
}
function renderQuiz(anim = true) {
  const stage = $('#quizStage'), nav = $('#quizNav'), bar = $('#quizBar');
  if (quiz.result) {
    nav.hidden = true;
    $('#quizStep').textContent = t('quiz.result');
    $('#quizBarFill').style.width = '100%';
    bar.setAttribute('aria-valuenow', '6');
    renderResult();
  } else {
    nav.hidden = false;
    const q = Q[quiz.step];
    $('#quizStep').textContent = t('quiz.step', { n: quiz.step + 1 });
    $('#quizBarFill').style.width = ((quiz.step + 1) / 6 * 100) + '%';
    bar.setAttribute('aria-valuenow', String(quiz.step + 1));
    if (q.k === 'sizes') {
      const chips = (k, list) => list.map(s => `<button class="chip" type="button" data-act="quiz-size-chip" data-k="${k}" data-v="${s}" aria-pressed="${quiz.a[k] === s}">${s}</button>`).join('');
      stage.innerHTML = `<h2 class="quiz__q" id="quizQ" tabindex="-1">${t(q.q)}</h2>
        <div class="sizes-q">
          <div role="group" aria-labelledby="qTop"><h3 class="label" id="qTop">${t('q.top')}</h3><div class="chips">${chips('top', TOP_SIZES)}</div></div>
          <div role="group" aria-labelledby="qBot"><h3 class="label" id="qBot">${t('q.bottom')}</h3><div class="chips">${chips('bottom', BOT_SIZES)}</div></div>
          <p class="muted" style="font-size:14px">${t('q.sizesHint')} <a class="tlink" href="${PAGES['page.sizes'][lang === 'it' ? 0 : 1]}" data-page="page.sizes">${t('q.sizeGuide')}</a></p>
        </div>`;
    } else {
      stage.innerHTML = `<h2 class="quiz__q" id="quizQ" tabindex="-1">${t(q.q)}</h2>
        <div class="opts${q.o.length === 4 ? ' opts--4' : ''}" role="group" aria-labelledby="quizQ">
          ${q.o.map(v => optBtn('quiz-opt', q.k, v, quiz.a[q.k] === v, quiz.a)).join('')}
        </div>`;
    }
    $('#quizBack').disabled = quiz.step === 0;
    const next = $('#quizNext');
    next.textContent = quiz.step === 5 ? t('quiz.show') : t('quiz.next');
    next.disabled = !answered(quiz.step);
  }
  $('#quizMain').scrollTop = 0;
  if (anim && !reduceMotion.matches) { stage.classList.remove('is-anim'); void stage.offsetWidth; stage.classList.add('is-anim'); }
}
function quizGo(step) {
  quiz.step = Math.max(0, Math.min(5, step));
  renderQuiz();
  setTimeout(() => $('#quizQ')?.focus({ preventScroll: true }), 30);
}
let autoT;
function quizAnswer(k, v, btn) {
  quiz.a[k] = v;
  $$('.opt', btn.parentElement).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  $('#quizNext').disabled = false;
  clearTimeout(autoT);
  autoT = setTimeout(() => { if (Layers.isOpen($('#quiz')) && !quiz.result && Q[quiz.step].k === k) quizGo(quiz.step + 1); }, reduceMotion.matches ? 0 : 320);
}
function currentResult() { const r = quiz.result; return r && r.list[r.idx]; }
function resultDesc(a) {
  return t('result.desc', { occ: t('d.' + a.occ), season: t('d.' + a.season), fit: t('d.' + a.fit), pal: t('d.' + a.pal) });
}
function compatibleAlts(cur, i) {
  const it = cur.items[i], p = P[it.id], a = quiz.a, inOutfit = cur.items.map(x => x.id);
  return PRODUCTS.filter(q => q.c === p.c && q.s === cur.o.style && !inOutfit.includes(q.id) && avail(q, it.size))
    .map(q => ({ q, s: (q.fit === a.fit ? 2 : 0) + (q.pal === a.pal ? 2 : 0) - Math.abs(q.f - OCC_F[a.occ]) + (q.se.includes(a.season) ? 1.5 : -2) }))
    .sort((x, y) => y.s - x.s).slice(0, 3).map(x => x.q);
}
function renderResult() {
  const stage = $('#quizStage'), r = quiz.result;
  if (!r.list.length) {
    stage.innerHTML = `<h2 class="quiz__q" id="quizQ" tabindex="-1">${t('result.none')}</h2><button class="btn btn--solid" type="button" data-act="quiz-redo">${t('result.redo')}</button>`;
    return;
  }
  const cur = currentResult(), items = cur.items.map(x => P[x.id]);
  const total = items.reduce((s, p) => s + p.p, 0);
  const qKey = 'q:' + cur.items.map(x => x.id).join('+');
  stage.innerHTML = `<div class="result">
    <div class="result__media"><div class="ph ph--34">${outfitArt(items)}</div>${favBtn(qKey, t('favs.quiz'))}</div>
    <div>
      <p class="label result__eyebrow">${t('style.' + cur.o.style)}</p>
      <h2 class="result__title" id="quizQ" tabindex="-1">${t('result.title')}</h2>
      <p class="result__desc">${resultDesc(quiz.a)}</p>
      <ul class="result__items">${cur.items.map((it, i) => {
        const p = P[it.id], open = r.change === i;
        const alts = open ? compatibleAlts(cur, i) : [];
        return `<li class="ritem">
          <div class="ritem__row">
            <div class="ph ritem__ph">${productArt(p, 0, { decorative: true })}</div>
            <div>
              <p class="ritem__name">${esc(L(p.n))}</p>
              <div class="ritem__meta"><label for="rs${i}">${t('size')}</label>
                <select id="rs${i}" data-act="quiz-size" data-i="${i}">${sizesFor(p).map(s => `<option value="${s}" ${s === it.size ? 'selected' : ''} ${avail(p, s) ? '' : 'disabled'}>${s}${avail(p, s) ? '' : ' (' + t('soldout') + ')'}</option>`).join('')}</select>
              </div>
            </div>
            <div class="ritem__right"><span class="ritem__price">${fmt(p.p)}</span>
              <button class="textbtn" type="button" data-act="quiz-change" data-i="${i}" aria-expanded="${open}" aria-controls="alts${i}">${t('result.change')}</button></div>
          </div>
          ${it.swapped ? `<p class="ritem__swap">${t('result.swapped')}</p>` : ''}
          ${open ? `<div class="alts" id="alts${i}"><h4>${t('result.alts')}</h4>${alts.length ? alts.map(q => `<div class="alt">
              <div class="ph">${productArt(q, 0, { decorative: true })}</div>
              <div><p class="alt__name">${esc(L(q.n))}</p><p class="alt__price">${fmt(q.p)}</p></div>
              <button class="btn btn--ghost" type="button" style="min-height:36px;padding:0 14px" data-act="quiz-pick" data-i="${i}" data-id="${q.id}">${t('result.pick')}</button>
            </div>`).join('') : `<p class="alt__price" style="padding:10px 0">${t('result.noAlt')}</p>`}</div>` : ''}
        </li>`;
      }).join('')}</ul>
      <div class="result__total"><span>${t('result.total')}</span><strong>${fmt(total)}</strong></div>
      <p class="drawer__note">${t('result.note')}</p>
      <div class="result__actions">
        <button class="btn btn--solid" type="button" data-act="quiz-add">${t('result.add')}</button>
        ${shareBtn('quiz', cur.items.map(x => x.id).join(','), t('favs.quiz'))}
      </div>
      ${r.list.length > 1 ? `<div class="result__more"><h3 class="label">${t('result.more')}</h3><div class="altcards">
        ${r.list.map((x, j) => j === r.idx ? '' : `<button class="altcard" type="button" data-act="quiz-alt" data-j="${j}">
            <span class="ph" style="display:block">${outfitArt(x.items.map(y => P[y.id]), { decorative: true })}</span>
            <span class="altcard__t">${esc(capFirst(x.items.map(y => L(P[y.id].sh)).join(', ')))}</span>
            <span class="altcard__p">${fmt(x.items.reduce((s, y) => s + P[y.id].p, 0))}</span>
          </button>`).join('')}
      </div></div>` : ''}
      <div class="result__redo"><button class="btn btn--ghost" type="button" data-act="quiz-redo">${t('result.redo')}</button></div>
    </div>
  </div>`;
}

/* =========================================================
   COOKIE
   ========================================================= */
function setConsent(media, stats) {
  consent = { media: !!media, stats: !!stats, ts: Date.now(), v: 1 };
  store.set('consent', consent);
  $('#cookieBanner').hidden = true;
  // In produzione: attivare qui gli strumenti statistici solo se stats === true.
}
function openCookiePrefs() {
  $('#ckMedia').checked = !!consent?.media;
  $('#ckStats').checked = !!consent?.stats;
  Layers.open($('#cookieModal'));
}

/* =========================================================
   LINGUA
   ========================================================= */
function applyStatic() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
    const [attr, key] = pair.split(':'); el.setAttribute(attr, t(key));
  }));
  $$('a[data-page]').forEach(a => { const pg = PAGES[a.dataset.page]; if (pg && !a.dataset.pageName) a.setAttribute('href', pg[lang === 'it' ? 0 : 1]); });
  $$('.langsel [data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.title = t('meta.title');
  $('meta[name="description"]').setAttribute('content', t('meta.desc'));
  $('link[rel="canonical"]').setAttribute('href', `${CONFIG.baseUrl}/${lang}/`);
}
function renderAll() {
  renderMega(); renderOM(); renderStyles(); renderNew(); renderSocial(); renderInvite(); renderFooter(); updateCounts();
  if (Layers.isOpen($('#mnav'))) renderMobileNav();
  if (Layers.isOpen($('#cartDrawer'))) renderCart();
  if (Layers.isOpen($('#favDrawer'))) renderFavs();
  if (Layers.isOpen($('#sizeDrawer'))) renderSizeDrawer();
  if (Layers.isOpen($('#quiz'))) renderQuiz(false);
}
function setLang(l) {
  if (l !== 'it' && l !== 'en') return;
  if (ROUTE === 'folders') { if (l !== lang) { store.set('lang', l); location.href = `../${l}/` + (location.protocol === 'file:' ? 'index.html' : ''); } return; }
  lang = l; store.set('lang', l);
  try { history.replaceState(null, '', '#' + l); } catch (e) { /* ignorato */ }
  applyStatic(); renderAll();
}

/* =========================================================
   HERO
   ========================================================= */
function setupHero() {
  const hero = $('#top'), v = $('#heroVideo');
  const portrait = matchMedia('(max-aspect-ratio: 1/1)').matches;
  const src = portrait ? CONFIG.heroVideo.mobile : CONFIG.heroVideo.desktop;
  $('#heroArt').innerHTML = outfitArt([P.m12, P.m4, P.m8], { decorative: true, mono: '#D9D8D4' });
  if (!src.webm && !src.mp4) { v.remove(); hero.classList.add('no-video'); return; }
  if (src.poster) v.poster = src.poster;              // immagine statica mentre il video carica
  if (reduceMotion.matches) { v.removeAttribute('autoplay'); v.preload = 'none'; return; }
  if (src.webm) v.insertAdjacentHTML('beforeend', `<source src="${src.webm}" type="video/webm">`);
  if (src.mp4) v.insertAdjacentHTML('beforeend', `<source src="${src.mp4}" type="video/mp4">`);
  v.load(); v.play().catch(() => {});
}

/* =========================================================
   NAVBAR
   Le due macro categorie aprono un pannello con le cinque sezioni (desktop);
   su mobile un menu laterale con le categorie a fisarmonica.
   ========================================================= */
const hdr = $('#hdr');
const SECTIONS = [
  { k: 'knit', slug: ['maglioni', 'knitwear'] },
  { k: 'tee', slug: ['magliette', 't-shirts'] },
  { k: 'pants', slug: ['pantaloni', 'trousers'] },
  { k: 'jacket', slug: ['giacche', 'jackets'] },
  { k: 'shirt', slug: ['camicie', 'shirts'] }
];
const STYLE_ART = { minimal: ['m11', 'm14', 'm10'], street: ['s11', 's5', 's8'] };
const stylePage = st => PAGES['page.' + st][lang === 'it' ? 0 : 1];
function sectionLinks(st) {
  return SECTIONS.map(s => {
    const name = t('sec.' + s.k);
    return `<li><a href="${stylePage(st)}/${L(s.slug)}" data-page="page.${st}" data-page-name="${esc(t('style.' + st) + ': ' + name)}">${name}</a></li>`;
  }).join('');
}
function renderMega() {
  ['minimal', 'street'].forEach(st => {
    const style = t('style.' + st);
    const om = OM.find(o => P[o.items[0]].s === st);   // outfit del mese di questo stile
    let omTile = '';
    if (om) {
      const pr = omPrice(om);
      omTile = `<a class="mega__tile mega__tile--a" href="${path('outfit', om.slug)}" data-page="page.outfit">
          <span class="ph" style="display:block">${outfitArt(om.items.map(id => P[id]), { decorative: true })}</span>
          <span class="mega__cap"><span class="label">${t('nav.om')}</span><strong>${esc(L(om.n))}</strong>
            <span class="price"><span class="price__now${pr.active ? ' is-sale' : ''}">${fmt(pr.now)}</span>${pr.active ? `<s class="price__was"><span class="sr">${t('price.was')} </span>${fmt(pr.full)}</s>` : ''}</span></span>
        </a>`;
    }
    $('#mega-' + st).innerHTML = `<div class="wrap grid mega__in">
        <div class="mega__nav">
          <ul class="mega__links">${sectionLinks(st)}</ul>
          <a class="label mega__all" href="${stylePage(st)}" data-page="page.${st}">${esc(t('nav.all', { style }))}</a>
        </div>
        ${omTile}
        <button class="mega__tile mega__tile--b" type="button" data-act="mega-quiz" data-v="${st}">
          <span class="ph" style="display:block">${outfitArt(STYLE_ART[st].map(id => P[id]), { decorative: true })}</span>
          <span class="mega__cap"><span class="label">${t('hero.cta')}</span><span>${esc(t('nav.quizText', { style }))}</span></span>
        </button>
      </div>`;
  });
}
function renderMobileNav() {
  $('#mnavBody').innerHTML = `<ul>${['minimal', 'street'].map(st => {
      const style = t('style.' + st);
      return `<li>
        <button class="mnav__cat" type="button" data-act="mnav-cat" aria-expanded="false" aria-controls="mn-${st}">${style}<span class="mnav__ico" aria-hidden="true"></span></button>
        <div class="mnav__sub" id="mn-${st}" hidden>
          <ul>${sectionLinks(st)}</ul>
          <a class="label mnav__all" href="${stylePage(st)}" data-page="page.${st}">${esc(t('nav.all', { style }))}</a>
        </div></li>`;
    }).join('')}</ul>
    <button class="btn btn--solid btn--block mnav__quiz" type="button" data-act="mnav-quiz">${t('hero.cta')}</button>`;
}

const Mega = (() => {
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 1024px)');
  const scrimEl = $('#navScrim');
  let open = null, tOpen = 0, tClose = 0, tHide = 0, openedAt = 0, openY = 0, byHover = false;
  const trig = k => $(`.nav__trigger[data-mega="${k}"]`);
  const panel = k => $('#mega-' + k);
  function show(k, focusFirst = false, hover = false) {
    clearTimeout(tOpen); clearTimeout(tClose); clearTimeout(tHide);
    byHover = hover;   // aperto col mouse: si chiude uscendo; aperto con clic o tastiera: resta aperto
    if (open && open !== k) {   // passaggio diretto da una categoria all'altra
      const p = panel(open); p.classList.remove('is-open'); p.hidden = true;
      trig(open).setAttribute('aria-expanded', 'false');
    }
    if (open !== k) {
      const p = panel(k); p.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('is-open')));
      trig(k).setAttribute('aria-expanded', 'true');
      open = k; openedAt = Date.now(); openY = scrollY;
    }
    hdr.classList.add('has-mega'); hdr.classList.remove('is-hidden');
    scrimEl.hidden = false; requestAnimationFrame(() => scrimEl.classList.add('is-on'));
    if (focusFirst) setTimeout(() => panel(k).querySelector('a, button')?.focus({ preventScroll: true }), 40);
  }
  function hide(restore = false) {
    clearTimeout(tOpen); clearTimeout(tClose);
    if (!open) return;
    const k = open, p = panel(k);
    open = null;
    p.classList.remove('is-open');
    trig(k).setAttribute('aria-expanded', 'false');
    hdr.classList.remove('has-mega');
    scrimEl.classList.remove('is-on');
    tHide = setTimeout(() => { if (open !== k) p.hidden = true; if (!open) scrimEl.hidden = true; }, reduceMotion.matches ? 0 : 280);
    if (restore) trig(k).focus({ preventScroll: true });
  }
  const closeSoon = () => { clearTimeout(tOpen); clearTimeout(tClose); tClose = setTimeout(() => hide(), 220); };
  $$('.nav__trigger').forEach(b => {
    const k = b.dataset.mega;
    b.addEventListener('mouseenter', () => {
      if (!canHover.matches) return;
      clearTimeout(tClose); clearTimeout(tOpen);
      tOpen = setTimeout(() => show(k, false, true), open ? 0 : 90);   // breve attesa per non aprire passando sopra di sfuggita
    });
    b.addEventListener('click', () => { (open === k && Date.now() - openedAt > 450) ? hide() : show(k); });
    b.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); show(k, true); } });
  });
  const hoverOpen = () => canHover.matches && open && byHover;
  hdr.addEventListener('mouseleave', () => { if (hoverOpen()) closeSoon(); });
  hdr.addEventListener('mouseenter', () => clearTimeout(tClose));
  [$('.logo', hdr), $('.hdr__icons', hdr)].forEach(el => el.addEventListener('mouseenter', () => { if (hoverOpen()) closeSoon(); }));
  hdr.addEventListener('focusout', e => { if (open && e.relatedTarget && !hdr.contains(e.relatedTarget)) hide(); });
  scrimEl.addEventListener('click', () => hide());
  scrimEl.addEventListener('mouseenter', () => { if (hoverOpen()) closeSoon(); });
  desktop.addEventListener('change', () => { if (!desktop.matches) hide(); });
  return { show, hide, isOpen: () => !!open, openedY: () => openY };
})();

$('#menuOpen').addEventListener('click', () => {
  renderMobileNav();
  Layers.open($('#mnav'));
  $('#menuOpen').setAttribute('aria-expanded', 'true');
});
$('#mnav').addEventListener('layer:close', () => $('#menuOpen').setAttribute('aria-expanded', 'false'));

/* =========================================================
   EVENTI
   ========================================================= */
document.addEventListener('click', e => {
  if (shareMenu && !shareMenu.el.contains(e.target) && !shareMenu.btn.contains(e.target)) closeShareMenu(false);

  const pg = e.target.closest('[data-page]');
  if (pg) { e.preventDefault(); if (pg.closest('.mega')) Mega.hide(); toast(t('toast.page', { p: pg.dataset.pageName || t(pg.dataset.page) })); return; }
  if (e.target.closest('[data-open-quiz]')) { quiz.a = {}; openQuiz(0); return; }
  if (e.target.closest('[data-open-cookie-prefs]')) { openCookiePrefs(); return; }
  const lb = e.target.closest('button[data-lang]');
  if (lb) { setLang(lb.dataset.lang); return; }
  const cl = e.target.closest('[data-close]');
  if (cl) { const layer = cl.closest('.drawer,.sheet,.modal,.quiz,.player'); if (layer) Layers.close(layer); return; }

  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'SELECT') return;
  const id = b.dataset.id;
  switch (b.dataset.act) {
    case 'fav': toggleFav(b.dataset.key, b.dataset.name); break;
    case 'share': doShare(b); break;
    case 'copy': copyText(b.dataset.url).then(ok => { closeShareMenu(); toast(t(ok ? 'sh.copied' : 'sh.copyFail')); }); break;
    case 'om-add': openSizeDrawer(id); break;
    case 'fav-om-add': Layers.close($('#favDrawer')); setTimeout(() => openSizeDrawer(id), 60); break;
    case 'pick-size': {
      sizeSel.sizes[id] = b.dataset.size;
      $$('.chip', b.parentElement).forEach(c => c.setAttribute('aria-pressed', String(c === b)));
      renderSizeFoot();
      break;
    }
    case 'size-confirm':
      addBundle(sizeSel.omId, sizeSel.sizes);
      Layers.close($('#sizeDrawer'));
      openCart();
      break;
    case 'size-add': addProduct(id, b.dataset.size); openCart(); break;
    case 'sheet': openSheet(id); break;
    case 'sheet-size': addProduct(id, b.dataset.size); Layers.close($('#sizeSheet')); openCart(); break;
    case 'video': playVideo(+b.dataset.i); break;
    case 'invite-opt':
      quiz.a = { style: b.dataset.v };
      $$('.opt', b.parentElement).forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      setTimeout(() => openQuiz(1), reduceMotion.matches ? 0 : 220);   // apre il quiz dalla domanda 2
      break;
    case 'quiz-opt': quizAnswer(b.dataset.k, b.dataset.v, b); break;
    case 'quiz-size-chip':
      quiz.a[b.dataset.k] = b.dataset.v;
      $$('.chip', b.parentElement).forEach(c => c.setAttribute('aria-pressed', String(c === b)));
      $('#quizNext').disabled = !answered(5);
      break;
    case 'quiz-change': {
      const i = +b.dataset.i; quiz.result.change = quiz.result.change === i ? null : i;
      const y = $('#quizMain').scrollTop; renderResult(); $('#quizMain').scrollTop = y;
      $(`[data-act="quiz-change"][data-i="${i}"]`)?.focus({ preventScroll: true });
      break;
    }
    case 'quiz-pick': {
      const i = +b.dataset.i, cur = currentResult();
      cur.items[i] = { id, size: cur.items[i].size, swapped: false };
      quiz.result.change = null;
      const y = $('#quizMain').scrollTop; renderResult(); $('#quizMain').scrollTop = y;
      $(`[data-act="quiz-change"][data-i="${i}"]`)?.focus({ preventScroll: true });
      break;
    }
    case 'quiz-alt':
      quiz.result.idx = +b.dataset.j; quiz.result.change = null;
      renderQuiz(); setTimeout(() => $('#quizQ')?.focus({ preventScroll: true }), 30);
      break;
    case 'quiz-add': currentResult().items.forEach(x => addProduct(x.id, x.size)); openCart(); break;
    case 'quiz-redo': quiz.a = {}; quiz.result = null; quizGo(0); break;
    case 'qty': {
      const l = cart.find(x => x.key === b.dataset.key); if (!l) break;
      l.qty += +b.dataset.d;
      if (l.qty <= 0) cart = cart.filter(x => x !== l);
      saveCart(); renderCart();
      const again = $$(`[data-act="qty"]`).find(x => x.dataset.key === b.dataset.key && x.dataset.d === b.dataset.d);
      (again || $('#cartDrawer [data-close]')).focus({ preventScroll: true });
      break;
    }
    case 'remove':
      cart = cart.filter(x => x.key !== b.dataset.key); saveCart(); renderCart();
      ($('#cartBody button') || $('#cartDrawer [data-close]')).focus({ preventScroll: true });
      break;
    case 'checkout': checkout(); break;
    case 'cart-quiz': Layers.close($('#cartDrawer')); quiz.a = {}; setTimeout(() => openQuiz(0), 60); break;
    case 'mega-quiz': Mega.hide(); quiz.a = { style: b.dataset.v }; openQuiz(1); break;
    case 'mnav-cat': {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      $('#' + b.getAttribute('aria-controls')).hidden = !open;
      break;
    }
    case 'mnav-quiz': Layers.close($('#mnav')); quiz.a = {}; setTimeout(() => openQuiz(0), 60); break;
  }
});

document.addEventListener('change', e => {
  const s = e.target.closest('select[data-act="quiz-size"]');
  if (!s) return;
  const cur = currentResult(), i = +s.dataset.i;
  cur.items[i].size = s.value;
  if (quiz.result.change === i) { const y = $('#quizMain').scrollTop; renderResult(); $('#quizMain').scrollTop = y; $('#rs' + i)?.focus(); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (shareMenu) { closeShareMenu(); return; }
    if (!Layers.top() && Mega.isOpen()) { Mega.hide(true); return; }
    const top = Layers.top(); if (top) { e.preventDefault(); Layers.close(top); }
  } else if (e.key === 'Tab') {
    if (shareMenu) { closeShareMenu(false); }
    Layers.trap(e);
  }
});
addEventListener('resize', () => closeShareMenu(false));
document.addEventListener('scroll', () => closeShareMenu(false), { passive: true, capture: true });

$('#favOpen').addEventListener('click', () => { renderFavs(); Layers.open($('#favDrawer')); });
$('#cartOpen').addEventListener('click', openCart);
$('#logoLink').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }); });
$('#quizBack').addEventListener('click', () => quizGo(quiz.step - 1));
$('#quizNext').addEventListener('click', () => {
  if (!answered(quiz.step)) return;
  if (quiz.step < 5) { quizGo(quiz.step + 1); return; }
  computeResult(); renderQuiz();
  setTimeout(() => $('#quizQ')?.focus({ preventScroll: true }), 30);
});
$('#quiz').addEventListener('layer:close', () => { clearTimeout(autoT); renderInvite(); });

$('#ckAccept').addEventListener('click', () => setConsent(true, true));
$('#ckReject').addEventListener('click', () => setConsent(false, false));
$('#ckX').addEventListener('click', () => setConsent(false, false));
$('#ckSave').addEventListener('click', () => { setConsent($('#ckMedia').checked, $('#ckStats').checked); Layers.close($('#cookieModal')); toast(t('cookie.saved')); });
$('#ckRejectAll').addEventListener('click', () => { setConsent(false, false); Layers.close($('#cookieModal')); toast(t('cookie.saved')); });

$('#newsForm').addEventListener('submit', e => {
  e.preventDefault();
  const em = $('#newsEmail'), ok = $('#newsConsent'), msg = $('#newsMsg');
  msg.className = 'news__msg';
  em.removeAttribute('aria-invalid');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) {
    msg.textContent = t('news.errEmail'); msg.classList.add('is-err'); em.setAttribute('aria-invalid', 'true'); em.focus(); return;
  }
  if (!ok.checked) { msg.textContent = t('news.errConsent'); msg.classList.add('is-err'); ok.focus(); return; }
  // In produzione: POST /api/newsletter (doppia conferma via email)
  msg.textContent = t('news.ok'); msg.classList.add('is-ok');
  e.target.reset();
});

if (ROUTE === 'hash') addEventListener('hashchange', () => { const h = location.hash.slice(1); if ((h === 'it' || h === 'en') && h !== lang) setLang(h); });

/* Navbar: trasparente sulla hero, bianca dopo; scendendo si nasconde, salendo ricompare */
let ticking = false, lastY = scrollY;
function onScroll() {
  ticking = false;
  const y = scrollY, heroH = $('#top').offsetHeight;
  const solid = y > heroH - 72;
  hdr.classList.toggle('is-solid', solid);
  document.body.classList.toggle('hdr-solid', solid);
  if (Mega.isOpen() && Math.abs(y - Mega.openedY()) > 40) Mega.hide();
  const d = y - lastY;
  if (Math.abs(d) > 6) { hdr.classList.toggle('is-hidden', d > 0 && y > heroH && !Mega.isOpen()); lastY = y; }
  if (y <= heroH) hdr.classList.remove('is-hidden');
}
hdr.addEventListener('focusin', () => hdr.classList.remove('is-hidden'));
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

/* Comparsa delle sezioni: dissolvenza con leggero movimento verso l'alto, elementi in sequenza */
function initReveal() {
  const els = $$('[data-reveal]');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in', 'is-settled')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in'); io.unobserve(en.target);
    setTimeout(() => en.target.classList.add('is-settled'), 1800);
  }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
}

/* Conto alla rovescia: aggiornato ogni minuto; allo scadere lo sconto si disattiva da solo */
function tick() {
  let expired = false;
  OM.forEach(om => {
    const el = document.querySelector(`[data-cd="${om.id}"]`), ms = om.ends - Date.now();
    if (!el) return;
    if (ms <= 0) expired = true;
    else { const txt = cdText(ms); if (el.textContent !== txt) { el.textContent = txt; el.setAttribute('aria-label', cdAria(ms)); } }
  });
  if (expired) {
    renderOM();
    $('#omList').closest('[data-reveal]').classList.add('is-in', 'is-settled');
    if (Layers.isOpen($('#cartDrawer'))) renderCart();
    if (Layers.isOpen($('#sizeDrawer'))) renderSizeFoot();
  }
}

/* ---------- avvio ---------- */
applyStatic();
renderAll();
setupHero();
initReveal();
onScroll();
setInterval(tick, 10000);
if (!consent) $('#cookieBanner').hidden = false;
})();
