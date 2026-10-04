// The sky state, and the lamp that overrides it. Changing between day and
// night is a short scene change: the page colours cross-fade, the moon or sun
// comes up, the stars pop in and the lamp's light unfolds.
import { gsap, motionOK, room, root, stage } from './motion';

function daySky(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 17 && h < 20) return 'golden';
  return 'afternoon';
}

const lamp = stage.querySelector<HTMLButtonElement>('[data-obj="lamp"]');

export function setSky(sky: string): void {
  root.dataset.sky = sky;
  root.dataset.theme = sky === 'night' ? 'night' : 'light';
  const night = sky === 'night';
  lamp?.setAttribute('aria-label', night ? 'Switch to day (lamp)' : 'Switch to night (lamp)');
  const lab = lamp?.querySelector('.lab');
  if (lab) lab.textContent = night ? 'day' : 'night';
  // the lamp overrides the colour scheme, so the browser chrome follows it
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute('media');
    meta.content = night ? '#1C2733' : '#E4F2FC';
  });
}

/** What rises and appears once the new sky is showing. */
function arrive(sky: string): void {
  const pane = room.querySelector('.obj-window .sky');
  if (!pane) return;
  if (sky === 'night') {
    gsap.from(pane.querySelector('.moon'), { y: 150, duration: 0.6, ease: 'power3.out' });
    gsap.from(pane.querySelectorAll('.tw'), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)', stagger: 0.06, delay: 0.15 });
    gsap.from(stage.querySelectorAll('.obj-glow'), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
  } else {
    const group = pane.querySelector(`.sky-${sky}`);
    if (!group) return;
    gsap.from(group.querySelector('.sun'), { y: 170, duration: 0.6, ease: 'power3.out' });
    gsap.from(group.querySelectorAll('.cloud-d'), { x: (i) => (i % 2 ? 120 : -120), opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05 });
  }
}

/** The lamp: night if it is day, back to the local-time sky if it is night. */
export function toggleSky(): void {
  const next = root.dataset.sky === 'night' ? daySky() : 'night';
  if (!motionOK()) return setSky(next);
  const change = (): void => {
    setSky(next);
    arrive(next);
    // for anything that lives by daylight (the watering can)
    document.dispatchEvent(new CustomEvent('room:sky', { detail: next }));
  };
  if ('startViewTransition' in document) document.startViewTransition(change);
  else change();
}
