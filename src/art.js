// Blueprint drawings: a tiny isometric SVG builder plus the objects drawn with
// it (bottles, drums, instruments, glassware) and the compositions used on
// the process steps, services and icons. Everything is plain SVG strings.

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const R2 = Math.SQRT2;
const f = (n) => Math.round(n * 10) / 10;

const FACES = {
  white: ['w1', 'w2', 'w3'],
  mist: ['m1', 'm2', 'm3'],
  glass: ['g1', 'g2', 'g3'],
  violet: ['v1', 'v2', 'v3'],
  blue: ['b1', 'b2', 'b3'],
};

export function iso({ cx, cy, s }) {
  const out = [];
  let ox = 0, oy = 0, oz = 0, k = 1;
  const P = (x, y, z) => {
    const X = x * k + ox, Y = y * k + oy, Z = z * k + oz;
    return [cx + (X - Y) * C * s, cy + (X + Y) * S * s - Z * s];
  };
  const pts = (arr) => arr.map((p) => P(...p)).map(([a, b]) => `${f(a)},${f(b)}`).join(' ');
  const ell = (r) => [R2 * C * r * k * s, R2 * S * r * k * s];
  const circ = (x, y, z, r, t) => [x + r * Math.cos(t), y + r * Math.sin(t), z];

  const g = {
    at(x = 0, y = 0, scale = 1, z = 0) { ox = x; oy = y; oz = z; k = scale; return g; },
    raw(str) { out.push(str); return g; },
    P,
    poly(arr, cls) { out.push(`<polygon class="${cls}" points="${pts(arr)}"/>`); return g; },
    line(arr, cls = 'ln') { out.push(`<polyline class="${cls}" points="${pts(arr)}"/>`); return g; },
    box(x, y, z, w, d, h, style = 'white', hidden = false) {
      const [t, r, l] = FACES[style];
      if (hidden) {
        g.line([[x, y, z], [x, y, z + h]], 'dash');
        g.line([[x, y + d, z], [x, y, z], [x + w, y, z]], 'dash');
      }
      g.poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], r);
      g.poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], l);
      g.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], t);
      return g;
    },
    // vertical cylinder centred on (x, y)
    cyl(x, y, z, r, h, style = 'white') { return g.frustum(x, y, z, r, r, h, style); },
    frustum(x, y, z, r0, r1, h, style = 'white') {
      const [t, side] = FACES[style];
      const [a, b0] = P(x, y, z);
      const [, b1] = P(x, y, z + h);
      const [rx0, ry0] = ell(r0);
      const [rx1, ry1] = ell(r1);
      if (style === 'glass') {
        out.push(`<path class="dash" d="M${f(a - rx0)},${f(b0)} A${f(rx0)},${f(ry0)} 0 0 1 ${f(a + rx0)},${f(b0)}"/>`);
      }
      out.push(`<path class="${side}" d="M${f(a - rx1)},${f(b1)} L${f(a - rx0)},${f(b0)} A${f(rx0)},${f(ry0)} 0 0 0 ${f(a + rx0)},${f(b0)} L${f(a + rx1)},${f(b1)} Z"/>`);
      out.push(`<ellipse class="${t}" cx="${f(a)}" cy="${f(b1)}" rx="${f(rx1)}" ry="${f(ry1)}"/>`);
      return g;
    },
    ring(x, y, z, r, cls = 'ln') {
      const [a, b] = P(x, y, z);
      const [rx, ry] = ell(r);
      out.push(`<ellipse class="${cls}" cx="${f(a)}" cy="${f(b)}" rx="${f(rx)}" ry="${f(ry)}"/>`);
      return g;
    },
    // front-facing strip around a cylinder (labels, rims)
    band(x, y, z0, z1, r, cls = 'lbl') {
      const [a, b0] = P(x, y, z0);
      const [, b1] = P(x, y, z1);
      const [rx, ry] = ell(r);
      out.push(`<path class="${cls}" d="M${f(a - rx)},${f(b1)} A${f(rx)},${f(ry)} 0 0 0 ${f(a + rx)},${f(b1)} L${f(a + rx)},${f(b0)} A${f(rx)},${f(ry)} 0 0 1 ${f(a - rx)},${f(b0)} Z"/>`);
      return g;
    },
    arc(x, y, z, r, t0, t1, cls = 'ln', n = 10) {
      const arr = [];
      for (let i = 0; i <= n; i++) arr.push(circ(x, y, z, r, t0 + ((t1 - t0) * i) / n));
      return g.line(arr, cls);
    },
    sq(x, y, z, size = 3.4, cls = 'sq') {
      const [a, b] = P(x, y, z);
      out.push(`<rect class="${cls}" x="${f(a - size / 2)}" y="${f(b - size / 2)}" width="${size}" height="${size}"/>`);
      return g;
    },
    dot(x, y, z, r = 1.8, cls = 'sq') {
      const [a, b] = P(x, y, z);
      out.push(`<circle class="${cls}" cx="${f(a)}" cy="${f(b)}" r="${r}"/>`);
      return g;
    },
    pin(x, y, z, r = 3.4) {
      const [a, b] = P(x, y, z);
      out.push(`<circle class="pk" cx="${f(a)}" cy="${f(b)}" r="${r}"/>`);
      return g;
    },
    plus(px, py, size = 5, cls = 'pk') {
      out.push(`<path class="${cls}" d="M${px - size},${py} H${px + size} M${px},${py - size} V${py + size}"/>`);
      return g;
    },
    dim(a, b, cls = 'dim') {
      const [x0, y0] = P(...a);
      const [x1, y1] = P(...b);
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
      const nx = (-dy / L) * 3, ny = (dx / L) * 3;
      out.push(`<path class="${cls}" d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)} M${f(x0 - nx)},${f(y0 - ny)} L${f(x0 + nx)},${f(y0 + ny)} M${f(x1 - nx)},${f(y1 - ny)} L${f(x1 + nx)},${f(y1 + ny)}"/>`);
      return g;
    },
    floor(x, y, w, d, step = 0) {
      if (step) {
        for (let i = step; i < w; i += step) g.line([[x + i, y, 0], [x + i, y + d, 0]], 'grid');
        for (let j = step; j < d; j += step) g.line([[x, y + j, 0], [x + w, y + j, 0]], 'grid');
      }
      return g.poly([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]], 'fl');
    },
    text(x, y, z, str, cls = 'tx', dx = 0) {
      const [a, b] = P(x, y, z);
      out.push(`<text class="${cls}" x="${f(a + dx)}" y="${f(b)}">${str}</text>`);
      return g;
    },
    svg(vb, extra = '', label = '') {
      const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
      return `<svg class="bp ${extra}" viewBox="${vb}" ${aria} preserveAspectRatio="xMidYMid meet">${out.join('')}</svg>`;
    },
  };
  return g;
}

