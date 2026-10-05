// Everything in the room that answers back: the reaction each object gives
// when it opens, the breeze a fast pointer makes, the row of books, the
// envelope, the lamp you can swing and the clouds you can push. All of it is
// play on top of the buttons; none of it is needed to reach any content.
import { gsap, motionOK, rand, root, stage, svgPoint } from './motion';

const all = <T extends Element>(selector: string): T[] => Array.from(stage.querySelectorAll<T>(selector));
const one = <T extends Element>(selector: string): T | null => stage.querySelector<T>(selector);

const notes = all<SVGGElement>('.note');
const steam = all<SVGPathElement>('.steam');
const leaves = one<SVGSVGElement>('.leaves');
const lamp = one<HTMLButtonElement>('.obj-lamp');
const glows = all<HTMLElement>('.obj-glow');
const envelope = one<SVGGElement>('.env');
const flap = one<SVGPolylineElement>('.flap');
const letter = one<SVGRectElement>('.letter');
const phone = one<SVGGElement>('.phone');
const ping = one<SVGCircleElement>('.ping');
const tilt = one<SVGGElement>('.book.tilt');
const sky = one<SVGSVGElement>('.obj-window .sky');
const shoot = one<SVGPathElement>('.obj-window .shoot');
const keys = all<SVGLineElement>('.key');

const visibleClouds = (): SVGGElement[] => all<SVGGElement>('.cloud-d').filter((c) => c.getBoundingClientRect().width > 0);

/* ---- small moves, reused by reactions, the breeze and idle time ---- */

function swingNote(note: SVGGElement, degrees: number): void {
  gsap.killTweensOf(note);
  gsap
    .timeline({ defaults: { svgOrigin: note.dataset.pin ?? '0 0' } })
    .to(note, { rotation: degrees, duration: 0.16, ease: 'power2.out' })
    .to(note, { rotation: 0, duration: 1.1, ease: 'elastic.out(1.2, 0.3)' });
}

function puffSteam(): void {
  gsap.fromTo(
    steam,
    { scaleY: 1, scaleX: 1 },
    { scaleY: 1.6, scaleX: 1.25, transformOrigin: '50% 100%', duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3 },
  );
}

