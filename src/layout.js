// Shared chrome for every page: nav (morphs into a pill on scroll), footer,
// enquiry drawer, smooth scroll and scroll reveals.
import '@fontsource-variable/inter-tight';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/montserrat';
import './style.css';
import Lenis from 'lenis';
import { enquiry } from './enquiry.js';
import { productById, CATEGORIES } from './data/products.js';
import { ICON } from './art.js';

export const CONTACT = {
  email: 'sales@innovativeksa.com',
  ksa: { city: 'Al Khobar', region: 'Eastern Province, Saudi Arabia', phone: '+966 54 882 5759', tel: '+966548825759' },
  uae: { city: 'Dubai', region: 'Shop No. 12, Baniyas, Deira, Dubai, UAE', phones: [['+971 6 743 3699', '+97167433699'], ['+971 50 189 8956', '+971501898956']], email: 'info@sinolubeco.com' },
  whatsapp: '966548825759',
};

const page = document.body.dataset.page;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const LINKS = [
  ['products', 'Products', 'products.html'],
  ['services', 'Services', 'services.html'],
  ['process', 'Process', 'index.html#process'],
  ['about', 'About', 'about.html'],
];

const cur = (id) => (id === page ? ' aria-current="page"' : '');
const plus = '<span class="pl" aria-hidden="true"></span>';

export const logo = (cls = '') => `
  <a class="logo ${cls}" href="index.html" aria-label="Innovative Testing Solution — home">
    <img src="its-mark.png" alt="" width="34" height="40">
    <span class="wm"><b>Innovative</b><small>Testing Solution</small></span>
  </a>`;

/* ---------- inline icons ---------- */
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => { el.outerHTML = ICON[el.dataset.icon] || ''; });
}
hydrateIcons();

/* ---------- nav ---------- */
// The same top bar morphs into a floating pill as soon as the page scrolls
// and slides away while scrolling down, back on the first scroll up.
const navHost = document.querySelector('[data-nav]');
if (navHost) {
  navHost.innerHTML = `
    <div class="topbar">
      <div class="nav">
        ${logo()}
        <nav class="nav__links" aria-label="Primary">
          ${LINKS.map(([id, t, h]) => `<a class="plus-link" href="${h}"${cur(id)}>${plus}${t}</a>`).join('')}
          <button class="plus-link" type="button" data-open-enquiry>${plus}Enquiry <span class="badge" data-enq-count data-n="0">0</span></button>
          <a class="btn btn--sm" href="contact.html"${cur('contact')}>Contact Us ${ICON.arrow}</a>
        </nav>
        <button class="nav__burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
      <div class="nav__sheet"><div><nav aria-label="Mobile">
        ${[...LINKS, ['contact', 'Contact Us', 'contact.html']].map(([id, t, h]) => `<a href="${h}"${cur(id)}>${t}${plus}</a>`).join('')}
        <a href="#" data-open-enquiry>Enquiry list <span class="badge" data-enq-count data-n="0">0</span></a>
      </nav></div></div>
    </div>`;
  const bar = navHost.querySelector('.topbar');
  const burger = navHost.querySelector('.nav__burger');
  const setOpen = (open) => {
    navHost.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open) bar.classList.remove('is-hidden');
  };
  burger.addEventListener('click', () => setOpen(!navHost.classList.contains('nav-open')));
  navHost.querySelector('.nav__sheet').addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const pill = y > 80;
    bar.classList.toggle('is-pill', pill);
    if (!pill || navHost.classList.contains('nav-open') || y < lastY - 4) bar.classList.remove('is-hidden');
    else if (y > lastY + 4 && y > 400) bar.classList.add('is-hidden');
    if (Math.abs(y - lastY) > 4) lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- footer ---------- */
