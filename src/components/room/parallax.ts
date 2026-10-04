// Pointer parallax, desktop only. The pointer sets --px / --py on the stage
// (-1 to 1); room.css turns those into a few pixels of shift per layer.
import { gsap, motionOK, room, stage } from './motion';

export function initParallax(): void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const at = { x: 0, y: 0 };
  const apply = (): void => {
    stage.style.setProperty('--px', at.x.toFixed(3));
    stage.style.setProperty('--py', at.y.toFixed(3));
  };
  const xTo = gsap.quickTo(at, 'x', { duration: 0.7, ease: 'power3', onUpdate: apply });
  const yTo = gsap.quickTo(at, 'y', { duration: 0.7, ease: 'power3', onUpdate: apply });

  room.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !fine.matches || !motionOK()) return;
    xTo((e.clientX / window.innerWidth) * 2 - 1);
    yTo((e.clientY / window.innerHeight) * 2 - 1);
  });
  document.documentElement.addEventListener('pointerleave', () => {
    xTo(0);
    yTo(0);
  });
}