function bendSteam(dir: number): void {
  gsap
    .timeline({ defaults: { transformOrigin: '50% 100%', overwrite: 'auto' } })
    .to(steam, { skewX: -22 * dir, duration: 0.2, ease: 'power2.out' })
    .to(steam, { skewX: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)' });
}

function leanPlant(dir: number): void {
  if (!leaves) return;
  gsap
    .timeline({ defaults: { transformOrigin: '49% 58%', overwrite: 'auto' } })
    .to(leaves, { skewX: -7 * dir, duration: 0.2, ease: 'power2.out' })
    .to(leaves, { skewX: 0, duration: 1.4, ease: 'elastic.out(1.1, 0.3)' });
}

function buzzPhone(): void {
  if (!phone) return;
  gsap.fromTo(phone, { x: -1.5 }, { x: 1.5, duration: 0.04, repeat: 11, yoyo: true, ease: 'none', onComplete: () => void gsap.set(phone, { x: 0 }) });
  if (ping) gsap.fromTo(ping, { opacity: 1 }, { opacity: 0, duration: 0.4, delay: 2 });
}

function hopEnvelope(): void {
  if (!envelope) return;
  gsap
    .timeline()
    .to(envelope, { y: -12, rotation: -4, svgOrigin: '1185 732', duration: 0.14, ease: 'power2.out' })
    .to(envelope, { y: 0, rotation: 0, duration: 0.4, ease: 'bounce.out' });
}

function openEnvelope(openIt: boolean): void {
  if (!flap || !letter || !motionOK()) return;
  gsap.to(flap, { attr: { points: openIt ? '1120,693 1185,654 1250,693' : '1120,693 1185,740 1250,693' }, duration: 0.25, ease: 'power2.out', overwrite: true });
  gsap.to(letter, { y: openIt ? -26 : 0, duration: 0.3, delay: openIt ? 0.1 : 0, ease: 'power2.out', overwrite: true });
}

function tipBook(): void {
  if (!tilt) return;
  gsap.killTweensOf(tilt, 'rotation');
  gsap
    .timeline({ defaults: { svgOrigin: '1286 250' } })
    // tips away from the row, about its outer foot, and rocks back upright
    .to(tilt, { rotation: 14, duration: 0.2, ease: 'power2.inOut' })
    .to(tilt, { rotation: 0, duration: 0.5, ease: 'bounce.out' });
}

function scootClouds(): void {
  visibleClouds().forEach((cloud, i) => {
    gsap.to(cloud, { x: `+=${i % 2 ? -26 : 26}`, duration: 0.5, ease: 'power2.out' });
  });
}

/** Draw a shooting star between two points of the window, in its own units. */
export function shootStar(x1 = rand(470, 620), y1 = rand(110, 180), x2 = x1 + rand(140, 220), y2 = y1 + rand(60, 110)): void {
  if (!shoot) return;
  shoot.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
  gsap
    .timeline()
    .set(shoot, { opacity: 1, drawSVG: '0% 0%' })
    .to(shoot, { drawSVG: '0% 70%', duration: 0.22, ease: 'power1.in' })
    .to(shoot, { drawSVG: '100% 100%', duration: 0.3, ease: 'power1.out' })
    .set(shoot, { opacity: 0 });
}

function typeKeys(): void {
  gsap.fromTo(gsap.utils.shuffle(keys.slice()), { y: 0 }, { y: 1.8, duration: 0.06, yoyo: true, repeat: 1, stagger: 0.07 });
}

/* ---- the lamp: swings like a pendulum from far up its cord ---- */

/** Distance from the lamp to the point it hangs from, in lamp heights. */
const CORD = 8.9;
const swing = { angle: 0 };
let lampDragged = false;

/** Where the shade sits along the top edge of each light drawing. */
const glowOrigin = (_i: number, el: Element): string => (el.closest('.obj-glow-land') ? '48.4% 0%' : '82.75% 0%');

function applySwing(): void {
  if (!lamp) return;
  const length = lamp.offsetHeight * CORD;
  gsap.set(lamp, { rotation: swing.angle, transformOrigin: `50% ${-CORD * 100}%` });
  // the light on the table follows the shade
  const shift = Math.sin((swing.angle * Math.PI) / 180) * -length;
  gsap.set(glows, { x: shift, rotation: swing.angle * 1.4, transformOrigin: glowOrigin });
}

function settleLamp(): void {
  gsap.to(swing, { angle: 0, duration: 3, ease: 'elastic.out(1.1, 0.2)', onUpdate: applySwing, overwrite: true });
}

export function swingLamp(degrees: number): void {
  if (!motionOK()) return;
  gsap.to(swing, { angle: degrees, duration: 0.18, ease: 'power2.out', onUpdate: applySwing, overwrite: true, onComplete: settleLamp });
}

/** The shade rattles on the end of its cord and comes to rest within
    `duration` seconds: what the lamp does on its way down in the entrance.
    Only the shade tilts, about the point the cord holds it by; the cord
    stays straight, so nothing whips sideways. */
export function rattleLamp(duration: number): void {
  const shade = lamp?.querySelector('g[filter]');
  if (!shade || !motionOK()) return;
  gsap.set(shade, { svgOrigin: '1000 300' });
  gsap.to(shade, { keyframes: { rotation: [0, 6, -4.5, 3, -1.5, 0.5, 0], easeEach: 'sine.inOut' }, duration, clearProps: 'transform' });
}

/** The light coming on in a room that is already dark: the bulb stutters
    twice (the shade only), then catches, and the cone of light opens out from
    the shade once. room.css: html[data-lamp='off'] is the lamp dark,
    'catch' the bulb lit with no light thrown yet. */
export function flickerOn(): void {
  const cones = glows.map((glow) => glow.querySelector('.art'));
  const bulb = (state: 'off' | 'catch') => (): void => void (root.dataset.lamp = state);
  gsap.killTweensOf(cones);
  gsap
    .timeline()
    .call(bulb('catch'), [], 0.1)
    .call(bulb('off'), [], 0.18)
    .call(bulb('catch'), [], 0.28)
    .call(bulb('off'), [], 0.4)
    .call(() => void delete root.dataset.lamp, [], 0.46)
    // the cone opens out from the shade, keeping its shape
    .fromTo(cones, { scale: 0, transformOrigin: glowOrigin }, { scale: 1, duration: 0.35, ease: 'power2.out', clearProps: 'transform', immediateRender: false }, 0.46);
}

/** The lamp can be pulled aside and let go; a plain click calls onToggle. */
export function initLamp(onToggle: () => Promise<void>): void {
  if (!lamp) return;
  let startX = 0;
  let down = false;
  lamp.addEventListener('pointerdown', (e) => {
    down = true;
    lampDragged = false;
    startX = e.clientX;
    lamp.setPointerCapture(e.pointerId);
  });
  lamp.addEventListener('pointermove', (e) => {
    if (!down || !motionOK()) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) lampDragged = true;
    if (!lampDragged) return;
    gsap.killTweensOf(swing);
    const length = lamp.offsetHeight * CORD;
    swing.angle = gsap.utils.clamp(-7, 7, (Math.atan2(-dx, length) * 180) / Math.PI);
    applySwing();
  });
  const up = (): void => {
    if (down && lampDragged) settleLamp();
    down = false;
  };
  lamp.addEventListener('pointerup', up);
  lamp.addEventListener('pointercancel', up);
  lamp.addEventListener('click', () => {
    if (lampDragged) {
      lampDragged = false;
      return;
    }
    // the swing waits for the cross-fade: a lamp moving under it shows twice
    void onToggle().then(() => swingLamp(2.2));
  });
}

