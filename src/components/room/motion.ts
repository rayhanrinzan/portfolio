// Shared motion state for the room island: one place that knows whether
// motion is allowed, and one switch for every ambient loop.
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export { gsap };

export const root = document.documentElement;
export const room = document.querySelector<HTMLElement>('[data-room]')!;
export const stage = document.querySelector<HTMLElement>('[data-stage]')!;

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

/** False when the visitor asked for reduced motion. */
export const motionOK = (): boolean => !reduce.matches;

/** True while ambient motion should run: allowed, tab visible, room showing. */
export const alive = (): boolean => motionOK() && !document.hidden && root.dataset.view === 'room';

const loops: gsap.core.Animation[] = [];

/** Register an endless animation so it pauses with the tab and the list view. */
export function loop<T extends gsap.core.Animation>(animation: T): T {
  loops.push(animation);
  if (!alive()) animation.pause();
  return animation;
}

/** Re-check the conditions above; call after anything that changes them. */
export function refresh(): void {
  const on = alive();
  root.toggleAttribute('data-motion', motionOK());
  loops.forEach((animation) => (on ? animation.resume() : animation.pause()));
}

reduce.addEventListener('change', refresh);
document.addEventListener('visibilitychange', refresh);

/** One stage unit in CSS pixels (the --u in room.css). */
export function unit(): number {
  const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  return stage.offsetWidth / (portrait ? 800 : 1600);
}

/** Pointer position in an svg's own coordinates. */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }): DOMPoint | null {
  const matrix = svg.getScreenCTM();
  return matrix ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse()) : null;
}

/** Open a scrolling surface at its top. A #hash deep link makes the browser
    scroll the matching heading to the top edge, now and again once the page
    has loaded, so the reset is repeated then. */
export function toTop(el: HTMLElement | null): void {
  if (!el) return;
  const top = (): void => void (el.scrollTop = 0);
  top();
  requestAnimationFrame(top);
  if (document.readyState !== 'complete') window.addEventListener('load', top, { once: true });
}

/** The lamp's light opens out from the shade. A plain element animation:
    where the light sits and what it scales from are in room.css, so nothing
    is left behind on the element afterwards. */
export function openCone(): void {
  if (!motionOK()) return;
  stage.querySelectorAll('.obj-glow .art').forEach((cone) => {
    cone.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  });
}

export const rand = gsap.utils.random;
