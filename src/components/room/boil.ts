// The boiling line: while an object is hovered, focused or open, step the seed
// of the #boil filter at about 8fps so its outline shimmers like hand-drawn
// animation. room.css decides which object uses that filter.
import { alive, stage } from './motion';

const SEEDS = [4, 11, 23, 37];
const HOT = 'button.obj:is(:hover, :focus-visible, [data-active])';

export function initBoil(): void {
  const noise = document.querySelector('[data-boil]');
  if (!noise) return;
  let i = 0;
  window.setInterval(() => {
    if (!alive() || !stage.querySelector(HOT)) return;
    i = (i + 1) % SEEDS.length;
    noise.setAttribute('seed', String(SEEDS[i]));
  }, 125);
}
