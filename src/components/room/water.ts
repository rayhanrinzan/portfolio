// Watering the plant. By day a watering can sits on the table (it pops in
// when the lamp is switched off, and out again at night; it is never there
// at load). Hover the plant and the room dims around the two of them with a
// hint; drag the can over the plant, or just click it, and it pours: the sun
// sends a beam through the window and the plant grows a little.
import { gsap, motionOK, root, stage } from './motion';
import { burst } from './pop';

const SVG = 'http://www.w3.org/2000/svg';
const can = stage.querySelector<HTMLButtonElement>('.obj-can');
const plant = stage.querySelector<HTMLElement>('.obj-plant');
const leaves = plant?.querySelector<SVGSVGElement>('.leaves') ?? null;
const sprouts = Array.from(plant?.querySelectorAll<SVGGElement>('.sprout') ?? []);
const pane = stage.querySelector<HTMLElement>('.obj-window');

/** Where the rose (the spout's head) sits in the can's box, from its centre. */
const ROSE = { x: -0.425, y: -0.23 };
const TILT = 32;
/** The leaves stop getting bigger after this many waterings. */
const FULL = 3;

let busy = false;
let watered = false;
let grown = 0;
let pending: gsap.core.Tween | null = null;
let run: gsap.core.Timeline | null = null;
let hintTimer = 0;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** An element's place on the stage, in the stage's own pixels. */
const box = (el: HTMLElement): Box => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });

function overlay(name: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', `fx fx-${name}`);
  svg.setAttribute('viewBox', `0 0 ${stage.offsetWidth} ${stage.offsetHeight}`);
  svg.setAttribute('aria-hidden', 'true');
  stage.append(svg);
  return svg;
}

function add(svg: SVGSVGElement, tag: 'path' | 'polygon', attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  svg.append(el);
  return el;
}

function clearFx(): void {
  stage.querySelectorAll('.fx').forEach((fx) => {
    gsap.killTweensOf(fx.children);
    fx.remove();
  });
}

function hint(on: boolean): void {
  window.clearTimeout(hintTimer);
  if (on) root.dataset.hint = '';
  else delete root.dataset.hint;
}

/* ---- the can comes and goes with the daylight ---- */

function showCan(): void {
  if (!can || 'can' in root.dataset || root.dataset.sky === 'night') return;
  root.dataset.can = '';
  gsap.fromTo(can, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(2.6)', clearProps: 'transform,opacity' });
  burst(can, 0);
}

function hideCan(): void {
  pending?.kill();
  hint(false);
  if (!can || !('can' in root.dataset)) return;
  run?.kill();
  clearFx();
  busy = false;
  delete root.dataset.watering;
  gsap.killTweensOf(can);
  gsap.to(can, {
    scale: 0.3,
    opacity: 0,
    duration: 0.18,
    ease: 'back.in(2)',
    onComplete() {
      delete root.dataset.can;
      gsap.set(can, { clearProps: 'all' });
    },
  });
}

/* ---- the pieces of the watering ---- */

/** Sunlight from the window to the plant: one flat beam and three drawn rays. */
function sunbeam(p: Box): void {
  if (!pane) return;
  const w = box(pane);
  const from = { x: w.x + w.w * 0.5, y: w.y + w.h * 0.55 };
  const to = { x: p.x + p.w / 2, y: p.y + p.h * 0.32 };
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  // unit vector across the beam
  const nx = -(to.y - from.y) / length;
  const ny = (to.x - from.x) / length;
  const wide = w.w * 0.15;
  const narrow = p.w * 0.85;
  const at = (o: { x: number; y: number }, k: number): string => `${(o.x + nx * k).toFixed(1)},${(o.y + ny * k).toFixed(1)}`;

  const svg = overlay('beam');
  const beam = add(svg, 'polygon', { points: `${at(from, wide)} ${at(from, -wide)} ${at(to, -narrow)} ${at(to, narrow)}` });
  const rays = [-0.6, 0, 0.6].map((k) => add(svg, 'path', { d: `M${at(from, wide * k)} L${at(to, narrow * k)}` }));
  gsap
    .timeline({ onComplete: () => svg.remove() })
    .fromTo(beam, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0)
    .fromTo(rays, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.5, ease: 'power2.out', stagger: 0.08 }, 0.05)
    .to(rays, { drawSVG: '100% 100%', duration: 0.5, ease: 'power2.in', stagger: 0.08 }, 1.3)
    .to(beam, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 1.5);

  // the sun itself swells while it shines
  const sun = Array.from(stage.querySelectorAll('.obj-window .sun')).find((el) => el.getBoundingClientRect().width > 0);
  if (sun) gsap.fromTo(sun, { scale: 1 }, { scale: 1.2, transformOrigin: '50% 50%', duration: 0.4, ease: 'sine.inOut', yoyo: true, repeat: 3 });
}

