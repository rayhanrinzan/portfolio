// Pictures for the gallery (the picture frame on the shelf). Put the image
// files in public/gallery/ and list them here, in the order they should show.
// While the list is empty the gallery shows visible TODO(rinzan) placeholders.
export interface Picture {
  /** Path under public/, e.g. '/gallery/lake.jpg'. */
  src: string;
  /** What the picture shows, for people who cannot see it. */
  alt: string;
  caption?: string;
  /** CSS object-position for the 4:3 crop, when the middle is the wrong part. */
  focus?: string;
  width: number;
  height: number;
}

export const pictures: Picture[] = [
  {
    src: '/gallery/friends-gym.webp',
    alt: 'Eight friends in college shirts, three of them Cornell, posing on a gym floor under rows of championship banners.',
    width: 900,
    height: 1200,
  },
  {
    src: '/gallery/pizza.webp',
    alt: 'Someone at an outdoor restaurant table, looking at the camera over a half-eaten margherita pizza.',
    width: 1200,
    height: 569,
  },
  {
    src: '/gallery/lake.webp',
    alt: 'A selfie of four people smiling on a dock, with a blue lake and a sky full of small clouds behind them.',
    width: 1200,
    height: 900,
  },
  {
    src: '/gallery/park.webp',
    alt: 'A selfie of two people smiling in a park, with a fountain in a pond behind them.',
    width: 1200,
    height: 900,
  },
  {
    src: '/gallery/pasta.webp',
    alt: 'A plate of pesto fettuccine topped with a seared chicken thigh and a sprig of cilantro.',
    width: 1200,
    height: 900,
  },
  {
    src: '/gallery/rowing.webp',
    alt: 'An eight-person rowing crew and their coxswain on choppy blue water, seen from above.',
    width: 1200,
    height: 677,
  },
  {
    src: '/gallery/beach.webp',
    alt: 'Someone walking barefoot across the sand towards the sea, with ships on the horizon under a wide blue sky.',
    width: 900,
    height: 1200,
  },
  {
    src: '/gallery/frog-statue.webp',
    alt: 'Someone in sunglasses smiling next to a bronze statue of a frog in a flat cap, leaning on a cane outside an art gallery.',
    width: 900,
    height: 1200,
    focus: 'center 30%',
  },
];

/** How many empty frames to show until there are pictures. */
export const placeholders = 4;