/* ---------- objects (origin = centre of footprint, z up) ---------- */

const front = Math.PI / 4; // angle that faces the viewer

function bottle(g, o = {}) {
  const cap = o.cap || 'blue';
  g.cyl(0, 0, 0, 5.6, o.fill ?? 8.5, o.liquid || 'violet');
  g.cyl(0, 0, 0, 6, 14, 'glass');
  g.band(0, 0, 3.2, 9.6, 6.02, 'lbl');
  g.arc(0, 0, 5.4, 6.02, front - 0.55, front + 0.55, 'lbl-l', 6);
  g.arc(0, 0, 4.4, 6.02, front - 0.4, front + 0.3, 'lbl-l', 6);
  g.frustum(0, 0, 14, 6, 3, 2.4, 'glass');
  g.cyl(0, 0, 16.4, 2.6, 2.2, 'glass');
  g.cyl(0, 0, 18.4, 3, 3.4, cap);
  g.arc(0, 0, 19.6, 3.02, front - 1.2, front + 1.2, 'ln-w', 8);
}

function jar(g, o = {}) {
  g.cyl(0, 0, 0, 7, 10.5, 'white');
  g.band(0, 0, 2.6, 7.8, 7.04, o.violet ? 'lbl-v' : 'lbl-b');
  g.arc(0, 0, 5.6, 7.04, front - 0.5, front + 0.5, 'lbl-l', 6);
  g.cyl(0, 0, 10.5, 7.3, 3.4, o.violet ? 'violet' : 'blue');
  for (let t = -0.9; t <= 0.9; t += 0.3) g.line([[7.3 * Math.cos(front + t), 7.3 * Math.sin(front + t), 10.9], [7.3 * Math.cos(front + t), 7.3 * Math.sin(front + t), 13.5]], 'ln-w');
}

