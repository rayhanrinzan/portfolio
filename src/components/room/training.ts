// The training run on the laptop. The curve is the real loss of the net in
// net.ts, drawn on the little laptop in the room and, larger, on the projects
// screen, where the learning rate can be changed and the run restarted.
import { gsap, loop, motionOK, room, root } from './motion';
import { createNet, predictions, step, type Net } from './net';

const POINTS = 64;
const STEPS_PER_POINT = 6;
const HOLD_TICKS = 28;
/** Loss at the top edge of the chart; ln 2 (a coin flip) sits about halfway. */
const LOSS_TOP = 1.3;

interface Chart {
  line: SVGPolylineElement;
  x0: number;
  x1: number;
  top: number;
  bottom: number;
}

const charts: Chart[] = [];
const lossLabels = room.querySelectorAll<Element>('[data-loss]');
const predLabels = room.querySelectorAll<HTMLElement>('[data-pred]');
const predBars = room.querySelectorAll<HTMLElement>('[data-pred-bar]');
const keys = room.querySelectorAll<SVGLineElement>('.key');
const note = room.querySelector<HTMLElement>('[data-lr-note]');

let net: Net = createNet();
let lr = 0.5;
let losses: number[] = [];
let phase: 'train' | 'hold' | 'erase' = 'train';
let hold = 0;

function draw(): void {
  for (const { line, x0, x1, top, bottom } of charts) {
    const points = losses.map((loss, i) => {
      const x = x0 + ((x1 - x0) * i) / (POINTS - 1);
      const y = bottom - (bottom - top) * Math.min(1, loss / LOSS_TOP);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    // a polyline needs two points before it shows
    if (points.length === 1) points.push(points[0]!);
    line.setAttribute('points', points.join(' '));
  }
  const loss = losses[losses.length - 1] ?? 0;
  const text = `loss ${loss >= 10 ? loss.toFixed(1) : loss.toFixed(2)}`;
  lossLabels.forEach((label) => (label.textContent = text));
  predictions(net).forEach((p, i) => {
    const label = predLabels[i];
    if (label) label.textContent = p.toFixed(2);
    predBars[i]?.style.setProperty('--p', p.toFixed(3));
  });
}

function trainPoint(): void {
  let loss = 0;
  for (let i = 0; i < STEPS_PER_POINT; i++) loss = step(net, lr);
  losses.push(loss);
}

function tick(): void {
  if (phase === 'erase') return;
  if (phase === 'hold') {
    if (--hold <= 0) restart();
    return;
  }
  trainPoint();
  draw();
  const key = keys[Math.floor(Math.random() * keys.length)];
  if (key) gsap.fromTo(key, { y: 0 }, { y: 1.8, duration: 0.05, yoyo: true, repeat: 1, overwrite: true });
  if (losses.length >= POINTS) {
    phase = 'hold';
    hold = HOLD_TICKS;
    if (note) note.textContent = verdict();
  }
}

function reset(): void {
  net = createNet();
  losses = [];
  phase = 'train';
  if (note) note.textContent = WAITING;
}

/** Rub the old curve out, then start again with a fresh net. */
export function restart(): void {
  if (phase === 'erase') return;
  if (!motionOK()) {
    reset();
    finish();
    return;
  }
  phase = 'erase';
  const lines = charts.map((chart) => chart.line);
  gsap.to(lines, {
    drawSVG: '100% 100%',
    duration: 0.35,
    ease: 'power2.in',
    onComplete() {
      reset();
      lines.forEach((line) => line.setAttribute('points', ''));
      gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' });
    },
  });
}

/** Train straight to the end; the still version for reduced motion. */
function finish(): void {
  while (losses.length < POINTS) trainPoint();
  phase = 'hold';
  hold = Infinity;
  draw();
  if (note) note.textContent = verdict();
}

const WAITING = 'Turn it up and watch the loss bounce.';

/** A caption for the finished run, from what its loss actually did. */
function verdict(): string {
  const final = losses[losses.length - 1] ?? 0;
  let jumps = 0;
  for (let i = 1; i < losses.length; i++) if (losses[i]! > losses[i - 1]! * 1.05 + 0.01) jumps++;
  // worse than a coin flip (ln 2) only happens by overshooting
  if (final > 0.75) return 'Too high: the steps overshot and left the net far from the answer.';
  if (final > 0.3) {
    return jumps >= 3
      ? 'Too high this time: the steps overshot, so the loss jumped around instead of settling.'
      : 'Not there yet: the steps were too small, or it got stuck, and one run was not enough.';
  }
  return jumps >= 3 ? 'It got there, with some wild jumps on the way.' : 'Learned it: all four answers are right.';
}

export function initTraining(): void {
  const laptop = room.querySelector<SVGPolylineElement>('.obj-laptop [data-curve]');
  const big = room.querySelector<SVGPolylineElement>('.run-chart [data-curve]');
  if (laptop) charts.push({ line: laptop, x0: 478, x1: 708, top: 500, bottom: 628 });
  if (big) charts.push({ line: big, x0: 24, x1: 302, top: 14, bottom: 130 });

  const slider = room.querySelector<HTMLInputElement>('[data-lr]');
  const out = room.querySelector<HTMLElement>('[data-lr-out]');
  slider?.addEventListener('input', () => {
    lr = 10 ** Number(slider.value);
    if (out) out.textContent = lr >= 10 ? lr.toFixed(0) : lr >= 1 ? lr.toFixed(1) : lr.toFixed(2);
    // a new learning rate on a finished run starts a new one
    if (phase === 'hold') restart();
  });
  room.querySelector('[data-restart]')?.addEventListener('click', restart);

  if (!motionOK()) {
    finish();
    root.dataset.live = '';
    return;
  }
  losses = [];
  trainPoint();
  draw();
  root.dataset.live = '';
  loop(gsap.to({}, { duration: 0.1, repeat: -1, onRepeat: tick }));
}