/* ---- the window: clouds you can push, and at night a star you can throw ---- */

function initWindow(): void {
  const button = one<HTMLButtonElement>('.obj-window');
  if (!button || !sky) return;
  let cloud: SVGGElement | null = null;
  let start: DOMPoint | null = null;
  let origin = { x: 0, y: 0 };
  let last = { x: 0, y: 0, t: 0 };
  let speed = { x: 0, y: 0 };
  let moved = false;

  button.addEventListener('pointerdown', (e) => {
    start = svgPoint(sky, e);
    moved = false;
    cloud = null;
    if (!start || !motionOK()) return;
    button.setPointerCapture(e.pointerId);
    for (const candidate of visibleClouds()) {
      const box = candidate.getBBox();
      const dx = Number(gsap.getProperty(candidate, 'x'));
      const dy = Number(gsap.getProperty(candidate, 'y'));
      if (start.x > box.x + dx - 14 && start.x < box.x + box.width + dx + 14 && start.y > box.y + dy - 14 && start.y < box.y + box.height + dy + 14) {
        cloud = candidate;
        origin = { x: dx, y: dy };
        gsap.killTweensOf(cloud);
      }
    }
    last = { x: start.x, y: start.y, t: e.timeStamp };
    speed = { x: 0, y: 0 };
  });

  button.addEventListener('pointermove', (e) => {
    if (!start || !button.hasPointerCapture(e.pointerId)) return;
    const p = svgPoint(sky, e);
    if (!p) return;
    if (Math.hypot(p.x - start.x, p.y - start.y) > 6) moved = true;
    const dt = Math.max(1, e.timeStamp - last.t);
    speed = { x: (p.x - last.x) / dt, y: (p.y - last.y) / dt };
    last = { x: p.x, y: p.y, t: e.timeStamp };
    if (cloud) gsap.set(cloud, { x: origin.x + p.x - start.x, y: origin.y + p.y - start.y });
  });

  const up = (e: PointerEvent): void => {
    if (!start) return;
    const p = svgPoint(sky, e);
    if (cloud) {
      // let it glide, but keep at least half of it in the pane (450-900 by 90-440)
      const box = cloud.getBBox();
      const midX = box.x + box.width / 2;
      const midY = box.y + box.height / 2;
      const x = Number(gsap.getProperty(cloud, 'x')) + speed.x * 110;
      const y = Number(gsap.getProperty(cloud, 'y')) + speed.y * 110;
      gsap.to(cloud, {
        x: gsap.utils.clamp(450 - midX, 900 - midX, x),
        y: gsap.utils.clamp(110 - midY, 420 - midY, y),
        duration: 1.1,
        ease: 'power3.out',
      });
    } else if (moved && p && document.documentElement.dataset.sky === 'night') {
      shootStar(start.x, start.y, p.x, p.y);
    }
    start = null;
    cloud = null;
  };
  button.addEventListener('pointerup', up);
  button.addEventListener('pointercancel', up);

  button.addEventListener('click', () => {
    if (moved || !motionOK()) {
      moved = false;
      return;
    }
    if (document.documentElement.dataset.sky === 'night') shootStar();
    else scootClouds();
  });
}