function drum(g) {
  g.cyl(0, 0, 0, 8, 20, 'blue');
  [6.5, 13.5].forEach((z) => g.arc(0, 0, z, 8.02, front - 1.55, front + 1.55, 'ln-w', 14));
  g.band(0, 0, 8.2, 11.8, 8.03, 'lbl');
  g.ring(0, 0, 20, 7, 'ln-w');
  g.cyl(-3.4, -2, 20, 1.3, 0.8, 'white');
  g.cyl(3.6, 1.6, 20, 0.9, 0.8, 'white');
}

function jerrycan(g) {
  g.box(-6, -4, 0, 12, 8, 15, 'white');
  g.poly([[-4.5, 4, 3], [3.5, 4, 3], [3.5, 4, 10], [-4.5, 4, 10]], 'lbl-v');
  g.line([[-3.5, 4, 8], [1.5, 4, 8]], 'ln-w');
  g.line([[-3.5, 4, 6.2], [2.5, 4, 6.2]], 'ln-w');
  g.box(-5, -1, 15, 6, 2, 3.2, 'white');
  g.box(-3.6, -1.01, 15, 3.2, 2.02, 1.8, 'mist');
  g.cyl(3.6, 1.6, 15, 1.7, 2.4, 'violet');
}

function sack(g) {
  g.box(-10, -7, 0, 20, 14, 4.6, 'white');
  g.box(-9, -6.5, 4.6, 18.5, 13, 4.4, 'mist');
  g.line([[-8, -5.4, 9.05], [8.4, -5.4, 9.05]], 'stitch');
  g.line([[-8, 5.4, 9.05], [8.4, 5.4, 9.05]], 'stitch');
  g.poly([[-6, 6.5, 5.6], [3, 6.5, 5.6], [3, 6.5, 8.2], [-6, 6.5, 8.2]], 'lbl-v');
  g.poly([[-7, 7, 0.8], [2, 7, 0.8], [2, 7, 3.6], [-7, 7, 3.6]], 'lbl-b');
}

function kit(g) {
  g.box(-11, -7, 0, 22, 14, 6.5, 'white');
  g.poly([[-11, 7, 2], [11, 7, 2], [11, 7, 3.4], [-11, 7, 3.4]], 'lbl-v');
  g.box(-11, -7, 6.5, 22, 14, 0.8, 'blue');
  const items = [[-6, -2, 'violet'], [0, -2, 'blue'], [6, -2, 'violet']];
  items.forEach(([x, y, liq]) => {
    g.cyl(x, y, 7.3, 2.1, 3.4, liq);
    g.cyl(x, y, 7.3, 2.3, 6, 'glass');
    g.cyl(x, y, 13.3, 2.4, 1.6, 'white');
  });
}

function balance(g) {
  g.box(-8, -7, 0, 16, 14, 3.2, 'white');
  g.poly([[8, -3, 0.8], [8, 4.5, 0.8], [8, 4.5, 2.4], [8, -3, 2.4]], 'scr');
  g.text(8, 1.6, 1.2, '0.0000', 'tx-s', -6);
  g.cyl(-0.5, -0.5, 3.2, 0.5, 1, 'white');
  g.cyl(-0.5, -0.5, 4.2, 3.2, 0.4, 'mist');
  g.box(-6.5, -6.5, 3.2, 12, 12, 10.5, 'glass', true);
  g.box(-6.5, -6.5, 13.7, 12, 12, 0.6, 'white');
}

