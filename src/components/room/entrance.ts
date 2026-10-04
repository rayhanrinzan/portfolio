// The entrance. The wall, the shelves, the window and the chair are simply
// there. The things on the table pop into the air one by one, left to right,
// each with a burst of pop lines, then all drop onto the table together; the
// lamp comes down on its cord at the same moment and, a beat later, switches
// on and brings the night. The head script sets html[data-enter] and room.css holds
// the start positions until this runs. Every load of the room, transforms
// and opacity only, and the buttons work the whole time.
import { gsap, root, stage, unit } from './motion';
import { toggleSky } from './daynight';
import { leanPlant, puffSteam, swingLamp } from './toys';

/** How far above the table things appear, in stage units; room.css matches. */
const DROP = 110;
const POP = 0.2;
const POP_STAGGER = 0.12;
const HANG = 0.08;
const FALL = 0.28;

const SVG = 'http://www.w3.org/2000/svg';

/** Comic-book pop lines: short strokes that shoot out around a drawing as it
    appears, then are gone. Drawn fresh each time so no two bursts match. */
function burst(el: HTMLElement, lift: number): void {
  const u = unit();
  const gap = 12 * u;
  const reach = 30 * u;
  const pad = gap + reach * 1.4;
  const w = el.offsetWidth + pad * 2;
  const h = el.offsetHeight + pad * 2;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'pop');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = `left:${el.offsetLeft - pad}px;top:${el.offsetTop - lift - pad}px;width:${w}px;height:${h}px`;
  const rx = el.offsetWidth / 2 + gap;
  const ry = el.offsetHeight / 2 + gap;
  const count = 10;
  for (let i = 0; i < count; i++) {
    const angle = ((i + gsap.utils.random(-0.25, 0.25)) / count) * Math.PI * 2;
    const length = reach * gsap.utils.random(0.7, 1.3);
    const x = w / 2 + Math.cos(angle) * rx;
    const y = h / 2 + Math.sin(angle) * ry;
    const line = document.createElementNS(SVG, 'path');
    line.setAttribute('d', `M${x.toFixed(1)},${y.toFixed(1)} l${(Math.cos(angle) * length).toFixed(1)},${(Math.sin(angle) * length).toFixed(1)}`);
    svg.append(line);
  }
  stage.append(svg);
  gsap
    .timeline({ onComplete: () => svg.remove() })
    .fromTo(svg.children, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.13, ease: 'power2.out' })
    .to(svg.children, { drawSVG: '100% 100%', duration: 0.17, ease: 'power1.in' });
}

export function initEntrance(): void {
  if (!root.hasAttribute('data-enter')) return;
  // the island is running, so the CSS fallback can stand down (see room.css)
  root.dataset.enter = 'held';
  // a tab opened in the background waits, so the drop is seen, not missed
  if (document.hidden) {
    document.addEventListener('visibilitychange', function shown() {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', shown);
      play();
    });
  } else {
    play();
  }
}

function play(): void {
  const height = DROP * unit();
  // left to right as drawn, which differs between the landscape and portrait rooms
  const things = Array.from(stage.querySelectorAll<HTMLElement>('.obj[data-layer="objects"]')).sort(
    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
  );
  const lamp = stage.querySelector<HTMLElement>('.obj-lamp');
  const landing = (things.length - 1) * POP_STAGGER + POP + HANG;
  // take over the hold from room.css before letting it go, so nothing flashes
  gsap.set(things, { y: -height, scale: 0.4, opacity: 0 });
  gsap.set(lamp, { y: -height });
  root.removeAttribute('data-enter');
  const tl = gsap.timeline();

  tl.fromTo(
    things,
    { y: -height, scale: 0.4, opacity: 0, transformOrigin: '50% 50%' },
    { scale: 1, opacity: 1, duration: POP, ease: 'back.out(2.6)', stagger: POP_STAGGER },
    0,
  );
  things.forEach((el, i) => tl.call(burst, [el, height], i * POP_STAGGER + 0.03));
  // all together: fall, squash on the table, spring back
  tl.to(things, { y: 0, duration: FALL, ease: 'power2.in' }, landing)
    .set(things, { transformOrigin: '50% 100%' }, landing + FALL)
    .to(things, { scaleY: 0.92, scaleX: 1.04, duration: 0.07, ease: 'power1.out' }, landing + FALL)
    .to(things, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(3)', clearProps: 'transform,opacity' }, landing + FALL + 0.07)
    .call(puffSteam, [], landing + FALL)
    .call(() => leanPlant(1), [], landing + FALL);

  if (lamp) {
    // hangs from its cord: no squash, it swings instead
    tl.fromTo(lamp, { y: -height }, { y: 0, duration: FALL, ease: 'power2.in' }, landing).call(() => swingLamp(3), [], landing + FALL);
  }

  // daylight until everything has landed; then the lamp comes on
  tl.call(
    () => {
      if (!('dusk' in root.dataset)) return;
      delete root.dataset.dusk;
      if (root.dataset.sky !== 'night') toggleSky();
    },
    [],
    landing + FALL + 0.45,
  );
}
