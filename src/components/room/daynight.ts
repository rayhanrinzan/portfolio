// The sky state, and the lamp that overrides it. Changing between day and
// night is a short scene change: the page colours cross-fade, the moon or sun
// comes up, the stars pop in and the lamp's light unfolds.
import { gsap, motionOK, room, root, stage } from './motion';

/** Daytime is always the blue afternoon sky, whatever the clock says. */
const DAY = 'afternoon';

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
    // the drawing inside each light, not its wrapper: the wrapper's transform
    // belongs to the parallax and the lamp's swing. Skipped while the lamp is
    // still dark (the entrance), which opens the light itself.
    if (!root.dataset.lamp) {
      gsap.from(stage.querySelectorAll('.obj-glow .art'), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
    }
  } else {
    const group = pane.querySelector(`.sky-${sky}`);
    if (!group) return;
    gsap.from(group.querySelector('.sun'), { y: 170, duration: 0.6, ease: 'power3.out' });
    gsap.from(group.querySelectorAll('.cloud-d'), { x: (i) => (i % 2 ? 120 : -120), opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05 });
  }
}

/** The lamp: night if it is day, day if it is night. Resolves once the new
    sky is fully showing, so anything that moves can wait for the cross-fade. */
export async function toggleSky(): Promise<void> {
  const next = root.dataset.sky === 'night' ? DAY : 'night';
  if (!motionOK()) return setSky(next);
  const change = (): void => {
    setSky(next);
    arrive(next);
    // for anything that lives by daylight (the watering can)
    document.dispatchEvent(new CustomEvent('room:sky', { detail: next }));
  };
  if (!('startViewTransition' in document)) return change();
  try {
    await document.startViewTransition(change).finished;
  } catch {
    // a skipped transition has still changed the sky
  }
}
