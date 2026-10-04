// Ambient life: slow loops that run on their own (cloud drift, mug steam,
// plant sway, the laptop cursor, twinkling stars), the odd thing crossing the
// sky, and small idle moments. Every loop goes through loop() in motion.ts,
// so all of it stops when the tab is hidden or the list view is showing.
import { alive, gsap, loop, motionOK, rand, root, stage } from './motion';
import { idle, shootStar } from './toys';

/** A paper plane crosses the daytime window, left to right. */
function flyPlane(): void {
  const plane = stage.querySelector('.obj-window .plane');
  if (!plane) return;
  const y = rand(130, 300);
  gsap
    .timeline()
    .set(plane, { x: 420, y, rotation: 8, opacity: 1 })
    .to(plane, { x: 930, duration: 5, ease: 'none' }, 0)
    .to(plane, { y: y - 46, rotation: -6, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
    .set(plane, { opacity: 0 });
}

export function initAmbient(): void {
  if (!motionOK()) return;

  stage.querySelectorAll('.cloud').forEach((cloud, i) => {
    loop(gsap.to(cloud, { x: (i % 2 ? -1 : 1) * rand(12, 24), duration: rand(8, 14), ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  });

  stage.querySelectorAll('.steam').forEach((wisp, i) => {
    loop(
      gsap.fromTo(
        wisp,
        { y: 6, opacity: 0 },
        {
          keyframes: [
            { y: 0, opacity: 1, duration: 1.3, ease: 'sine.out' },
            { y: -8, opacity: 0, duration: 1.9, ease: 'sine.in' },
          ],
          repeat: -1,
          delay: i * 1.4,
        },
      ),
    );
  });

  const leaves = stage.querySelector('.leaves');
  if (leaves) {
    loop(gsap.fromTo(leaves, { rotation: -1.4 }, { rotation: 1.4, transformOrigin: '49% 58%', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  }

  const caret = stage.querySelector('.caret');
  if (caret) loop(gsap.to(caret, { opacity: 0, duration: 0.01, repeat: -1, repeatDelay: 0.55, yoyo: true }));

  stage.querySelectorAll('.tw').forEach((star) => {
    loop(gsap.to(star, { opacity: 0.3, duration: rand(1.2, 2.6), delay: rand(0, 2), ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  });

  // now and then something crosses the sky
  loop(
    gsap.to({}, {
      duration: 17,
      repeat: -1,
      onRepeat() {
        if (root.dataset.open) return;
        if (root.dataset.sky === 'night') shootStar();
        else flyPlane();
      },
    }),
  );

  // and when nobody has touched the room for a while, it fidgets
  let touched = performance.now();
  const touch = (): void => void (touched = performance.now());
  window.addEventListener('pointermove', touch, { passive: true });
  window.addEventListener('pointerdown', touch, { passive: true });
  window.addEventListener('keydown', touch);
  loop(
    gsap.to({}, {
      duration: 6,
      repeat: -1,
      onRepeat() {
        if (alive() && !root.dataset.open && performance.now() - touched > 14000) idle();
      },
    }),
  );
}
