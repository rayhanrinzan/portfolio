# Design

`CLAUDE.md` is the source of truth; on conflict it wins. This file is a
transcription of its design rules, not a second authority. The code-level
source of truth for tokens will be `src/styles/tokens.css` (Phase 2).

## The world

A single illustrated room in soft sky-blue daylight, drawn in a thin, wobbly,
hand-drawn line style with flat fills: sky blue and yellow are the only colors, the rest neutral. Content opens as paper notebook
pages that slide over the room; never modals with dark overlays. The room
stays visible and alive behind them.

The laptop is the exception: clicking it zooms the camera into the screen,
which becomes the projects page. The lamp is a clickable object that toggles
day / night, overriding the local-time sky.

Room composition: sketch C, the kitchen-table view
(`sketches/c-kitchen-table.html`), chosen by Rayhan in Phase 1. A wide table
runs across the foreground with the laptop, mug, envelope and phone spread
out on it; the window, corkboard and two wall shelves sit on the wall behind;
a pendant lamp hangs between the window and the shelves; a chair back sits in
the foreground. The wall shelves stand in for the bookshelf (education).

## Color

Light (default):

| token        | hex       | use                                   |
|--------------|-----------|---------------------------------------|
| --sky        | #E4F2FC   | page / wall background                |
| --paper      | #F6FBFE   | notebook panels, surfaces             |
| --line       | #9DB7CC   | illustration strokes, dividers        |
| --ink        | #34495A   | body text (8.2:1 on --sky)            |
| --ink-soft   | #5A7083   | secondary text (4.5:1, AA minimum)    |
| --link       | #2F6E99   | link hover/focus (4.8:1)              |
| --accent-sky | #8CC8EE   | fills only, never text                |
| --yellow     | #F4D86A   | fills only                            |
| --sand       | #DDD2C0   | fills only                            |
| --stone      | #C7D3DB   | fills only                            |
| --sage       | #BFD0B8   | fills only, plant leaves              |

Night (dark mode and the night sky state):

| token      | hex     |
|------------|---------|
| --sky      | #1C2733 |
| --paper    | #253241 |
| --line     | #4F6578 |
| --ink      | #DDE9F3 |
| --ink-soft | #9FB4C6 |
| --link     | #8CC8EE |

Night fills: accent-sky #92C1DE, yellow #E6CF78, sand #B5AC9C, stone #7F93A5,
sage #93A88C. The lamp glow is a flat pale-yellow shape, not a blur.

