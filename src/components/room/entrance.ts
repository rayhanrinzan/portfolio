// The drop-in entrance. The head script holds every [data-drop] drawing a
// little above its place (html[data-enter], see room.css); here each one falls
// and settles, in data-drop order. Every load of the room, transforms only, and the
// buttons work the whole time.
import { gsap, root, stage, unit } from './motion';
import { leanPlant, puffSteam, swingLamp } from './toys';

const STAGGER = 0.065;
/** How far each drawing falls, in stage units; room.css holds it there. */
const DROP = 110;
const FALL = 0.32;

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
  const drops = Array.from(stage.querySelectorAll<HTMLElement>('[data-drop]')).sort((a, b) => Number(a.dataset.drop) - Number(b.dataset.drop));
  const tl = gsap.timeline();

  drops.forEach((el, i) => {
    const at = i * STAGGER;
    const onWall = el.dataset.layer === 'wall';
    tl.fromTo(el, { y: -height }, { y: 0, duration: FALL, ease: 'power2.in' }, at);
    if (el.classList.contains('obj-lamp')) {
      // hangs from its cord: no squash, it swings instead
      tl.call(() => swingLamp(3), [], at + FALL);
    } else if (onWall) {
      // caught by its nail: a small rock from side to side
      tl.fromTo(el, { rotation: i % 2 ? 0.9 : -0.9 }, { rotation: 0, duration: 0.5, ease: 'elastic.out(1.4, 0.3)', clearProps: 'transform' }, at + FALL);
    } else {
      // lands on the table: squash, then back
      tl.to(el, { scaleY: 0.93, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.07, ease: 'power1.out' }, at + FALL).to(
        el,
        { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)', clearProps: 'transform' },
        at + FALL + 0.07,
      );
    }
    if (el.classList.contains('obj-mug')) tl.call(puffSteam, [], at + FALL);
    if (el.classList.contains('obj-plant')) tl.call(() => leanPlant(1), [], at + FALL);
  });

  // GSAP now holds every start position, so the CSS hold can go
  root.removeAttribute('data-enter');
}