const footHost = document.querySelector('[data-footer]');
if (footHost) {
  footHost.innerHTML = `
    <div class="footer">
      <div class="footer__top">
        <div>
          ${logo()}
          <p>Laboratory chemicals, equipment and educational supplies, sourced and delivered across Saudi Arabia and the UAE.</p>
        </div>
        <div>
          <h4>Products</h4>
          <ul>${CATEGORIES.map((c) => `<li><a href="products.html?cat=${c.id}">${c.short}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="about.html">About us</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="index.html#process">How we work</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Talk to sales</h4>
          <ul>
            <li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
            <li><a href="tel:${CONTACT.ksa.tel}">${CONTACT.ksa.phone}</a> · KSA</li>
            <li><a href="tel:${CONTACT.uae.phones[0][1]}">${CONTACT.uae.phones[0][0]}</a> · UAE</li>
            <li><a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__big" aria-hidden="true">Innovative</div>
      <div class="footer__bot">
        <span>© ${new Date().getFullYear()} Innovative Testing Solution. Al Khobar · Dubai.</span>
        <span class="mono">Chemicals · Equipment · Sourcing</span>
      </div>
    </div>`;
}

/* ---------- enquiry drawer ---------- */
const drawer = document.createElement('div');
drawer.innerHTML = `
  <div class="drawer-scrim" data-close-enquiry></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="enq-title" tabindex="-1">
    <header><h2 class="h3" id="enq-title">Enquiry list</h2><button class="x" type="button" aria-label="Close" data-close-enquiry>${ICON.close}</button></header>
    <ul data-enq-list></ul>
    <footer>
      <p>No prices or payment here. Send the list and our sales team replies with a quotation, availability and lead time.</p>
      <a class="btn" href="contact.html#form" data-enq-send>Request quotation ${ICON.arrow}</a>
    </footer>
  </aside>`;
document.body.append(drawer);
const list = drawer.querySelector('[data-enq-list]');
const panel = drawer.querySelector('.drawer');
let lastFocus = null;

export function openEnquiry() {
  lastFocus = document.activeElement;
  document.documentElement.classList.add('drawer-open');
  lenis?.stop();
  setTimeout(() => panel.focus(), 50);
}
function closeEnquiry() {
  document.documentElement.classList.remove('drawer-open');
  lenis?.start();
  lastFocus?.focus?.();
}
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-open-enquiry]')) { e.preventDefault(); openEnquiry(); }
  if (e.target.closest('[data-close-enquiry]')) closeEnquiry();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.documentElement.classList.contains('drawer-open')) closeEnquiry();
});

enquiry.subscribe((items) => {
  document.querySelectorAll('[data-enq-count]').forEach((el) => { el.textContent = items.length; el.dataset.n = items.length; });
  drawer.querySelector('[data-enq-send]').toggleAttribute('hidden', !items.length);
  if (!items.length) {
    list.innerHTML = '<li class="none">Your list is empty. Add products from the <a href="products.html" style="color:var(--blue)">catalogue</a>.</li>';
    return;
  }
  list.innerHTML = items.map((it, i) => {
    const p = productById(it.id);
    return `<li>
      <div><b>${p.name}</b><small>${it.pack} · ${p.grade}</small></div>
      <div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="Less">−</button><input type="number" min="1" value="${it.qty}" data-qi="${i}" aria-label="Quantity"><button type="button" data-q="${i}" data-d="1" aria-label="More">+</button></div>
      <button class="rm" type="button" data-rm="${i}">Remove</button>
    </li>`;
  }).join('');
});
list.addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]');
  if (q) enquiry.setQty(+q.dataset.q, enquiry.items[+q.dataset.q].qty + +q.dataset.d);
  const rm = e.target.closest('[data-rm]');
  if (rm) enquiry.remove(+rm.dataset.rm);
});
list.addEventListener('change', (e) => {
  if (e.target.dataset.qi != null) enquiry.setQty(+e.target.dataset.qi, +e.target.value);
});

/* ---------- toast ---------- */
const toastEl = document.createElement('div');
toastEl.className = 'toast';
toastEl.setAttribute('role', 'status');
document.body.append(toastEl);
let toastT;
export function toast(msg) {
  toastEl.innerHTML = `<span>${msg}</span><button type="button" data-open-enquiry>View list</button>`;
  toastEl.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
}

/* ---------- smooth scroll ---------- */
export let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, anchors: { offset: -20 } });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ---------- reveals ---------- */
export function observeReveals(root = document) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
}
observeReveals();
