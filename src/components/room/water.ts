// Watering the plant. By day a watering can sits on the table (it pops in
// when the lamp is switched off, and out again at night; it is never there
// at load). Hover the plant and the room dims around the two of them with a
// hint; drag the can over the plant, or just click it, and it pours: the sun
// moves to the middle of the window, lights up and sends shafts of light to
// the plant, which grows a little.
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
/** How big the leaves are after 0, 1, 2 and 3 waterings (--grow in room.css):
    a sprout to begin with, full grown after three. */
const SIZES = [0.38, 0.6, 0.82, 1];

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

function add(svg: SVGSVGElement, tag: 'path' | 'polygon' | 'ellipse', attrs: Record<string, string>): SVGElement {
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
  restSun();
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

/** Scale (and turn) an SVG element about a point given in its own units. The
    transform is written out by hand: it has to be exact for shapes that were
    created a moment ago. */
function about(el: Element, cx: number, cy: number, k: number, turn = 0): void {
  el.setAttribute('transform', `translate(${cx} ${cy}) rotate(${turn.toFixed(2)}) scale(${k.toFixed(4)}) translate(${-cx} ${-cy})`);
}

/** A tween of that scale and turn, for dropping into a timeline. */
function tweenAbout(el: Element, cx: number, cy: number, state: { k: number; turn: number }, to: gsap.TweenVars): gsap.core.Tween {
  about(el, cx, cy, state.k, state.turn);
  return gsap.to(state, { ...to, onUpdate: () => about(el, cx, cy, state.k, state.turn) });
}

/** The visible sun in the room's window, and the corona drawn behind it. */
const sunNow = (): Element | undefined =>
  Array.from(stage.querySelectorAll('.obj-window .sun')).find((el) => el.getBoundingClientRect().width > 0);
const halo = stage.querySelector('.obj-window .halo');
/** The middle of the pane, in the window drawing's own units. */
const NOON = { x: 675, y: 265 };

function restSun(): void {
  const suns = stage.querySelectorAll('.obj-window .sun');
  gsap.killTweensOf([suns, halo]);
  gsap.set(suns, { clearProps: 'transform' });
  if (halo) {
    gsap.set(halo, { clearProps: 'all' });
    halo.querySelectorAll('.halo-disc, .halo-rays').forEach((el) => el.removeAttribute('transform'));
  }
}

/** The sun's part: it slides to the middle of the window, lights up behind a
    corona, pours light onto the plant, and goes back. Starts as the can sets
    off, so the light arrives with the water. */
function sunlight(p: Box): void {
  const sun = sunNow();
  if (!pane || !sun) return;
  const w = box(pane);
  // the pane's centre is the drawing's (675,265) in a 498 x 366 box from (426,90)
  const from = { x: w.x + w.w * 0.5, y: w.y + w.h * 0.478 };
  const to = { x: p.x + p.w / 2, y: p.y + p.h * 0.45 };
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const nx = -(to.y - from.y) / length;
  const ny = (to.x - from.x) / length;
  const pt = (o: { x: number; y: number }, k: number): string => `${(o.x + nx * k).toFixed(1)},${(o.y + ny * k).toFixed(1)}`;

  const svg = overlay('beam');
  // light pooling on the table under the pot
  const pool = add(svg, 'ellipse', {
    cx: (p.x + p.w / 2).toFixed(1),
    cy: (p.y + p.h * 0.97).toFixed(1),
    rx: (p.w * 0.95).toFixed(1),
    ry: (p.w * 0.2).toFixed(1),
    'fill-opacity': '0.3',
  });
  // three shafts fanning out from the sun; where they overlap the light is stronger
  const start = w.w * 0.035;
  const shafts = [
    { off: -0.55, wide: 0.3, alpha: 0.16 },
    { off: 0.5, wide: 0.26, alpha: 0.16 },
    { off: 0, wide: 0.42, alpha: 0.22 },
  ].map(({ off, wide, alpha }) =>
    add(svg, 'polygon', {
      points: `${pt(from, start)} ${pt(from, -start)} ${pt(to, (off - wide) * p.w)} ${pt(to, (off + wide) * p.w)}`,
      'fill-opacity': String(alpha),
    }),
  );
  // pulses of light running down the shafts
  const pulses = [-0.7, -0.35, 0, 0.35, 0.7].map((k) => add(svg, 'path', { d: `M${pt(from, start * k)} L${pt(to, p.w * 0.6 * k)}` }));

  // four-point glints where the light lands, in front of the leaves
  const glints = overlay('spark');
  const stars = Array.from({ length: 7 }, () => {
    const x = p.x + p.w * gsap.utils.random(-0.15, 1.15);
    const y = p.y + p.h * gsap.utils.random(-0.08, 0.5);
    const r = p.w * gsap.utils.random(0.08, 0.15);
    const q = r * 0.2;
    return add(glints, 'path', {
      d: `M${x},${y - r} Q${x + q},${y - q} ${x + r},${y} Q${x + q},${y + q} ${x},${y + r} Q${x - q},${y + q} ${x - r},${y} Q${x - q},${y - q} ${x},${y - r} z`,
    });
  });

  const dx = NOON.x - Number(sun.getAttribute('cx'));
  const dy = NOON.y - Number(sun.getAttribute('cy'));
  const discs = Array.from(halo?.querySelectorAll('.halo-disc') ?? []);
  const corona = halo?.querySelector('.halo-rays') ?? null;
  const LIT = 0.75; // when the light leaves the sun
  const DONE = 2.7; // when it lets go

  gsap.set([shafts, pool], { opacity: 0 });
  const tl = gsap
    .timeline({
      onComplete() {
        svg.remove();
        glints.remove();
        restSun();
      },
    })
    // the sun climbs to the middle of the window and lights up
    .to(sun, { x: dx, y: dy, duration: 0.65, ease: 'power2.inOut' }, 0)
    .to(sun, { scale: 1.25, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, 0.55)
    .to(halo, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.5);
  discs.forEach((disc, i) => {
    const state = { k: 0.3, turn: 0 };
    tl.add(tweenAbout(disc, NOON.x, NOON.y, state, { k: 1, duration: 0.5, ease: 'back.out(2)' }), 0.5 + i * 0.08);
    // breathing
    tl.add(tweenAbout(disc, NOON.x, NOON.y, state, { k: 1.08, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 3 }), 1.1 + i * 0.12);
  });
  if (corona) {
    tl.add(tweenAbout(corona, NOON.x, NOON.y, { k: 0.6, turn: -20 }, { k: 1, turn: 55, duration: DONE - 0.5, ease: 'power1.out' }), 0.5);
  }
  // the light shoots out to the plant
  tl.set(shafts, { opacity: 1 }, LIT);
  shafts.forEach((shaft, i) => {
    tl.add(tweenAbout(shaft, from.x, from.y, { k: 0, turn: 0 }, { k: 1, duration: 0.45, ease: 'power3.out' }), LIT + i * 0.07);
  });
  tl
    .to(pool, { opacity: 1, duration: 0.35 }, LIT + 0.3)
    .to(shafts, { opacity: 0.6, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: 0.11 }, LIT + 0.55)
    .fromTo(
      pulses,
      { drawSVG: '0% 0%' },
      {
        keyframes: [
          { drawSVG: '0% 16%', duration: 0.12, ease: 'none' },
          { drawSVG: '84% 100%', duration: 0.34, ease: 'none' },
          { drawSVG: '100% 100%', duration: 0.08, ease: 'none' },
        ],
        repeat: 2,
        stagger: { each: 0.09, from: 'center' },
      },
      LIT + 0.1,
    )
    .fromTo(
      stars,
      { scale: 0, rotation: -40, transformOrigin: '50% 50%' },
      { scale: 1, rotation: 20, duration: 0.28, ease: 'back.out(3)', yoyo: true, repeat: 1, stagger: { each: 0.16, from: 'random' } },
      LIT + 0.4,
    )
    // and lets go: light fades, the sun goes back to where it was
    .to([shafts, pool], { opacity: 0, duration: 0.45, ease: 'power1.in' }, DONE)
    .to(halo, { opacity: 0, duration: 0.4 }, DONE)
    .to(sun, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power2.inOut' }, DONE + 0.1);
}

/** Water from the rose down onto the leaves: short dashes running along arcs. */
function shower(rose: { x: number; y: number }, p: Box): void {
  const svg = overlay('water');
  // the top of the leaves, which is lower while the plant is small
  const top = 0.58 - 0.44 * SIZES[Math.min(grown, SIZES.length - 1)]!;
  for (let i = 0; i < 6; i++) {
    const endX = p.x + p.w * (0.5 + (i - 2.5) * 0.12 * Math.max(0.5, 1.4 - top * 2));
    const endY = p.y + p.h * (top + gsap.utils.random(0, 0.12));
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
  const before = SIZES[Math.min(grown, SIZES.length - 1)]!;
  grown++;
  const after = SIZES[Math.min(grown, SIZES.length - 1)]!;
  // the last two waterings each add a leaf
  const sprout = sprouts[grown - 2];
  if (sprout) {
    sprout.style.display = 'inline';
    // grows out of the pot's rim (246,660 in the drawing); the transform is
    // written by hand because the leaf has only just been given a box
    const size = { k: 0 };
    const apply = (): void => sprout.setAttribute('transform', `translate(246 660) scale(${size.k.toFixed(3)}) translate(-246 -660)`);
    apply();
    gsap.to(size, { k: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)', onUpdate: apply });
  }
  const size = { k: before };
  gsap
    .timeline({ defaults: { transformOrigin: '49% 58%' } })
    // drinks: a little squash, then up
    .to(leaves, { scaleY: 0.92, scaleX: 1.06, duration: 0.14, ease: 'power1.out' })
    .to(leaves, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'back.out(3)' })
    .to(size, { k: after, duration: 1.1, ease: 'elastic.out(1.1, 0.4)', onUpdate: () => leaves.style.setProperty('--grow', size.k.toFixed(3)) }, 0.14);
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
    .call(() => sunlight(p), [], 0)
    .to(can, { x: centre.x - (c.x + c.w / 2), y: centre.y - (c.y + c.h / 2), scaleX: side, duration: 0.5, ease: 'power2.inOut' })
    .to(can, { rotation: -TILT * side, duration: 0.25, ease: 'back.out(2)' })
    .call(() => shower(rose, p))
    .call(grow, [], '+=0.85')
    // a small shake of the can while it pours
    .to(can, { rotation: (-TILT - 5) * side, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: 3 }, '<-0.7')
    .to(can, { rotation: 0, duration: 0.25, ease: 'power2.out' }, '+=0.75')
    .to(can, { x: 0, y: 0, duration: 0.55, ease: 'power2.inOut' })
    .set(can, { scaleX: 1 })
    // stay busy until the sun is back in its place
    .to({}, { duration: 0.5 });
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
