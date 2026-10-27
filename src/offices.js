import { CONTACT } from './layout.js';
import { mapTile } from './art.js';

export function renderOffices(host) {
  const { ksa, uae, email } = CONTACT;
  host.innerHTML = `
    <article class="office-card" data-reveal>
      <div class="map">${mapTile({ label: 'HEAD OFFICE / KSA', coords: '26.28°N  50.21°E' })}</div>
      <span class="eyebrow">Head office</span>
      <h3 class="h3" style="margin-top:12px">${ksa.city}</h3>
      <dl>
        <dt>Address</dt><dd>${ksa.region}</dd>
        <dt>Phone</dt><dd><a href="tel:${ksa.tel}">${ksa.phone}</a></dd>
        <dt>Email</dt><dd><a href="mailto:${email}">${email}</a></dd>
      </dl>
    </article>
    <article class="office-card" data-reveal style="--d:.1s">
      <div class="map">${mapTile({ label: 'BRANCH / UAE', coords: '25.27°N  55.31°E' })}</div>
      <span class="eyebrow">Branch</span>
      <h3 class="h3" style="margin-top:12px">${uae.city}</h3>
      <dl>
        <dt>Address</dt><dd>${uae.region}</dd>
        <dt>Phone</dt><dd>${uae.phones.map(([t, h]) => `<a href="tel:${h}">${t}</a>`).join('<br>')}</dd>
        <dt>Email</dt><dd><a href="mailto:${uae.email}">${uae.email}</a></dd>
      </dl>
    </article>`;
}
