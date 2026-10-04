// Comic-book pop lines, shared by the entrance and the watering can.
import { gsap, stage, unit } from './motion';

const SVG = 'http://www.w3.org/2000/svg';

/** Comic-book pop lines: short strokes that shoot out around a drawing as it
    appears, then are gone. Drawn fresh each time so no two bursts match. */
export function burst(el: HTMLElement, lift: number): void {
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
