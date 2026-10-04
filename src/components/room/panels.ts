// Opening and closing content from the room. Each object's section lives once
// in the list view; opening moves that element onto the notebook page (or the
// laptop screen), closing puts it back. The URL hash is the source of truth,
// so deep links and the back button work.
import { gsap, motionOK, room, root, stage } from './motion';
import { closeScreen, openScreen } from './zoom';
import { react } from './toys';

const page = room.querySelector<HTMLElement>('[data-page]')!;
const pageBody = room.querySelector<HTMLElement>('[data-page-body]')!;
const screen = room.querySelector<HTMLElement>('[data-screen]')!;
const screenBody = room.querySelector<HTMLElement>('[data-screen-body]')!;
const grab = room.querySelector<HTMLElement>('[data-page-grab]');

const narrow = window.matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)');

const opener = (id: string): HTMLButtonElement | null =>
  stage.querySelector<HTMLButtonElement>(`button[data-target="${id}"]`);
const isPanel = (id: string): boolean => opener(id) !== null && document.getElementById(id) !== null;

let open: string | null = null;
/** Where each mounted section came from in the list view. */
const homes = new Map<string, Comment>();

function mount(id: string, into: HTMLElement): void {
  const section = document.getElementById(id);
  if (!section || homes.has(id)) return;
  const home = document.createComment(id);
  section.before(home);
  homes.set(id, home);
  into.append(section);
}

function unmount(id: string): void {
  const section = document.getElementById(id);
  const home = homes.get(id);
  if (section && home) home.replaceWith(section);
  homes.delete(id);
}

function mark(id: string | null): void {
  stage.querySelectorAll('[data-active]').forEach((el) => el.removeAttribute('data-active'));
  if (id) {
    opener(id)?.setAttribute('data-active', '');
    root.dataset.open = id;
  } else {
    delete root.dataset.open;
  }
  // under the laptop screen, or under a page that covers it, the room is out of reach
  stage.inert = id === 'projects' || (id !== null && narrow.matches);
}

/** Beside an open page the room steps aside: it slides left and shrinks just
    enough that every object stays in view and in reach. */
function stepAside(on: boolean, animate: boolean): void {
  gsap.killTweensOf(stage);
  const moving = animate && motionOK();
  stage.style.removeProperty('--shrink');
  if (!on || narrow.matches) {
    if (moving) gsap.to(stage, { x: 0, y: 0, scale: 1, duration: 0.4, ease: 'power2.inOut', clearProps: 'transform,transformOrigin' });
    else gsap.set(stage, { clearProps: 'transform,transformOrigin' });
    return;
  }
  const gap = 16;
  const free = room.clientWidth - page.offsetWidth - gap * 3;
  const scale = Math.min(1, free / stage.offsetWidth);
  const to = {
    scale,
    x: gap + (free - stage.offsetWidth * scale) / 2 - stage.offsetLeft,
    y: (stage.offsetHeight * (1 - scale)) / 2,
  };
  gsap.set(stage, { transformOrigin: '0 0' });
  stage.style.setProperty('--shrink', scale.toFixed(3));
  if (moving) gsap.to(stage, { ...to, duration: 0.46, ease: 'power3.out' });
  else gsap.set(stage, to);
}

/** The page's own entrance: one drawn doodle, not a reveal on every block. */
function drawDoodle(id: string): void {
  const strokes = page.querySelectorAll(`[data-doodle="${id}"] path`);
  gsap.killTweensOf(strokes);
  if (!motionOK()) return;
  gsap.fromTo(strokes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, stagger: 0.12, delay: 0.25, ease: 'power1.inOut' });
}

function fillPage(id: string): void {
  page.dataset.id = id;
  page.setAttribute('aria-labelledby', `${id}-h`);
  mount(id, pageBody);
  pageBody.scrollTop = 0;
  drawDoodle(id);
}

