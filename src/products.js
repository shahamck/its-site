import { observeReveals, hydrateIcons, toast } from './layout.js';
import { enquiry } from './enquiry.js';
import { PRODUCTS, CATEGORIES, categoryById } from './data/products.js';
import { productArt, ICON } from './art.js';

const params = new URLSearchParams(location.search);
let cat = categoryById(params.get('cat')) ? params.get('cat') : 'all';
let q = params.get('q') || '';

const chips = document.querySelector('[data-chips]');
const grid = document.querySelector('[data-grid]');
const empty = document.querySelector('[data-empty]');
const search = document.querySelector('[data-search]');
const blurb = document.querySelector('[data-cat-blurb]');
const defaultBlurb = blurb.textContent;
search.value = q;

chips.innerHTML = [['all', 'All products', PRODUCTS.length], ...CATEGORIES.map((c) => [c.id, c.short, PRODUCTS.filter((p) => p.cat === c.id).length])]
  .map(([id, t, n]) => `<button class="chip" type="button" data-cat="${id}" aria-pressed="false">${t} <em>${n}</em></button>`).join('');

// art is the expensive part, so build each card once and only toggle visibility
grid.innerHTML = PRODUCTS.map((p) => `
  <article class="p-card" data-id="${p.id}" data-cat="${p.cat}">
    <div class="p-top"><span class="p-cat">${categoryById(p.cat).short}</span>${p.cas ? `<span class="cas">CAS ${p.cas}</span>` : ''}</div>
    <div class="p-art">${productArt(p)}</div>
    <h3>${p.name}</h3>
    <p class="spec">${p.grade}</p>
    <div class="p-act">
      <label class="sr" for="pk-${p.id}">Pack size</label>
      <select id="pk-${p.id}">${p.packs.map((k) => `<option>${k}</option>`).join('')}</select>
      <button class="btn btn--sm add" type="button" data-add="${p.id}">${ICON.plus} Add</button>
    </div>
  </article>`).join('');
const cards = [...grid.children];

function render() {
  chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
  blurb.textContent = cat === 'all' ? defaultBlurb : categoryById(cat).blurb;
  const needle = q.trim().toLowerCase();
  let shown = 0;
  cards.forEach((el) => {
    const p = PRODUCTS.find((x) => x.id === el.dataset.id);
    const hay = `${p.name} ${p.grade} ${p.cas || ''} ${p.packs.join(' ')}`.toLowerCase();
    const ok = (cat === 'all' || p.cat === cat) && (!needle || hay.includes(needle));
    el.hidden = !ok;
    if (ok) shown++;
  });
  empty.hidden = shown > 0;
  const url = new URL(location.href);
  cat === 'all' ? url.searchParams.delete('cat') : url.searchParams.set('cat', cat);
  needle ? url.searchParams.set('q', q) : url.searchParams.delete('q');
  history.replaceState(null, '', url);
}

chips.addEventListener('click', (e) => {
  const c = e.target.closest('[data-cat]');
  if (!c) return;
  cat = c.dataset.cat;
  render();
});
search.addEventListener('input', () => { q = search.value; render(); });

grid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]');
  if (!b) return;
  const card = b.closest('.p-card');
  const pack = card.querySelector('select').value;
  enquiry.add(b.dataset.add, pack);
  toast(`Added ${PRODUCTS.find((p) => p.id === b.dataset.add).name} (${pack})`);
});

enquiry.subscribe((items) => {
  const ids = new Set(items.map((it) => it.id));
  grid.querySelectorAll('[data-add]').forEach((b) => {
    const on = ids.has(b.dataset.add);
    b.classList.toggle('is-added', on);
    b.innerHTML = on ? `${ICON.check} Added` : `${ICON.plus} Add`;
  });
});

render();
hydrateIcons();
observeReveals();