`src/styles/tokens.css` also defines `--window` (#C1E1F6 light, #141C25 night),
the sky seen through the window: accent-sky at 40% over `--sky` in daylight, a
darker flat fill at night. Added in Phase 2; not yet in the `CLAUDE.md` table.

Check WCAG AA for any new color. Fill colors never carry text.

## Typography

- Klee One 600: headings and handwritten labels.
- Zen Maru Gothic 400 / 500 / 700: body.
- Self-hosted with `@fontsource`. Sentence case.
- Never Inter, Poppins, Montserrat, or system-ui as the visible face.

## Illustration

- Inline SVG components in `src/components/art/`, layered (wall, furniture,
  objects, foreground) so layers can parallax independently.
- Strokes: `var(--line)`, 2–2.4px, round caps and joins. Fills: fill tokens.
- Boiling line: a shared feTurbulence + feDisplacementMap filter whose seed
  steps through 3–4 values at about 8fps, on hovered or active objects only.
  Static otherwise.
- Drawings supplied in `art/` replace drawn ones; they are only vectorized,
  layered, and animated.
- Every interactive object is a real `<button>` with an accessible name
  ("Open projects (laptop)"), a visible focus ring that follows the object's
  outline, and a small handwritten label on hover/focus. The label names only
  the destination ("projects", "about"), never the object.
- All art is original. The third-party illustration that inspired the style
  is not recreated, traced, or imitated.

## Sky states

Two: the blue afternoon sky by day, and night (stars; the room lamp turns on).
A load without the entrance opens at night from 20 to 5 local time or in a
dark colour scheme, otherwise in daylight; the lamp toggles between them. The
state lives on `html[data-sky]`; `?sky=afternoon` or `?sky=night` forces one
for screenshots. The morning and golden-hour drawings were removed in Phase 5. The lamp shade is sand by day and yellow when lit.

## Room build (Phase 3)

- One page, two views: `html[data-view]` is `room` or `list`. Without JS the
  attribute is never set and the page is the list view.
- The room is a fixed stage grid scaled by one CSS unit `--u`. Landscape is
  sketch C at 1600 x 1000; portrait (viewport taller than wide) is an
  800 x 1600 re-composition of the same drawings, positioned in `room.css`.
- Every drawing is its own positioned element with `data-layer` (wall,
  furniture, glow, objects, foreground).
  Interactive ones are HTML `<button>`s wrapped around an inline SVG.
- The five labels that name a destination (experience, projects, education,
  about, contact) are always visible; "sky" and "night" show on hover/focus
  (always on touch screens).
- Clicking an object opens its section on a notebook page that slides over
  the room (from the right on wide screens, from the bottom on narrow ones).
  The section is the same element the list view shows, moved onto the page
  and put back on close, so the content exists once. Beside an open page the
  room slides left and shrinks so every object stays in reach; clicking
  another object turns the page. No overlay, ever.
- The laptop is the exception: the camera zooms into its screen, which
  becomes the projects page, and zooms back out on close.
- The URL hash is the state (`/#experience`); back closes, Escape closes,
  focus returns to the object. The room / list choice is remembered in
  localStorage.
- The list-view header drawing (`DeskScene.astro`) is the same room in
  miniature: the same art components at the landscape positions, scaled by
  container width, with nothing to click.

## Motion

Wanted:

- Hover/focus: object boils, lifts 2–4px, label appears.
- Click: a GSAP timeline of at most 600ms where the object reacts (laptop lid
  opens, mug steams harder, sticky note peels) and the notebook page slides in.
- Ambient, all subtle: cloud drift, mug steam, plant sway, occasional blink of
  the laptop cursor. Everything pauses when the tab is hidden.
- Pointer parallax on desktop: layers shift at most 6–12px.
- Laptop screen: a live training run. It is real: a 2-4-1 net learning XOR by
  gradient descent in the browser (`net.ts`); the curve and number are its
  loss. On the projects screen the run can be restarted and its learning rate
  changed.
- Day / night is a scene change: colours cross-fade (View Transitions where
  supported), the moon or sun rises, stars pop in, the light cone unfolds.
- Entrance on every load of the room: the wall, shelves, window and chair
  are simply there. The things on the table pop into the air one by one,
  left to right, each with a burst of short pop lines, then drop onto the
  table together; the lamp comes down on its cord at the same moment and
  swings. About 1.2s, clickable throughout. The room opens in daylight and,
  a beat after the landing, the lamp switches on and it becomes night.
- Toys, all optional and pointer-driven: a fast sweep of the pointer makes a
  breeze (notes flutter, steam bends, plant leans, lamp sways); books nudge
  as the pointer runs along them; the envelope opens on hover; the lamp can
  be pulled and swings like a pendulum; clouds can be pushed around the
  window, and at night a drag throws a shooting star. When nobody touches
  the room for a while it fidgets a little.
- Watering the plant: by day a watering can stands on the table. It pops in
  when the lamp is switched off and out again at night, and is never there at
  load. Hovering the plant dims the room (a flat scrim, the only one on the
  site) around the plant and the can, with the hint "Try watering the plant";
  the hint stops once the plant has been watered. Drag the can to the plant,
  or click / tap / press Enter on it, and it pours: water falls, the sun
  slides to the middle of the window and lights up behind a flat corona
  (discs and drawn strokes, no blur), three flat shafts of light shoot to the
  plant with pulses running down them and glints where they land, and the
  plant grows. It starts as a sprout and is full grown after three waterings,
  with a new leaf on each of the last two. Daytime is always the blue
  afternoon sky.
  In the portrait room the can stands left of the laptop.
- Room and list: the room folds down into the miniature drawing that heads
  the list view, and grows back out of it.
- Every drawing sits on its own compositor layer and anything that moves
  continuously lives outside the wobble filter (see the stacked `.art.top`
  drawings), so motion never re-runs the filter.

Banned:

- Scroll-jacking, custom cursors, cursor trails, preloaders over 300ms,
  autoplaying sound, particle backgrounds, typing-effect text.
- Fade-and-slide-up on every block, hover lift on every element.
- Anything that drops below 60fps on a mid-range phone.

`prefers-reduced-motion`: no parallax, no boiling, no ambient loops, no
entrance, no toys; panels and the laptop zoom become a 150ms cross-fade; the
training run is shown finished. The room stays clickable.

## Hard bans

- No gradients, glassmorphism, glows, blurred blobs, neon, drop shadows.
- No identical rounded cards, no ALL-CAPS eyebrow labels, no 01/02/03 markers
  on non-sequences, no single highlighted word in a headline.
- No emoji icons, no icon libraries. Original SVG doodles only.
- No skill bars or proficiency percentages.

## List view

A plain single-column page with all content, reachable from a persistent,
obvious toggle. Starting point: `reference/v0-mockup.html`. Ships zero JS.
