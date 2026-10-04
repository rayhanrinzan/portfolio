// The laptop is the one object that does not open a notebook page: the camera
// pushes in until its screen fills the view, and the screen becomes the
// projects page. Closing pulls back out to the room.
import { gsap, motionOK, room, stage } from './motion';

const screen = room.querySelector<HTMLElement>('[data-screen]')!;
const head = room.querySelector<HTMLElement>('[data-head]');
const chair = room.querySelector<HTMLElement>('.obj-chair');
const screenRect = room.querySelector<SVGRectElement>('.obj-laptop [data-screen-rect]');

let zoomed = false;

/** The stage transform that makes the drawn laptop screen cover the room.
    Worked out from layout, not from where things are on screen right now, so
    it is right even while the stage is mid-move. */
function target(): { x: number; y: number; scale: number } {
  const laptop = screenRect?.closest<HTMLElement>('.obj');
  const svg = screenRect?.ownerSVGElement;
  if (!laptop || !svg || !screenRect) return { x: 0, y: 0, scale: 1 };
  const box = svg.viewBox.baseVal;
  const k = laptop.offsetWidth / box.width;
  const w = screenRect.width.baseVal.value * k;
  const h = screenRect.height.baseVal.value * k;
  // centre of the drawn screen, from the stage's top-left corner
  const cx = laptop.offsetLeft + (screenRect.x.baseVal.value - box.x) * k + w / 2;
  const cy = laptop.offsetTop + (screenRect.y.baseVal.value - box.y) * k + h / 2;
  const scale = Math.max(room.clientWidth / w, room.clientHeight / h);
  return {
    scale,
    x: room.clientWidth / 2 - stage.offsetLeft - scale * cx,
    y: room.clientHeight / 2 - stage.offsetTop - scale * cy,
  };
}

export function openScreen(animate: boolean, done?: () => void): void {
  gsap.killTweensOf([stage, screen, head, chair]);
  screen.hidden = false;
  if (!zoomed) gsap.set(stage, { transformOrigin: '0 0', willChange: 'transform' });
  const to = zoomed ? null : target();
  zoomed = true;

  if (!animate || !motionOK()) {
    if (to) gsap.set(stage, to);
    gsap.set(head, { autoAlpha: 0 });
    gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: animate ? 0.15 : 0, onComplete: done });
    return;
  }
  gsap
    .timeline({ onComplete: done })
    .to(chair, { yPercent: 70, duration: 0.3, ease: 'power2.in' }, 0)
    .to(head, { autoAlpha: 0, duration: 0.2 }, 0)
    .to(stage, { ...to, duration: 0.56, ease: 'power2.inOut' }, 0.04)
    .fromTo(screen, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'none' }, 0.38);
}

export function closeScreen(animate: boolean, done?: () => void): void {
  gsap.killTweensOf([stage, screen, head, chair]);
  zoomed = false;
  const finish = (): void => {
    screen.hidden = true;
    gsap.set([stage, head, chair, screen], { clearProps: 'all' });
    done?.();
  };

  if (!animate) return finish();
  if (!motionOK()) {
    gsap.to(screen, { opacity: 0, duration: 0.15, onComplete: finish });
    return;
  }
  gsap
    .timeline({ onComplete: finish })
    .to(screen, { opacity: 0, duration: 0.2, ease: 'none' }, 0)
    .to(stage, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power2.inOut' }, 0.04)
    .to(chair, { yPercent: 0, duration: 0.3, ease: 'power2.out' }, 0.26)
    .to(head, { autoAlpha: 1, duration: 0.2 }, 0.36);
}