function meter(g) {
  g.box(-10, -6, 0, 13, 12, 4, 'white');
  g.poly([[-8, -4, 4], [-1.5, -4, 4], [-1.5, 2.5, 4], [-8, 2.5, 4]], 'scr');
  g.text(-4.8, -0.8, 4, '7.01', 'tx-s', -6);
  g.cyl(1, -4, 4, 0.6, 13, 'white');
  g.cyl(9, -2, 0, 3.6, 3.8, 'violet');
  g.cyl(9, -2, 2, 0.7, 14, 'blue');
  g.cyl(9, -2, 0, 4, 7, 'glass');
  g.box(0.4, -4.6, 15.4, 9.6, 1.2, 1.2, 'white');
}

function stirrer(g) {
  g.box(-8, -8, 0, 16, 16, 3.6, 'white');
  g.ring(0, 0, 3.6, 6.4, 'pk');
  g.dot(8, 4, 1.8, 1.7, 'sq');
  g.dot(8, -2, 1.8, 1.7, 'sq');
  g.cyl(0, 0, 3.6, 4.8, 5, 'violet');
  g.cyl(0, 0, 3.6, 5.1, 10, 'glass');
  g.arc(0, 0, 7, 5.12, front - 0.15, front + 0.15, 'ln', 2);
  g.arc(0, 0, 9.5, 5.12, front - 0.15, front + 0.15, 'ln', 2);
}

function centrifuge(g) {
  g.box(-9, -9, 0, 18, 18, 7, 'white');
  g.poly([[9, -5, 2], [9, 5, 2], [9, 5, 4.5], [9, -5, 4.5]], 'scr');
  g.cyl(0, 0, 7, 6.6, 0.4, 'mist');
  g.cyl(0, 0, 7.2, 3.6, 0.6, 'violet');
  g.cyl(0, 0, 7, 6.8, 1.6, 'glass');
}

function spectro(g) {
  g.box(-12, -7, 0, 22, 14, 6, 'white');
  g.box(-10.5, -5, 6, 9, 9, 1.6, 'blue');
  g.poly([[1.5, -4.5, 6], [8, -4.5, 6], [8, 3.5, 6], [1.5, 3.5, 6]], 'scr');
  g.line([[2.5, -1, 6.01], [4, 0.5, 6.01], [5, -2, 6.01], [7, 1.5, 6.01]], 'ln-p');
  g.poly([[10, -5, 1.4], [10, 5, 1.4], [10, 5, 2.4], [10, -5, 2.4]], 'm3');
}

function oven(g) {
  g.box(-8, -7, 0, 16, 14, 16, 'white');
  g.poly([[8, -5.5, 1.6], [8, 5.5, 1.6], [8, 5.5, 12.6], [8, -5.5, 12.6]], 'w2s');
  g.poly([[8, -3.4, 4.6], [8, 3.4, 4.6], [8, 3.4, 10.4], [8, -3.4, 10.4]], 'scr');
  g.line([[8, 4.4, 5], [8, 4.4, 10]], 'ln-b');
  g.poly([[8, -5.5, 13.6], [8, 1, 13.6], [8, 1, 15], [8, -5.5, 15]], 'scr');
  g.dot(8, 3.6, 14.3, 1.4, 'pkf');
}

function bath(g) {
  g.box(-10, -7, 0, 20, 14, 7.5, 'white');
  g.poly([[-8.6, -5.6, 7.5], [8.6, -5.6, 7.5], [8.6, 5.6, 7.5], [-8.6, 5.6, 7.5]], 'water');
  g.line([[-6, -1, 7.5], [-2, 1, 7.5], [2, -1, 7.5], [6, 1, 7.5]], 'ln-w');
  g.poly([[-6, 7, 2], [0, 7, 2], [0, 7, 4.6], [-6, 7, 4.6]], 'scr');
  g.dot(4, 7, 3.3, 1.5, 'pkf');
}

