// Enquiry list: products a visitor wants a quote for. Lives in localStorage
// so it survives page changes; everything still works if storage is blocked.
import { productById } from './data/products.js';

const KEY = 'its-enquiry-v1';
const subs = new Set();

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v.filter((it) => productById(it.id)) : [];
  } catch {
    return [];
  }
}

let items = load();

function commit() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ }
  subs.forEach((fn) => fn(items));
}

window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  items = load();
  subs.forEach((fn) => fn(items));
});

export const enquiry = {
  get items() { return items; },
  has(id) { return items.some((it) => it.id === id); },
  add(id, pack, qty = 1) {
    const hit = items.find((it) => it.id === id && it.pack === pack);
    if (hit) hit.qty += qty;
    else items = [...items, { id, pack, qty }];
    commit();
  },
  setQty(i, qty) {
    if (!items[i]) return;
    items[i].qty = Math.max(1, Math.min(9999, Math.round(qty) || 1));
    commit();
  },
  remove(i) { items = items.filter((_, j) => j !== i); commit(); },
  clear() { items = []; commit(); },
  subscribe(fn) { subs.add(fn); fn(items); return () => subs.delete(fn); },
};

export function enquiryLines(list = items) {
  return list.map((it) => {
    const p = productById(it.id);
    return `${p.name} (${it.pack}) × ${it.qty}`;
  });
}
