// The drop-in entrance. The head script holds every [data-drop] drawing a
// little above its place (html[data-enter], see room.css); here each one falls
// and settles, in data-drop order. Once per visit, transforms only, and the
// buttons work the whole time.
import { gsap, root, stage, unit } from './motion';
import { leanPlant, puffSteam, swingLamp } from './toys';

const STAGGER = 0.07;

export function initEntrance(): void {
  if (!root.hasAttribute('data-enter')) return;
  try {
    sessionStorage.setItem('entered', '1');
  } catch {
    // private mode: the entrance simply plays again next time
  }

  const height = 70 * unit();
  const drops = Array.from(stage.querySelectorAll<HTMLElement>('[data-drop]')).sort((a, b) => Number(a.dataset.drop) - Number(b.dataset.drop));
  const tl = gsap.timeline();

  drops.forEach((el, i) => {
    const at = i * STAGGER;
    const onWall = el.dataset.layer === 'wall';
    tl.fromTo(el, { y: -height }, { y: 0, duration: 0.26, ease: 'power2.in' }, at);
    if (el.classList.contains('obj-lamp')) {
      // hangs from its cord: no squash, it swings instead
      tl.call(() => swingLamp(3), [], at + 0.26);
    } else if (onWall) {
      // caught by its nail: a small rock from side to side
      tl.fromTo(el, { rotation: i % 2 ? 0.9 : -0.9 }, { rotation: 0, duration: 0.5, ease: 'elastic.out(1.4, 0.3)', clearProps: 'transform' }, at + 0.26);
    } else {
      // lands on the table: squash, then back
      tl.to(el, { scaleY: 0.93, scaleX: 1.03, transformOrigin: '50% 100%', duration: 0.07, ease: 'power1.out' }, at + 0.26).to(
        el,
        { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)', clearProps: 'transform' },
        at + 0.33,
      );
    }
    if (el.classList.contains('obj-mug')) tl.call(puffSteam, [], at + 0.26);
    if (el.classList.contains('obj-plant')) tl.call(() => leanPlant(1), [], at + 0.26);
  });

  // GSAP now holds every start position, so the CSS hold can go
  root.removeAttribute('data-enter');
}