function microscope(g) {
  g.box(-6, -7, 0, 12, 14, 2, 'white');
  g.box(-2.5, -7, 2, 5, 3, 13, 'white');
  g.box(-5, -2, 6, 10, 9, 1, 'mist');
  g.box(-3, 1, 7, 6, 2.6, 0.25, 'violet');
  g.cyl(0, 2.5, 7.4, 1, 2.4, 'glass');
  g.box(-2.2, -4.5, 11.5, 4.4, 8.5, 3, 'white');
  g.cyl(0, 1.5, 14.5, 1.5, 3.4, 'blue');
  g.cyl(0, 1.5, 17.9, 1.1, 2.4, 'white');
}

function beaker(g) {
  g.at(-10, -10);
  g.cyl(0, 0, 0, 3.8, 3.5, 'blue');
  g.cyl(0, 0, 0, 4, 8, 'glass');
  g.at(2, 2);
  g.cyl(0, 0, 0, 6.6, 6.4, 'violet');
  g.cyl(0, 0, 0, 7, 12, 'glass');
  [3, 5, 7, 9].forEach((z, i) => g.arc(0, 0, z, 7.02, front - (i % 2 ? 0.12 : 0.24), front + 0.02, 'ln', 2));
  g.at(0, 0);
}

function flask(g) {
  g.frustum(0, 0, 0, 7.5, 4.8, 5, 'violet');
  g.frustum(0, 0, 0, 8, 2.4, 13, 'glass');
  g.cyl(0, 0, 13, 2.4, 5.5, 'glass');
  g.ring(0, 0, 18.5, 2.9, 'ln');
}

function tubes(g) {
  g.box(-12, -3, 0, 24, 6, 0.9, 'white');
  g.box(-12, -3, 0.9, 1, 6, 7.4, 'white');
  g.box(-12, -3, 8.3, 24, 6, 1, 'white');
  for (let i = 0; i < 5; i++) {
    const x = -8.4 + i * 4.2;
    g.cyl(x, 0, 1, 1.2, 3 + i * 1.4, i % 2 ? 'blue' : 'violet');
    g.cyl(x, 0, 1, 1.35, 13, 'glass');
    g.ring(x, 0, 14, 1.55, 'ln');
  }
  g.box(11, -3, 0.9, 1, 6, 7.4, 'white');
}

function burner(g) {
  g.cyl(0, 0, 0, 4.4, 1.2, 'white');
  g.cyl(0, 0, 1.2, 1, 10, 'blue');
  g.cyl(0, 0, 4, 1.4, 1.4, 'white');
  const [a, b] = g.P(0, 0, 11.2);
  g.raw(`<path class="flame" d="M${f(a)},${f(b - 22)} C${f(a + 7)},${f(b - 10)} ${f(a + 5)},${f(b)} ${f(a)},${f(b)} C${f(a - 5)},${f(b)} ${f(a - 7)},${f(b - 10)} ${f(a)},${f(b - 22)} Z"/>`);
  [0, 2.1, 4.2].forEach((t) => g.line([[7 * Math.cos(t + 0.6), 7 * Math.sin(t + 0.6), 0], [6.2 * Math.cos(t + 0.6), 6.2 * Math.sin(t + 0.6), 16]], 'ln'));
  g.ring(0, 0, 16, 6.4, 'ln');
  g.poly([[-6, -6, 16.1], [6, -6, 16.1], [6, 6, 16.1], [-6, 6, 16.1]], 'gauze');
}

export const OBJECTS = { bottle, jar, drum, jerrycan, sack, kit, balance, meter, stirrer, centrifuge, spectro, oven, bath, microscope, beaker, flask, tubes, burner };

