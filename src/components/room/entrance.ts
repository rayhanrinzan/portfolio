// The entrance. The wall, the shelves, the window and the chair are simply
// there. The things on the table pop into the air one by one, left to right,
// each with a burst of pop lines, then all drop onto the table together; the
// lamp comes down on its cord at the same moment, its shade rattling as it
// falls. A beat later night falls and the lamp flickers on. The head script
// sets html[data-enter] and room.css holds the start positions until this
// runs. Every load of the room, and the buttons work the whole time.
import { gsap, root, stage, unit } from './motion';
import { toggleSky } from './daynight';
import { burst } from './pop';
import { flickerOn, leanPlant, puffSteam, rattleLamp } from './toys';

/** How far above the table things appear, in stage units; room.css matches. */
const DROP = 110;
const POP = 0.2;
const POP_STAGGER = 0.12;
const HANG = 0.08;
const FALL = 0.28;

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
  const things = Array.from(stage.querySelectorAll<HTMLElement>('.obj[data-layer="objects"]:not(.obj-can)')).sort(
    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
  );
  const lamp = stage.querySelector<HTMLElement>('.obj-lamp');
  const landing = (things.length - 1) * POP_STAGGER + POP + HANG;
  // take over the hold from room.css before letting it go, so nothing flashes
  gsap.set(things, { y: -height, scale: 0.4, opacity: 0 });
  gsap.set(lamp, { y: -height });
  root.removeAttribute('data-enter');
  // a hovered wall object is raised above the table's things (room.css); not
  // while those are in the air in front of it
  root.dataset.entering = '';
  const tl = gsap.timeline();
  tl.call(() => void delete root.dataset.entering, [], landing + FALL + 0.3);

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
    // hangs from its cord: no squash; the shade rattles as it comes down and
    // is still again before the light changes
    // (the kick comes half way down, as the cord goes taut)
    tl.fromTo(lamp, { y: -height }, { y: 0, duration: FALL, ease: 'power2.in' }, landing).call(() => rattleLamp(FALL / 2 + 0.4), [], landing + FALL / 2);
  }

  // daylight until everything has landed. Then night falls with the lamp
  // still dark, and the bulb flickers on.
  if (!('dusk' in root.dataset)) return;
  tl.call(
    () => {
      delete root.dataset.dusk;
      if (root.dataset.sky === 'night') return;
      root.dataset.lamp = 'off';
      void toggleSky().then(flickerOn);
    },
    [],
    landing + FALL + 0.4,
  );
}
