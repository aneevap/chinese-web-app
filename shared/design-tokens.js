/* ==================================
   学汉字 Design System — JS Helpers
   ================================== */

/* --- Tone color detection from pinyin --- */
const TONE_MAP = {
  1: 'āēīōūǖĀĒĪŌŪǕ',
  2: 'áéíóúǘÁÉÍÓÚǗ',
  3: 'ǎěǐǒǔǚǍĚǏǑǓǙ',
  4: 'àèìòùǜÀÈÌÒÙǛ'
};

function detectTone(syllable) {
  for (let tone = 1; tone <= 4; tone++) {
    for (let char of syllable) {
      if (TONE_MAP[tone].indexOf(char) !== -1) return tone;
    }
  }
  return 0;
}

/* Wrap pinyin syllables in tone-colored spans */
function colorPinyin(py) {
  if (!py) return '';
  const parts = py.split(/(\s+|['\-])/);
  return parts.map(p => {
    if (/^\s+$/.test(p) || p === "'" || p === '-') return p;
    if (!p.length) return '';
    return `<span class="t${detectTone(p)}">${escapeHtml(p)}</span>`;
  }).join('');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* --- Image loading with graceful fallback --- */
function setImageWithFallback(el, url) {
  if (!el) return;
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url("${url}")`;
    el.classList.remove('no-image');
  };
  img.onerror = () => el.classList.add('no-image');
  img.src = url;
}

/* --- Stable theme color hashing (Botes palette rotation) --- */
const BOTES_PALETTE = [
  { color: '#E8C547', deep: '#C9A82F' }, // mustard
  { color: '#A4C2D9', deep: '#7FA3BD' }, // sky
  { color: '#E8836F', deep: '#C9624E' }, // coral
  { color: '#94A88E', deep: '#6F8A68' }, // sage
  { color: '#C97B5C', deep: '#A65A3D' }, // terracotta
  { color: '#D4A574', deep: '#B8854F' }, // ochre
  { color: '#D89B9B', deep: '#B47272' }, // rose
  { color: '#B8A05C', deep: '#8F7B40' }  // olive
];

function hashThemeId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getBotesColor(themeId) {
  return BOTES_PALETTE[hashThemeId(themeId) % BOTES_PALETTE.length];
}

function applyThemeColor(el, themeId) {
  const bc = getBotesColor(themeId);
  el.style.setProperty('--theme-color', bc.color);
  el.style.setProperty('--theme-color-deep', bc.deep);
}