import { observeReveals, hydrateIcons, CONTACT } from './layout.js';
import { enquiry, enquiryLines } from './enquiry.js';
import { renderOffices } from './offices.js';

renderOffices(document.querySelector('[data-offices]'));
document.querySelector('[data-offices]').style.display = 'grid';
document.querySelector('[data-offices]').style.gap = 'var(--gutter)';

const form = document.querySelector('[data-form]');
const box = document.querySelector('[data-enq-box]');
const lines = document.querySelector('[data-enq-lines]');
const sent = document.querySelector('[data-sent]');

enquiry.subscribe((items) => {
  box.hidden = !items.length;
  lines.innerHTML = enquiryLines(items).map((l) => `<li>${l}</li>`).join('');
  const msg = form.message;
  if (items.length && !msg.value) msg.placeholder = 'Anything to add? Delivery city, required date, documents needed…';
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate() {
  let ok = true;
  const set = (el, err) => {
    const field = el.closest('.field');
    field.classList.toggle('invalid', !!err);
    field.querySelector('.err').textContent = err || '';
    if (err && ok) { el.focus(); ok = false; }
  };
  set(form.name, form.name.value.trim() ? '' : 'Please add your name.');
  set(form.email, EMAIL_RE.test(form.email.value.trim()) ? '' : 'Please add a valid email address.');
  set(form.message, form.message.value.trim() || enquiry.items.length ? '' : 'Tell us what you need.');
  return ok;
}

function compose() {
  const f = Object.fromEntries(new FormData(form));
  const list = enquiry.items.length ? ['Enquiry list:', ...enquiryLines().map((l) => `- ${l}`), ''] : [];
  const body = [
    `Name: ${f.name}`,
    f.company ? `Company: ${f.company}` : null,
    `Email: ${f.email}`,
    f.phone ? `Phone: ${f.phone}` : null,
    '',
    ...list,
    f.message,
  ].filter((x) => x !== null).join('\n');
  const subject = `Website enquiry: ${f.subject}${f.company ? ` — ${f.company}` : ''}`;
  return { subject, body };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;
  const { subject, body } = compose();
  location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  sent.classList.add('is-on');
});

document.querySelector('[data-wa]').addEventListener('click', () => {
  if (!validate()) return;
  const { subject, body } = compose();
  window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`, '_blank', 'noopener');
});

form.addEventListener('input', (e) => {
  const field = e.target.closest('.field');
  if (field?.classList.contains('invalid')) { field.classList.remove('invalid'); field.querySelector('.err').textContent = ''; }
});

hydrateIcons();
observeReveals();