function showPage(id: string, animate: boolean): void {
  gsap.killTweensOf(page);
  const turning = !page.hidden && page.dataset.id !== id;
  const old = page.dataset.id;
  page.hidden = false;

  if (!animate) {
    if (old && old !== id) unmount(old);
    fillPage(id);
    gsap.set(page, { clearProps: 'all' });
    return;
  }
  if (!motionOK()) {
    if (old && old !== id) unmount(old);
    fillPage(id);
    gsap.fromTo(page, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, clearProps: 'all' });
    return;
  }
  if (turning && old) {
    // another object clicked while a page is open: turn the page
    const swap = (): void => {
      unmount(old);
      fillPage(id);
    };
    const tl = gsap.timeline();
    if (narrow.matches) {
      tl.to(page, { yPercent: 105, duration: 0.2, ease: 'power2.in', onComplete: swap }).to(page, {
        yPercent: 0,
        duration: 0.34,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    } else {
      // a flat turn about the punched edge: no perspective in a flat drawing
      gsap.set(page, { transformOrigin: '0% 50%' });
      tl.to(page, { scaleX: 0.02, duration: 0.18, ease: 'power2.in', onComplete: swap }).to(page, {
        scaleX: 1,
        duration: 0.3,
        ease: 'power2.out',
        clearProps: 'transform,transformOrigin',
      });
    }
    return;
  }
  fillPage(id);
  gsap.fromTo(
    page,
    narrow.matches ? { yPercent: 105, xPercent: 0 } : { xPercent: 112, yPercent: 0, rotation: 2.5 },
    { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.46, ease: 'power3.out', clearProps: 'transform' },
  );
}

function hidePage(animate: boolean): void {
  gsap.killTweensOf(page);
  const id = page.dataset.id;
  const finish = (): void => {
    page.hidden = true;
    gsap.set(page, { clearProps: 'all' });
    // a newer open may have refilled the page while this one was leaving
    if (id && page.dataset.id === id) {
      unmount(id);
      delete page.dataset.id;
    }
  };
  if (page.hidden || !animate) return finish();
  if (!motionOK()) {
    gsap.to(page, { autoAlpha: 0, duration: 0.15, onComplete: finish });
    return;
  }
  gsap.to(page, {
    ...(narrow.matches ? { yPercent: 105 } : { xPercent: 112, rotation: 2.5 }),
    duration: 0.3,
    ease: 'power2.in',
    onComplete: finish,
  });
}

function show(id: string, animate: boolean): void {
  if (open === id) return;
  const from = open;
  open = id;
  mark(id);

  if (id === 'projects') {
    if (from) hidePage(animate);
    mount(id, screenBody);
    openScreen(animate);
    screen.focus({ preventScroll: true });
    return;
  }
  if (from === 'projects') closeScreen(false, () => unmount('projects'));
  if (animate) react(id);
  showPage(id, animate);
  stepAside(true, animate);
  page.focus({ preventScroll: true });
}

function hide(animate: boolean, refocus: boolean): void {
  const id = open;
  if (!id) return;
  open = null;
  mark(null);
  if (id === 'projects') closeScreen(animate, () => unmount('projects'));
  else {
    hidePage(animate);
    stepAside(false, animate);
  }
  if (refocus) opener(id)?.focus({ preventScroll: true });
}

/** Make the room match the URL. */
export function sync(animate: boolean): void {
  if (root.dataset.view !== 'room') return;
  const id = location.hash.slice(1);
  if (isPanel(id)) show(id, animate);
  else hide(animate, true);
}

/** Close whatever is open; the back button undoes our own history entry. */
export function close(): void {
  if (!open) return;
  if (history.state?.panel) {
    history.back();
  } else {
    history.replaceState(null, '', location.pathname + location.search);
    sync(true);
  }
}

/** Put every section back in the list, with no animation (for the list view). */
export function closeNow(): void {
  hide(false, false);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

export const openId = (): string | null => open;

/** On phones the page can be dragged down to put it away. */
function initGrab(): void {
  if (!grab) return;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let speed = 0;
  let dragging = false;
  grab.addEventListener('pointerdown', (e) => {
    dragging = true;
    startY = lastY = e.clientY;
    lastT = e.timeStamp;
    speed = 0;
    grab.setPointerCapture(e.pointerId);
    gsap.killTweensOf(page);
  });
  grab.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dt = Math.max(1, e.timeStamp - lastT);
    speed = (e.clientY - lastY) / dt;
    lastY = e.clientY;
    lastT = e.timeStamp;
    gsap.set(page, { y: Math.max(0, e.clientY - startY) });
  });
  const end = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    if (e.clientY - startY > 110 || speed > 0.6) close();
    else gsap.to(page, { y: 0, duration: 0.3, ease: 'back.out(2)', clearProps: 'transform' });
  };
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);
}

export function initPanels(): void {
  stage.querySelectorAll<HTMLButtonElement>('button[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.target;
      if (!id) return;
      if (open === id) return close();
      // swapping pages replaces our entry, so one "back" always returns to the room
      if (open) history.replaceState({ panel: true }, '', `#${id}`);
      else history.pushState({ panel: true }, '', `#${id}`);
      sync(true);
    });
  });
  room.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) close();
  });
  window.addEventListener('popstate', () => sync(true));
  narrow.addEventListener('change', () => mark(open));
  window.addEventListener('resize', () => {
    if (open && open !== 'projects') stepAside(true, false);
  });
  initGrab();
  sync(false);
}
