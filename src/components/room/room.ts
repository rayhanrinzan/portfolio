// The room island: the only script on the site. This file wires the pieces
// together and owns the room / list view switch; each piece of motion lives
// in its own module next to it.
import { gsap, motionOK, refresh, room, root, stage } from './motion';
import { setSky, toggleSky } from './daynight';
import { closeNow, initPanels } from './panels';
import { initLamp, initToys } from './toys';
import { initAmbient } from './ambient';
import { initBoil } from './boil';
import { initEntrance } from './entrance';
import { initParallax } from './parallax';
import { initTraining } from './training';

const head = room.querySelector<HTMLElement>('[data-head]');
const toggle = document.querySelector<HTMLButtonElement>('[data-view-toggle]');
const landscape = window.matchMedia('(min-aspect-ratio: 1/1)');

function setView(view: 'room' | 'list'): void {
  root.dataset.view = view;
  try {
    localStorage.setItem('view', view);
  } catch {
    // storage blocked: the choice just lasts for this page
  }
  refresh();
}

/** Where the miniature room sits at the top of the list view. */
function miniature(): DOMRect | null {
  const was = root.dataset.view;
  root.dataset.view = 'list';
  const rect = document.querySelector('.scene-stage')?.getBoundingClientRect() ?? null;
  root.dataset.view = was;
  return rect;
}

/** The stage transform that lays the room exactly over the miniature. */
function shrunk(mini: DOMRect): gsap.TweenVars {
  const at = stage.getBoundingClientRect();
  return { x: mini.left - at.left, y: mini.top - at.top, scale: mini.width / at.width, transformOrigin: '0 0' };
}

const arriving = '.wrap .hero > :not(.scene), .wrap > :not(.hero)';
let switching = false;

function toList(): void {
  closeNow();
  window.scrollTo(0, 0);
  const mini = motionOK() && landscape.matches ? miniature() : null;
  if (!mini) return setView('list');
  // the room folds down into the small drawing that heads the list
  switching = true;
  const chair = stage.querySelector('.obj-chair');
  gsap.to([head, chair], { autoAlpha: 0, duration: 0.15 });
  gsap.to(stage, {
    ...shrunk(mini),
    duration: 0.5,
    ease: 'power2.inOut',
    onComplete() {
      setView('list');
      gsap.set([stage, head, chair], { clearProps: 'all' });
      gsap.from(arriving, { autoAlpha: 0, duration: 0.3, clearProps: 'all' });
      switching = false;
    },
  });
}

function toRoom(): void {
  history.replaceState(null, '', location.pathname + location.search);
  const mini = motionOK() && landscape.matches ? document.querySelector('.scene-stage')?.getBoundingClientRect() : null;
  setView('room');
  if (!mini) return;
  switching = true;
  gsap.from(head, { autoAlpha: 0, duration: 0.25, delay: 0.3, clearProps: 'all' });
  gsap.from(stage, {
    ...shrunk(mini),
    duration: 0.5,
    ease: 'power2.inOut',
    clearProps: 'transform,transformOrigin',
    onComplete: () => void (switching = false),
  });
}

setSky(root.dataset.sky ?? 'afternoon');
refresh();

toggle?.addEventListener('click', () => {
  if (switching) return;
  if (root.dataset.view === 'room') toList();
  else toRoom();
});

initLamp(toggleSky);
initPanels();
initToys();
initTraining();
initAmbient();
initBoil();
initParallax();
initEntrance();
