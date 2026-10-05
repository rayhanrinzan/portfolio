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

export const pictures: Picture[] = [];

/** How many empty frames to show until there are pictures. */
export const placeholders = 4;
