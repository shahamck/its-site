import { observeReveals, hydrateIcons } from './layout.js';
import { serviceArt } from './art.js';

const SERVICES = [
  ['chemicals', 'Chemical Supply', 'Laboratory, analytical and industrial chemicals in the grade and pack size you actually work with.',
    ['AR, HPLC, GR and technical grades', 'From 25 g bottles to 1,000 L IBCs', 'COA and SDS supplied with every lot', 'Packed and transported to hazmat rules']],
  ['equipment', 'Laboratory Equipment Supply', 'Instruments and benchtop equipment for QC, research and teaching labs, matched to your methods and sample load.',
    ['Balances, meters, heating, mixing and analysis', 'Help choosing the right specification', 'Installation guidance and user training', 'Spares, electrodes and consumables']],
  ['sourcing', 'Sourcing & Procurement', 'One partner for a mixed list. We quote, consolidate and deliver, so your team manages one order instead of ten.',
    ['Single quotation for mixed lists', 'Tender and BOQ pricing', 'Consolidated, scheduled deliveries', 'Call-off supply for regular consumption']],
  ['custom', 'Customized Product Sourcing', 'Hard-to-find items, specific brands and custom kits, sourced to your requirement.',
    ['Specific brands and part numbers', 'Custom kits for teaching labs', 'Requirement-based supply', 'Alternatives when an item is discontinued']],
];

document.querySelector('[data-services]').innerHTML = SERVICES.map(([k, t, d, list], i) => `
  <article class="svc" id="${k}">
    <div data-reveal>
      <span class="num">${String(i + 1).padStart(2, '0')} / 04</span>
      <h2 class="h2" style="font-size:clamp(32px,3.6vw,52px)">${t}</h2>
      <p class="lede">${d}</p>
      <ul>${list.map((x) => `<li>${x}</li>`).join('')}</ul>
      <a class="btn btn--ghost btn--sm" style="margin-top:26px" href="contact.html">Ask about ${t.toLowerCase()} <span data-icon="arrow"></span></a>
    </div>
    <div class="svc__art" data-reveal style="--d:.1s">${serviceArt(k)}</div>
  </article>`).join('');

hydrateIcons();
observeReveals();
