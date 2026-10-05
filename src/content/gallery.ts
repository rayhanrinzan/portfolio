// Pictures for the gallery (the picture frame on the shelf). Put the image
// files in public/gallery/ and list them here, in the order they should show.
// While the list is empty the gallery shows visible TODO(rinzan) placeholders.
export interface Picture {
  /** Path under public/, e.g. '/gallery/lake.jpg'. */
  src: string;
  /** What the picture shows, for people who cannot see it. */
  alt: string;
  caption?: string;
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
];

/** How many empty frames to show until there are pictures. */
export const placeholders = 4;
