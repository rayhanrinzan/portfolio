// The room island. Phase 3 keeps it small: the view toggle, the lamp, and an
// interim click that sends each object to its list-view section. Phase 4
// replaces that click with the notebook panels and adds GSAP.

const root = document.documentElement;

function daySky(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 17 && h < 20) return 'golden';
  return 'afternoon';
}

const lamp = document.querySelector<HTMLButtonElement>('[data-obj="lamp"]');

function setSky(sky: string): void {
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

// the object that sent the visitor to the list view; focus returns to it
let openedFrom: HTMLButtonElement | null = null;

function setView(view: 'room' | 'list'): void {
  root.dataset.view = view;
  if (view === 'room') {
    openedFrom?.focus();
    openedFrom = null;
  }
}

function showSection(id: string): void {
  const section = document.getElementById(id);
  if (!section) return;
  setView('list');
  section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
  section.scrollIntoView();
}

setSky(root.dataset.sky ?? 'afternoon');

lamp?.addEventListener('click', () => {
  setSky(root.dataset.sky === 'night' ? daySky() : 'night');
});

document.querySelectorAll<HTMLButtonElement>('button[data-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.target;
    if (!id) return;
    openedFrom = button;
    history.pushState(null, '', `#${id}`);
    showSection(id);
  });
});

document.querySelector('[data-view-toggle]')?.addEventListener('click', () => {
  if (root.dataset.view === 'room') {
    setView('list');
    window.scrollTo(0, 0);
  } else {
    history.replaceState(null, '', location.pathname + location.search);
    setView('room');
  }
});

// back / forward between the room and a section
window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (id) showSection(id);
  else setView('room');
});
