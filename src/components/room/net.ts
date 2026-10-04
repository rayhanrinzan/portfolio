// A real, very small neural net: 2 inputs, 4 tanh units, 1 sigmoid output,
// trained on XOR by full-batch gradient descent. No library.

const X = [[0, 0], [0, 1], [1, 0], [1, 1]] as const;
const Y = [0, 1, 1, 0] as const;
const H = 4;
const EPS = 1e-7;

export interface Net {
  w1: number[];
  b1: number[];
  w2: number[];
  b2: number;
}

export function createNet(): Net {
  const r = (): number => Math.random() * 2 - 1;
  return {
    w1: Array.from({ length: 2 * H }, r),
    b1: new Array<number>(H).fill(0),
    w2: Array.from({ length: H }, r),
    b2: 0,
  };
}

function forward(net: Net, x: readonly number[], hidden: number[]): number {
  let z = net.b2;
  for (let j = 0; j < H; j++) {
    hidden[j] = Math.tanh(net.w1[2 * j]! * x[0]! + net.w1[2 * j + 1]! * x[1]! + net.b1[j]!);
    z += net.w2[j]! * hidden[j]!;
  }
  return 1 / (1 + Math.exp(-z));
}

/** The net's answer for each of the four XOR inputs. */
export function predictions(net: Net): number[] {
  const hidden: number[] = [];
  return X.map((x) => forward(net, x, hidden));
}

/** One gradient-descent step. Returns the cross-entropy loss before the step. */
export function step(net: Net, lr: number): number {
  const g1 = new Array<number>(2 * H).fill(0);
  const gb1 = new Array<number>(H).fill(0);
  const g2 = new Array<number>(H).fill(0);
  const hidden: number[] = [];
  let gb2 = 0;
  let loss = 0;

  for (let i = 0; i < X.length; i++) {
    const x = X[i]!;
    const y = Y[i]!;
    const p = forward(net, x, hidden);
    const q = Math.min(1 - EPS, Math.max(EPS, p));
    loss -= y * Math.log(q) + (1 - y) * Math.log(1 - q);
    const dz = p - y;
    gb2 += dz;
    for (let j = 0; j < H; j++) {
      const h = hidden[j]!;
      g2[j]! += dz * h;
      const dh = dz * net.w2[j]! * (1 - h * h);
      g1[2 * j]! += dh * x[0];
      g1[2 * j + 1]! += dh * x[1];
      gb1[j]! += dh;
    }
  }

  const k = lr / X.length;
  for (let j = 0; j < H; j++) {
    net.w2[j]! -= k * g2[j]!;
    net.b1[j]! -= k * gb1[j]!;
    net.w1[2 * j]! -= k * g1[2 * j]!;
    net.w1[2 * j + 1]! -= k * g1[2 * j + 1]!;
  }
  net.b2 -= k * gb2;

  const mean = loss / X.length;
  return Number.isFinite(mean) ? mean : 16;
}