/* ---------- product card art ---------- */

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function productArt(p) {
  const g = iso({ cx: 120, cy: 112, s: 3.5 });
  g.floor(-15, -15, 30, 30, 5);
  const h = hash(p.id);
  const opts = {
    cap: h % 2 ? 'violet' : 'blue',
    liquid: h % 3 === 0 ? 'blue' : 'violet',
    fill: 6 + (h % 5),
    violet: h % 2 === 0,
  };
  (OBJECTS[p.kind] || bottle)(g, opts);
  g.sq(15, -15, 0).sq(-15, 15, 0);
  g.pin(15, 15, 0, 2.6);
  g.plus(26, 26, 4).plus(214, 152, 4);
  return g.svg('0 0 240 178', '', p.name);
}

/* ---------- category icons ---------- */

export function categoryIcon(kind) {
  const g = iso({ cx: 40, cy: 52, s: 1.55 });
  (OBJECTS[kind] || bottle)(g, { cap: 'violet', violet: true });
  g.plus(10, 14, 3.5).plus(70, 66, 3.5);
  return g.svg('0 0 80 80', 'bp--icon');
}

/* ---------- process steps ---------- */

function stepEnquire() {
  const g = iso({ cx: 150, cy: 140, s: 4.2 });
  g.floor(-18, -18, 36, 36, 6);
  g.box(-11, -13, 0, 20, 26, 0.8, 'white');
  g.box(-5, -14.5, 0.8, 8, 3, 1.4, 'blue');
  [-6, -1.5, 3, 7.5].forEach((y, i) => {
    g.poly([[-8, y, 0.81], [-6, y, 0.81], [-6, y + 2, 0.81], [-8, y + 2, 0.81]], i === 1 ? 'v1' : 'chk');
    g.line([[-4, y + 1, 0.81], [i % 2 ? 3 : 6, y + 1, 0.81]], 'ln');
  });
  g.at(14, -2);
  bottle(g, { cap: 'violet' });
  g.at(0, 0);
  g.dim([-11, 15, 0], [9, 15, 0]);
  g.sq(-18, -18, 0).sq(18, -18, 0);
  g.plus(40, 40).plus(262, 218);
  return g.svg('0 0 300 268');
}

function stepSource() {
  const g = iso({ cx: 150, cy: 132, s: 3.6 });
  g.floor(-22, -22, 44, 44, 7.33);
  [[-22, -14], [-14, -22], [22, -6]].forEach(([x, y]) => {
    g.line([[x, y, 0], [x * 0.55, y * 0.55, 0]], 'route');
    g.sq(x, y, 0);
  });
  g.box(-13, -13, 0, 26, 26, 1.2, 'mist');
  const cells = [];
  for (const x of [-7, 0, 7]) for (const y of [-7, 0, 7]) cells.push([x, y]);
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  cells.forEach(([x, y]) => {
    g.at(x, y, 0.42, 1.2);
    if (x === 0 && y === 0) bottle(g, { cap: 'violet' });
    else if ((x + y) % 14 === 0) jar(g, {});
    else bottle(g, { cap: 'blue', liquid: 'blue', fill: 6 });
  });
  g.at(0, 0);
  g.pin(0, 0, 13, 4);
  g.plus(40, 40).plus(262, 220);
  return g.svg('0 0 300 268');
}

function stepVerify() {
  const g = iso({ cx: 150, cy: 150, s: 4.2 });
  g.floor(-18, -18, 36, 36, 6);
  g.poly([[0, -8, 0], [16, -8, 0], [16, -8, 20], [0, -8, 20]], 'w1');
  [16, 13.5, 11, 8.5].forEach((z, i) => g.line([[2.5, -8, z], [i ? 11 : 13.5, -8, z]], i ? 'ln' : 'ln-b'));
  g.text(2.5, -8, 4.4, 'COA', 'tx', 0);
  g.dot(12.5, -8, 4.4, 4.5, 'pk');
  g.line([[11.6, -8, 4.6], [12.4, -8, 3.8], [13.8, -8, 5.6]], 'ln-p');
  g.at(-4, 4);
  bottle(g, { cap: 'blue' });
  g.at(0, 0);
  const [a, b] = g.P(-4, 4, 7);
  g.raw(`<circle class="lens" cx="${f(a + 30)}" cy="${f(b + 8)}" r="22"/><path class="ln-p" d="M${f(a + 45)},${f(b + 24)} l18,18"/>`);
  g.sq(-18, 18, 0).sq(18, 18, 0);
  g.plus(40, 40).plus(262, 220);
  return g.svg('0 0 300 268');
}

