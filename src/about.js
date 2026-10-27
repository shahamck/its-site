import { observeReveals } from './layout.js';
import { VALUE_ICON } from './art.js';
import { renderOffices } from './offices.js';

const VALUES = [
  ['quality', 'Quality', 'Products from qualified manufacturers, in the grade the method calls for.'],
  ['dependable', 'Dependable service', 'Clear lead times and deliveries that arrive complete.'],
  ['support', 'Responsive support', 'A real person replies, before and after the order.'],
  ['relations', 'Long-term relationships', 'We plan supply with you, not just one order at a time.'],
];
document.querySelector('[data-values]').innerHTML = VALUES.map(([k, t, d], i) => `
  <div class="value" data-reveal style="--d:${i * 0.08}s">
    <div class="ic">${VALUE_ICON[k]}</div>
    <h3 class="h3">${t}</h3>
    <p>${d}</p>
  </div>`).join('');

renderOffices(document.querySelector('[data-offices]'));
observeReveals();
