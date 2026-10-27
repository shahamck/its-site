import { observeReveals, hydrateIcons } from './layout.js';
import { initHero } from './hero3d.js';
import { CATEGORIES } from './data/products.js';
import { categoryIcon, STEP_ART } from './art.js';

initHero(document.querySelector('[data-hero]'));

/* ---------- categories ---------- */
const CAT_ICON = { lab: 'bottle', industrial: 'drum', equipment: 'balance', education: 'tubes' };
document.querySelector('[data-cats]').innerHTML = CATEGORIES.map((c, i) => `
  <div class="cat" data-reveal style="--d:${i * 0.08}s">
    <div class="ic">${categoryIcon(CAT_ICON[c.id])}</div>
    <div>
      <h3 class="h3">${c.name}</h3>
      <p>${c.blurb}</p>
      <a class="more" href="products.html?cat=${c.id}">View range <span data-icon="arrow" style="width:14px"></span></a>
    </div>
  </div>`).join('');

/* ---------- process slider ---------- */
const STEPS = [
  ['enquire', 'Enquire', 'Send a product list, a spec sheet or just describe the test you need to run.'],
  ['source', 'Source', 'We match every line to qualified manufacturers and stock in the region.'],
  ['verify', 'Verify', 'Grade, lot number, COA and SDS are checked before anything ships.'],
  ['pack', 'Pack', 'Chemicals packed to transport rules, glass and instruments cushioned and labelled.'],
  ['deliver', 'Deliver', 'Delivered to your site across KSA and the UAE, paperwork in the box.'],
];
const track = document.querySelector('[data-track]');
track.innerHTML = STEPS.map(([k, t, d], i) => `
  <article class="step" data-reveal style="--d:${Math.min(i, 3) * 0.08}s">
    <div class="num">${String(i + 1).padStart(2, '0')}</div>
    <div class="label">${t}</div>
    <div class="art">${STEP_ART[k]()}</div>
    <p>${d}</p>
  </article>`).join('');

const count = document.querySelector('[data-count]');
const prev = document.querySelector('[data-prev]');
const next = document.querySelector('[data-next]');
const stepW = () => track.children[1].offsetLeft - track.children[0].offsetLeft;
const sync = () => {
  const i = Math.round(track.scrollLeft / stepW());
  const max = track.scrollWidth - track.clientWidth;
  count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`;
  prev.disabled = track.scrollLeft < 4;
  next.disabled = track.scrollLeft > max - 4;
};
prev.addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: 'smooth' }));
next.addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: 'smooth' }));
track.addEventListener('scroll', sync, { passive: true });
addEventListener('resize', sync);
sync();

/* ---------- industries ---------- */
const IND = [
  ['Schools & universities', 'Teaching-lab chemicals, glassware and student kits, packed per class.', ['Education', 'Kits']],
  ['QC & testing labs', 'Reagents, standards and instruments for routine and accredited testing.', ['AR / HPLC', 'Standards']],
  ['Oil, gas & petrochemical', 'Solvents, titration reagents and field consumables for Eastern Province operations.', ['Solvents', 'Bulk']],
  ['Industrial & process plants', 'Process chemicals in drums, IBCs and sacks with steady call-off supply.', ['Drums', 'IBC']],
  ['Water & environmental', 'Treatment chemicals, test reagents and sampling supplies.', ['Treatment', 'Reagents']],
  ['Commercial businesses', 'Cleaning, maintenance and facility chemicals for commercial sites.', ['Facilities', 'Cleaning']],
];
document.querySelector('[data-industries]').innerHTML = IND.map(([t, d, tags], i) => `
  <div class="ind" data-reveal style="--d:${(i % 3) * 0.08}s">
    <span class="num">${String(i + 1).padStart(2, '0')}</span>
    <h3 class="h3">${t}</h3>
    <p>${d}</p>
    <div class="tagrow">${tags.map((x) => `<span class="tag">${x}</span>`).join('')}</div>
  </div>`).join('');

hydrateIcons();
observeReveals();
