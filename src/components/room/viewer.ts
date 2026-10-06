// The gallery's expanded picture. A thumbnail is a plain link to its picture;
// here the link opens that picture in the big frame instead, with the room
// still showing around it.
import { gsap, motionOK } from './motion';

const viewer = document.querySelector<HTMLDialogElement>('[data-viewer]');
const img = viewer?.querySelector<HTMLImageElement>('[data-viewer-img]');
const count = viewer?.querySelector<HTMLElement>('[data-viewer-count]');
const thumbs = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-pic]'));

let at = 0;

function showPicture(n: number): void {
  if (!img || !count) return;
  at = (n + thumbs.length) % thumbs.length;
  const thumb = thumbs[at]?.querySelector('img');
  if (!thumb) return;
  img.width = thumb.width;
  img.height = thumb.height;
  img.src = thumb.currentSrc || thumb.src;
  img.alt = thumb.alt;
  count.textContent = `${at + 1} of ${thumbs.length}`;
}

/** Put the picture away. Safe to call when nothing is open. */
export function closeViewer(): void {
  if (viewer?.open) viewer.close();
}

export const viewing = (): boolean => viewer?.open ?? false;

export function initViewer(): void {
  if (!viewer || typeof viewer.showModal !== 'function') return;
  thumbs.forEach((thumb, n) => {
    thumb.setAttribute('aria-haspopup', 'dialog');
    thumb.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      showPicture(n);
      viewer.showModal();
      if (motionOK()) {
        gsap.fromTo(viewer, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'power2.out', clearProps: 'all' });
      }
    });
  });
  viewer.querySelector('[data-viewer-prev]')?.addEventListener('click', () => showPicture(at - 1));
  viewer.querySelector('[data-viewer-next]')?.addEventListener('click', () => showPicture(at + 1));
  viewer.querySelector('[data-viewer-close]')?.addEventListener('click', closeViewer);
  // A click on the room around the frame puts the picture away, and still
  // counts as a click on whatever was there: another object turns the page.
  viewer.addEventListener('click', (e) => {
    if (e.target !== viewer) return;
    closeViewer();
    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('button, a[data-pic]');
    under?.click();
  });
  document.addEventListener('keydown', (e) => {
    if (!viewer.open) return;
    if (e.key === 'ArrowLeft') showPicture(at - 1);
    else if (e.key === 'ArrowRight') showPicture(at + 1);
  });
}