/* ---- the shelf: run the pointer along the spines ---- */

function initBooks(): void {
  const shelf = one<HTMLButtonElement>('.obj-shelves');
  const svg = shelf?.querySelector<SVGSVGElement>('svg');
  if (!shelf || !svg) return;
  const books = all<SVGGraphicsElement>('.book').map((el) => ({ el, box: el.getBBox(), busy: false }));
  shelf.addEventListener('pointermove', (e) => {
    if (!motionOK()) return;
    const p = svgPoint(svg, e);
    if (!p) return;
    for (const book of books) {
      const { box } = book;
      if (book.busy || p.x < box.x || p.x > box.x + box.width || p.y < box.y - 20 || p.y > box.y + box.height + 10) continue;
      book.busy = true;
      gsap.to(book.el, {
        y: -9,
        duration: 0.12,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: () => void (book.busy = false),
      });
    }
  });
}

/* ---- the breeze: a fast sweep of the pointer stirs whatever it passes ---- */

function initBreeze(): void {
  const things: { el: Element; gust: (dir: number) => void; rest: number }[] = [
    ...notes.map((note) => ({ el: note as Element, gust: (dir: number) => swingNote(note, 9 * dir), rest: 0 })),
    ...(steam[0] ? [{ el: steam[0] as Element, gust: bendSteam, rest: 0 }] : []),
    ...(leaves ? [{ el: leaves as Element, gust: leanPlant, rest: 0 }] : []),
    ...(lamp ? [{ el: lamp as Element, gust: (dir: number) => swingLamp(-2.5 * dir), rest: 0 }] : []),
  ];
  let last = { x: 0, t: 0 };
  let checked = 0;
  stage.addEventListener('pointermove', (e) => {
    const dt = e.timeStamp - last.t;
    const speed = dt > 0 && dt < 80 ? (e.clientX - last.x) / dt : 0;
    last = { x: e.clientX, t: e.timeStamp };
    // px per ms; a deliberate sweep, not ordinary pointing
    if (Math.abs(speed) < 1.4 || e.timeStamp - checked < 48 || e.buttons || !motionOK()) return;
    checked = e.timeStamp;
    const dir = Math.sign(speed);
    for (const thing of things) {
      if (e.timeStamp < thing.rest) continue;
      const box = thing.el.getBoundingClientRect();
      const reach = 90 + box.width / 2;
      if (Math.abs(box.left + box.width / 2 - e.clientX) > reach || Math.abs(box.top + box.height / 2 - e.clientY) > reach + 60) continue;
      thing.rest = e.timeStamp + 900;
      thing.gust(dir);
    }
  });
}

/* ---- public ---- */

/** What an object does as its page opens. */
export function react(id: string): void {
  if (!motionOK()) return;
  if (id === 'experience' && notes[0]) swingNote(notes[0], 16);
  else if (id === 'education') tipBook();
  else if (id === 'about') puffSteam();
  else if (id === 'contact') {
    hopEnvelope();
    buzzPhone();
  }
}

/** Something small that happens on its own when nobody is touching the room. */
export function idle(): void {
  const acts = [
    () => {
      const note = notes[Math.floor(Math.random() * notes.length)];
      if (note) swingNote(note, rand(-7, 7));
    },
    typeKeys,
    buzzPhone,
    () => leanPlant(Math.random() < 0.5 ? 1 : -1),
    () => {
      const cloud = visibleClouds()[0];
      if (cloud) gsap.to(cloud, { x: `+=${rand(-30, 30)}`, duration: 2.4, ease: 'sine.inOut' });
    },
  ];
  acts[Math.floor(Math.random() * acts.length)]?.();
}

export { puffSteam, leanPlant };

export function initToys(): void {
  const mail = one<HTMLButtonElement>('.obj-mail');
  if (mail) {
    mail.addEventListener('pointerenter', () => openEnvelope(true));
    mail.addEventListener('pointerleave', () => openEnvelope(mail.matches(':focus-visible')));
    mail.addEventListener('focus', () => openEnvelope(mail.matches(':focus-visible')));
    mail.addEventListener('blur', () => openEnvelope(false));
  }
  initWindow();
  initBooks();
  initBreeze();
}