function stepPack() {
  const g = iso({ cx: 150, cy: 150, s: 4.2 });
  g.floor(-18, -18, 36, 36, 6);
  const [x0, y0, x1, y1, h] = [-11, -9, 11, 9, 8];
  g.poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], 'm1');
  g.poly([[x0, y0, 0], [x0, y1, 0], [x0, y1, h], [x0, y0, h]], 'm2');
  g.poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, h], [x0, y0, h]], 'm3');
  g.poly([[x0, y0, h], [x0, y1, h], [x0 - 5, y1, h + 6], [x0 - 5, y0, h + 6]], 'w2');
  g.poly([[x0, y0, h], [x1, y0, h], [x1, y0 - 5, h + 6], [x0, y0 - 5, h + 6]], 'w3');
  [[-5, -4], [5, -4], [-5, 4], [5, 4]].forEach(([x, y], i) => {
    g.at(x, y, 0.62);
    bottle(g, { cap: i === 1 ? 'violet' : 'blue', liquid: i === 1 ? 'violet' : 'blue', fill: 7 });
  });
  g.at(0, 0);
  g.poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]], 'w2');
  g.poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h]], 'w3');
  g.poly([[x0 + 3, y1, 2.5], [x0 + 12, y1, 2.5], [x0 + 12, y1, 5.5], [x0 + 3, y1, 5.5]], 'lbl-v');
  g.dim([x1 + 3, y0, 0], [x1 + 3, y1, 0]);
  g.plus(40, 40).plus(262, 220);
  return g.svg('0 0 300 268');
}

function stepDeliver() {
  const g = iso({ cx: 128, cy: 128, s: 3.7 });
  g.floor(-16, -16, 44, 44, 0);
  g.line([[12, 10, 0], [20, 10, 0], [20, 24, 0], [25, 24, 0]], 'route');
  [-11, -1, 9].forEach((y) => g.box(-12, y, 0, 24, 2, 1.4, 'white'));
  g.box(-12, -11, 1.4, 24, 22, 0.8, 'white');
  const cartons = [[-11.5, -10.5], [0.5, -10.5], [-11.5, 0.5], [0.5, 0.5]];
  [2.2, 9.4].forEach((z, layer) => cartons.forEach(([x, y], i) => {
    g.box(x, y, z, 11, 10, 7.2, layer && i === 3 ? 'violet' : (i + layer) % 2 ? 'mist' : 'white');
  }));
  g.line([[0, -10.5, 16.6], [0, 10.5, 16.6]], 'tape');
  g.ring(25, 24, 0, 2.6, 'pk');
  const [a, b] = g.P(25, 24, 0);
  g.raw(`<path class="pinf" d="M${f(a)},${f(b)} c-6,-9 -9,-13 -9,-18 a9,9 0 1 1 18,0 c0,5 -3,9 -9,18z"/><circle cx="${f(a)}" cy="${f(b - 18)}" r="3.4" fill="#fff"/>`);
  g.text(25, 24, 0, 'KSA · UAE', 'tx', 14);
  g.plus(30, 36).plus(270, 226);
  return g.svg('0 0 300 268');
}

export const STEP_ART = { enquire: stepEnquire, source: stepSource, verify: stepVerify, pack: stepPack, deliver: stepDeliver };

/* ---------- service compositions ---------- */