/** Water from the rose down onto the leaves: short dashes running along arcs. */
function shower(rose: { x: number; y: number }, p: Box): void {
  const svg = overlay('water');
  for (let i = 0; i < 6; i++) {
    const endX = p.x + p.w * (0.2 + 0.12 * i);
    const endY = p.y + p.h * gsap.utils.random(0.14, 0.3);
    const d = `M${rose.x.toFixed(1)},${rose.y.toFixed(1)} Q${(endX + (rose.x - endX) * 0.35).toFixed(1)},${(rose.y + 4).toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
    const stream = add(svg, 'path', { d });
    gsap.fromTo(
      stream,
      { drawSVG: '0% 0%' },
      {
        keyframes: [
          { drawSVG: '0% 38%', duration: 0.15, ease: 'none' },
          { drawSVG: '62% 100%', duration: 0.22, ease: 'none' },
          { drawSVG: '100% 100%', duration: 0.1, ease: 'none' },
        ],
        repeat: 2,
        delay: i * 0.06 + Math.random() * 0.05,
      },
    );
  }
  gsap.delayedCall(1.9, () => svg.remove());
}

function grow(): void {
  if (!leaves) return;
  grown++;
  const sprout = sprouts[grown - 1];
  if (sprout) {
    sprout.style.display = 'inline';
    // grows out of the pot's rim (246,660 in the drawing); the transform is
    // written by hand because the leaf has only just been given a box
    const size = { k: 0 };
    const apply = (): void => sprout.setAttribute('transform', `translate(246 660) scale(${size.k.toFixed(3)}) translate(-246 -660)`);
    apply();
    gsap.to(size, { k: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)', onUpdate: apply });
  }
  const size = 1 + 0.09 * Math.min(grown, FULL);
  gsap
    .timeline({ defaults: { transformOrigin: '49% 58%' } })
    // drinks: a little squash, then up
    .to(leaves, { scaleY: size * 0.94, scaleX: size * 1.04, duration: 0.14, ease: 'power1.out' })
    .to(leaves, { scaleX: size, scaleY: size, duration: 1, ease: 'elastic.out(1.2, 0.35)' });
}

/** The whole thing: the can goes to the plant, pours, and goes home. */
function water(): void {
  if (!can || !plant || busy || !('can' in root.dataset)) return;
  busy = true;
  watered = true;
  hint(false);
  root.dataset.watering = '';

  const c = box(can);
  const p = box(plant);
  // pour from the right of the plant, or from the left (mirrored) when the
  // plant stands at the right edge, as it does in the portrait room
  const side = p.x + p.w / 2 + c.w * 1.12 > stage.offsetWidth ? -1 : 1;
  const centre = { x: p.x + p.w / 2 + side * c.w * 0.62, y: p.y - c.h * 0.5 };
  const angle = (-TILT * side * Math.PI) / 180;
  const ox = ROSE.x * c.w * side;
  const oy = ROSE.y * c.h;
  const rose = {
    x: centre.x + ox * Math.cos(angle) - oy * Math.sin(angle),
    y: centre.y + ox * Math.sin(angle) + oy * Math.cos(angle),
  };

  gsap.killTweensOf(can);
  run = gsap
    .timeline({
      onComplete() {
        busy = false;
        delete root.dataset.watering;
        gsap.set(can, { clearProps: 'transform' });
      },
    })
    .to(can, { x: centre.x - (c.x + c.w / 2), y: centre.y - (c.y + c.h / 2), scaleX: side, duration: 0.5, ease: 'power2.inOut' })
    .to(can, { rotation: -TILT * side, duration: 0.25, ease: 'back.out(2)' })
    .call(() => shower(rose, p))
    .call(() => sunbeam(p), [], '+=0.25')
    .call(grow, [], '+=0.6')
    // a small shake of the can while it pours
    .to(can, { rotation: (-TILT - 5) * side, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: 3 }, '<-0.7')
    .to(can, { rotation: 0, duration: 0.25, ease: 'power2.out' }, '+=0.75')
    .to(can, { x: 0, y: 0, duration: 0.55, ease: 'power2.inOut' })
    .set(can, { scaleX: 1 });
}

/* ---- wiring ---- */

export function initWater(): void {
  if (!can || !plant) return;

  document.addEventListener('room:sky', (e) => {
    const sky = (e as CustomEvent<string>).detail;
    pending?.kill();
    if (sky === 'night') hideCan();
    // after the sky has finished changing
    else pending = gsap.delayedCall(0.5, showCan);
  });

  // the hint: only until the plant has been watered once
  plant.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || watered || busy || !motionOK() || !('can' in root.dataset)) return;
    hintTimer = window.setTimeout(() => hint(true), 140);
  });
  plant.addEventListener('pointerleave', () => hint(false));

  // drag the can; over the plant it takes over and pours
  let down = false;
  let dragged = false;
  let start = { x: 0, y: 0 };
  can.addEventListener('pointerdown', (e) => {
    if (busy) return;
    down = true;
    dragged = false;
    start = { x: e.clientX, y: e.clientY };
    can.setPointerCapture(e.pointerId);
    gsap.killTweensOf(can);
  });
  can.addEventListener('pointermove', (e) => {
    if (!down || busy) return;
    // the stage may be shrunk beside an open page; work in its own pixels
    const k = stage.offsetWidth / stage.getBoundingClientRect().width;
    const dx = (e.clientX - start.x) * k;
    const dy = (e.clientY - start.y) * k;
    if (Math.hypot(dx, dy) > 5) dragged = true;
    if (!dragged) return;
    gsap.set(can, { x: dx, y: dy });
    const c = box(can);
    const p = box(plant);
    const cx = c.x + c.w / 2 + dx;
    const cy = c.y + c.h / 2 + dy;
    if (Math.abs(cx - (p.x + p.w / 2)) < p.w * 1.1 && cy > p.y - c.h * 1.3 && cy < p.y + p.h) {
      down = false;
      water();
    }
  });
  const up = (): void => {
    if (down && dragged && !busy) gsap.to(can, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)', clearProps: 'transform' });
    down = false;
  };
  can.addEventListener('pointerup', up);
  can.addEventListener('pointercancel', up);
  // a plain click, tap or Enter waters without any dragging
  can.addEventListener('click', () => {
    if (dragged) {
      dragged = false;
      return;
    }
    water();
  });
}
