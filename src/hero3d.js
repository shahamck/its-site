// Hero: a 96-well plate in three layers (lid / wells / base) that comes apart
// on load and keeps separating as the visitor scrolls. Glass is drawn as
// translucent faces + blue edge lines so it reads like the blueprint art.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { plateFallback } from './art.js';

const BLUE = 0x1f5fea;
const COLS = 12, ROWS = 8, PITCH = 0.9, R_WELL = 0.36;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 4);

function rrect(w, d, r, path = new THREE.Shape()) {
  const x = -w / 2, y = -d / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + d - r);
  path.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  path.lineTo(x + r, y + d);
  path.quadraticCurveTo(x, y + d, x, y + d - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

// extrude a 2D outline upward (shape XY -> world XZ, depth -> +Y)
function slab(shape, depth, y = 0) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}

function frame(w, d, r, wall, depth, y) {
  const s = rrect(w, d, r);
  s.holes.push(rrect(w - wall * 2, d - wall * 2, Math.max(0.05, r - wall), new THREE.Path()));
  return slab(s, depth, y);
}

function wells(fn) {
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) fn((i - (COLS - 1) / 2) * PITCH, (j - (ROWS - 1) / 2) * PITCH, i, j);
}

function circlesGeometry(r, y, seg = 28) {
  const pts = [];
  wells((x, z) => {
    for (let k = 0; k < seg; k++) {
      const a0 = (k / seg) * Math.PI * 2, a1 = ((k + 1) / seg) * Math.PI * 2;
      pts.push(x + Math.cos(a0) * r, y, z + Math.sin(a0) * r, x + Math.cos(a1) * r, y, z + Math.sin(a1) * r);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function ringTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.strokeStyle = '#9b4dfa';
  x.lineWidth = 5;
  x.beginPath(); x.arc(32, 32, 24, 0, Math.PI * 2); x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initHero(stage) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    stage.insertAdjacentHTML('afterbegin', `<div class="stage-svg">${plateFallback()}</div>`);
    stage.querySelectorAll('.callout').forEach((c) => c.classList.add('is-in'));
    return;
  }
  stage.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ff, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(6, 14, 8);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 300);
  const camDir = new THREE.Vector3(0, 0.66, 1).normalize();

  /* ---------- materials ---------- */
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdce8ff, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.2,
    clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5,
  });
  const glassBlue = glass.clone();
  glassBlue.color.set(0x7ea3ff);
  glassBlue.opacity = 0.34;
  const wellGlass = glass.clone();
  wellGlass.opacity = 0.08;
  const edge = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.75 });
  const edgeSoft = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.3 });
  const liquid = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2,
    emissive: 0x3a0ca8, emissiveIntensity: 0.32, envMapIntensity: 0.9,
  });

  const edges = (geo, mat = edge, angle = 25) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), mat);

  /* ---------- lid ---------- */
  const lid = new THREE.Group();
  {
    const top = slab(rrect(13.4, 9.2, 0.6), 0.16, 0.55);
    const skirt = frame(13.4, 9.2, 0.6, 0.16, 0.55, 0);
    lid.add(new THREE.Mesh(top, glass), new THREE.Mesh(skirt, glass), edges(top), edges(skirt));
    lid.add(new THREE.LineSegments(circlesGeometry(R_WELL + 0.04, 0.72), edgeSoft));
    lid.add(new THREE.LineSegments(circlesGeometry(R_WELL - 0.06, 0.72), edgeSoft));
  }

  /* ---------- well plate ---------- */
  const plate = new THREE.Group();
  const DECK_Y = 1.3, WELL_H = 1.1;
  {
    const deckShape = rrect(12.8, 8.6, 0.5);
    wells((x, z) => deckShape.holes.push(new THREE.Path().absarc(x, -z, R_WELL, 0, Math.PI * 2, true)));
    const deck = slab(deckShape, 0.14, DECK_Y);
    const skirt = frame(12.8, 8.6, 0.5, 0.15, DECK_Y, 0);
    const flange = frame(13.1, 8.9, 0.55, 0.3, 0.26, 0);
    plate.add(new THREE.Mesh(deck, glass), new THREE.Mesh(skirt, glass), new THREE.Mesh(flange, glass));
    plate.add(edges(deck), edges(skirt), edges(flange));

    const tubes = [];
    wells((x, z) => {
      const c = new THREE.CylinderGeometry(R_WELL, R_WELL - 0.05, WELL_H, 22, 1, true);
      c.translate(x, DECK_Y + 0.14 - WELL_H / 2, z);
      tubes.push(c);
    });
    plate.add(new THREE.Mesh(mergeGeometries(tubes), wellGlass));
    plate.add(new THREE.LineSegments(circlesGeometry(R_WELL - 0.05, DECK_Y + 0.14 - WELL_H), edgeSoft));

    const liq = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.29, 0.27, 1, 22), liquid, COLS * ROWS);
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    const a = new THREE.Color(0x9b4dfa), b = new THREE.Color(0x5a1fd6), c2 = new THREE.Color(0xc77dff);
    let n = 0;
    wells((x, z, i, j) => {
      const level = 0.42 + 0.38 * (0.5 + 0.5 * Math.sin(i * 0.9 + j * 1.7));
      const base = DECK_Y + 0.14 - WELL_H + 0.05;
      m.makeScale(1, level, 1).setPosition(x, base + level / 2, z);
      liq.setMatrixAt(n, m);
      col.copy(a).lerp(b, i / (COLS - 1)).lerp(c2, ((i * 7 + j * 3) % 11 === 0) ? 0.7 : 0);
      liq.setColorAt(n, col);
      n++;
    });
    plate.add(liq);
  }

  /* ---------- base tray ---------- */
  const base = new THREE.Group();
  {
    const floor = slab(rrect(13.8, 9.6, 0.65), 0.42, 0);
    const rim = frame(13.8, 9.6, 0.65, 0.34, 0.5, 0.42);
    base.add(new THREE.Mesh(floor, glassBlue), new THREE.Mesh(rim, glassBlue), edges(floor), edges(rim));
    const pads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.75 }), COLS * ROWS);
    const m = new THREE.Matrix4();
    let n = 0;
    wells((x, z) => { pads.setMatrixAt(n++, m.makeTranslation(x, 0.45, z)); });
    base.add(pads);
    base.add(new THREE.LineSegments(circlesGeometry(R_WELL, 0.45), edgeSoft));
  }

  const stack = new THREE.Group();
  stack.add(base, plate, lid);
  scene.add(stack);

  /* ---------- blueprint guides (don't explode) ---------- */
  const guides = new THREE.Group();
  {
    const dashed = new THREE.LineDashedMaterial({ color: BLUE, dashSize: 0.18, gapSize: 0.22, transparent: true, opacity: 0.4 });
    const faint = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.12 });
    const line = (pts, mat) => {
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))), mat);
      l.computeLineDistances();
      guides.add(l);
    };
    [[-7.4, -5], [7.4, -5], [7.4, 5], [-7.4, 5]].forEach(([x, z], i) => line([[x, i % 2 ? -7 : -9, z], [x, i % 2 ? 9 : 7, z]], dashed));
    line([[-16, 0.7, 0], [16, 0.7, 0]], faint);
    line([[0, 0.7, -12], [0, 0.7, 12]], faint);
    line([[-12, -6, 6.5], [12, -6, 6.5]], faint);
    const sq = new THREE.SpriteMaterial({ color: BLUE, sizeAttenuation: true });
    [[-7.4, 3.6, -5], [7.4, -2.4, 5], [-7.4, -4.8, 5], [7.4, 6.2, -5], [0, 0.7, 12]].forEach((p) => {
      const s = new THREE.Sprite(sq);
      s.position.set(...p);
      s.scale.setScalar(0.24);
      guides.add(s);
    });
    const ring = new THREE.SpriteMaterial({ map: ringTexture(), transparent: true, depthWrite: false });
    [[3.2, 5.6, -4.2], [-8.8, 0.6, 3.2], [8.4, -3.8, 2], [-3, -6.6, 6.5]].forEach((p) => {
      const s = new THREE.Sprite(ring);
      s.position.set(...p);
      s.scale.setScalar(0.5);
      guides.add(s);
    });
  }
  stack.add(guides);

  /* ---------- callout leaders ---------- */
  const svg = stage.querySelector('svg.leaders');
  const callouts = [...stage.querySelectorAll('.callout')];
  const anchors = [
    { layer: lid, p: new THREE.Vector3(-3.6, 0.72, -2.2) },
    { layer: plate, p: new THREE.Vector3(6.4, DECK_Y, 2.4) },
    { layer: base, p: new THREE.Vector3(-6.9, 0.5, 2.8) },
  ];
  const paths = callouts.map(() => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = '<path/><circle r="2.6"/><rect width="5" height="5" fill="#1f5fea"/>';
    svg.append(g);
    return g;
  });
  let labelPts = [];
  const measure = () => {
    const sr = stage.getBoundingClientRect();
    labelPts = callouts.map((c) => {
      const r = c.querySelector('.mono').getBoundingClientRect();
      const right = c.classList.contains('callout--r');
      return { x: (right ? r.left - 12 : r.right + 12) - sr.left, y: r.top + r.height / 2 - sr.top, right };
    });
  };

  /* ---------- sizing ---------- */
  let W = 1, H = 1;
  const resize = () => {
    W = stage.clientWidth; H = stage.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const fit = clamp(camera.aspect / 1.75, 0.55, 1);
    camera.position.copy(camDir).multiplyScalar(42 / fit);
    camera.lookAt(0, -0.4, 0);
    camera.updateProjectionMatrix();
    measure();
  };
  new ResizeObserver(resize).observe(stage);
  resize();
  document.fonts?.ready.then(measure);

  /* ---------- motion ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    pointer.tx = (e.clientX - r.left) / r.width - 0.5;
    pointer.ty = (e.clientY - r.top) / r.height - 0.5;
  });
  stage.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0; });

  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
  setTimeout(() => callouts.forEach((c, i) => setTimeout(() => c.classList.add('is-in'), i * 160)), reduced ? 0 : 1100);

  const v = new THREE.Vector3();
  const frameFn = (now) => {
    requestAnimationFrame(frameFn);
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    const intro = reduced ? 1 : ease(clamp((t - 0.15) / 1.8, 0, 1));
    const r = stage.getBoundingClientRect();
    const scroll = clamp(1 - (r.top + r.height * 0.55) / innerHeight, 0, 1);
    const e = intro * 0.6 + scroll * 0.55;

    lid.position.y = 1.55 + e * 3.4;
    base.position.y = -0.95 - e * 3.1;
    stack.position.y = 0.2 - (1 - intro) * 1.2;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    stack.rotation.y = -0.36 + scroll * 0.22 + pointer.x * 0.12 + (reduced ? 0 : Math.sin(t * 0.35) * 0.025);
    stack.rotation.x = pointer.y * 0.05;

    renderer.render(scene, camera);

    anchors.forEach((a, i) => {
      if (!labelPts[i]) return;
      v.copy(a.p);
      a.layer.localToWorld(v);
      v.project(camera);
      const ax = (v.x * 0.5 + 0.5) * W, ay = (-v.y * 0.5 + 0.5) * H;
      const L = labelPts[i];
      const ex = L.right ? Math.max(ax + 40, L.x - 60) : Math.min(ax - 40, L.x + 160);
      const g = paths[i];
      g.children[0].setAttribute('d', `M${L.x.toFixed(1)},${L.y.toFixed(1)} H${ex.toFixed(1)} L${ax.toFixed(1)},${ay.toFixed(1)}`);
      g.children[1].setAttribute('cx', L.x.toFixed(1));
      g.children[1].setAttribute('cy', L.y.toFixed(1));
      g.children[2].setAttribute('x', (ax - 2.5).toFixed(1));
      g.children[2].setAttribute('y', (ay - 2.5).toFixed(1));
      g.style.opacity = callouts[i].classList.contains('is-in') ? 1 : 0;
    });
  };
  requestAnimationFrame(frameFn);
}