export function serviceArt(kind) {
  const g = iso({ cx: 240, cy: 236, s: 6 });
  g.floor(-24, -24, 48, 48, 8);
  const place = (fn, x, y, k, o) => { g.at(x, y, k); fn(g, o); };
  if (kind === 'chemicals') {
    place(drum, -10, -10, 1);
    place(bottle, 8, -9, 1, { cap: 'violet' });
    place(jar, -9, 9, 1, { violet: true });
    place(bottle, 10, 8, 0.8, { cap: 'blue', liquid: 'blue' });
  } else if (kind === 'equipment') {
    place(spectro, -6, -10, 0.9);
    place(balance, 11, -3, 0.85);
    place(stirrer, -8, 11, 0.8);
  } else if (kind === 'sourcing') {
    g.at(0, 0);
    [[-24, -12], [-12, -24], [24, -10], [-6, 24]].forEach(([x, y]) => { g.line([[x, y, 0], [x * 0.4, y * 0.4, 0]], 'route'); g.sq(x, y, 0, 4.4); });
    place(kit, 0, 0, 1.45);
  } else {
    place(tubes, -8, -8, 0.9);
    place(flask, 9, -6, 0.9);
    place(beaker, 0, 12, 0.8);
  }
  g.at(0, 0);
  g.sq(-24, 24, 0, 4.4).sq(24, 24, 0, 4.4);
  g.plus(56, 60, 7).plus(428, 380, 7);
  return g.svg('0 0 480 400');
}

/* ---------- hero fallback (no WebGL) ---------- */

export function plateFallback() {
  const g = iso({ cx: 300, cy: 230, s: 13 });
  g.box(-7, -4.6, -7, 14, 9.2, 1.6, 'blue');
  for (let x = -5.5; x <= 5.5; x += 1) for (let y = -3.5; y <= 3.5; y += 1) g.ring(x, y, 1.6, 0.36, 'pkf');
  g.box(-7, -4.6, 0, 14, 9.2, 1.6, 'glass');
  return g.svg('0 0 600 420');
}

/* ---------- small UI icons ---------- */

export const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"/></svg>',
};

/* value icons (about page): line drawings in the blueprint style */
export const VALUE_ICON = {
  quality: '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M28 6l17 6v13c0 11-7.4 19.6-17 23-9.6-3.4-17-12-17-23V12z"/><path d="M20.5 28.5l5.5 5.5 10-11"/><path d="M4 6h6M7 3v6M46 50h6M49 47v6" stroke="#9b4dfa"/></svg>',
  dependable: '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="28" cy="29" r="18"/><path d="M28 18v11l7 5"/><path d="M28 7v4M28 47v4M6 29h4M46 29h4" stroke-dasharray="2 2"/><path d="M4 6h6M7 3v6M46 50h6M49 47v6" stroke="#9b4dfa"/></svg>',
  support: '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M9 14h30v20H22l-8 7v-7H9z"/><path d="M39 22h8v18h-4v6l-7-6H24v-6"/><path d="M15 21h18M15 27h12"/><path d="M4 6h6M7 3v6M46 50h6M49 47v6" stroke="#9b4dfa"/></svg>',
  relations: '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="7" y="20" width="18" height="18" rx="9"/><rect x="31" y="20" width="18" height="18" rx="9"/><path d="M19 29h18"/><circle cx="28" cy="29" r="2.4" fill="#9b4dfa" stroke="none"/><path d="M4 6h6M7 3v6M46 50h6M49 47v6" stroke="#9b4dfa"/></svg>',
};

/* ---------- office map tiles ---------- */

export function mapTile({ label, coords }) {
  const dots = [];
  for (let x = 12; x < 600; x += 24) for (let y = 12; y < 200; y += 24) dots.push(`<circle cx="${x}" cy="${y}" r="1" />`);
  return `<svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" class="bp">
    <g fill="#c9d6f5">${dots.join('')}</g>
    <path class="coast" d="M-10 150 C 80 120, 140 160, 220 128 S 360 70, 430 96 S 540 60, 610 40"/>
    <path class="coast coast--2" d="M-10 170 C 90 140, 150 180, 230 150 S 370 92, 440 118 S 548 84, 610 64"/>
    <path class="route" d="M300 104 L300 40 L420 40"/>
    <circle cx="300" cy="104" r="14" class="pk"/><circle cx="300" cy="104" r="5" class="pkf"/>
  </svg><span class="map__lbl">${label}</span><span class="map__xy">${coords}</span>`;
}
