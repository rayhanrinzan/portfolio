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
Phase 3 added two more values for it: #CEE8F8 in the morning (accent-sky at
25% over `--sky`) and #EBE6BA at golden hour (yellow at 45% over `--sky`).

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

Morning (5 to 11), afternoon (11 to 17), golden hour (17 to 20), night (stars;
the room lamp turns on). Follows the visitor's local time; afternoon if
unknown. A dark colour scheme shows the night room whatever the time. The
state lives on `html[data-sky]`; `?sky=morning` etc. forces one for
screenshots. The lamp shade is sand by day and yellow when lit.

## Room build (Phase 3)

- One page, two views: `html[data-view]` is `room` or `list`. Without JS the
  attribute is never set and the page is the list view.
- The room is a fixed stage grid scaled by one CSS unit `--u`. Landscape is
  sketch C at 1600 x 1000; portrait (viewport taller than wide) is an
  800 x 1600 re-composition of the same drawings, positioned in `room.css`.
- Every drawing is its own positioned element with `data-layer` (wall,
  furniture, glow, objects, foreground) and `data-drop` (entrance order).
  Interactive ones are HTML `<button>`s wrapped around an inline SVG.
- Labels show on hover/focus; on touch screens (no hover) they stay visible.
- Until the notebook panels exist, clicking an object opens its section in
  the list view; the back button returns to the room and to that object.
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
- Laptop screen: a tiny live training run, a loss curve that redraws with a
  loss number ticking down.

Banned:

- Scroll-jacking, custom cursors, cursor trails, preloaders over 300ms,
  autoplaying sound, particle backgrounds, typing-effect text.
- Fade-and-slide-up on every block, hover lift on every element.
- Anything that drops below 60fps on a mid-range phone.

`prefers-reduced-motion`: no parallax, no boiling, no ambient loops; panels
cross-fade instantly. The room stays clickable.

## Hard bans

- No gradients, glassmorphism, glows, blurred blobs, neon, drop shadows.
- No identical rounded cards, no ALL-CAPS eyebrow labels, no 01/02/03 markers
  on non-sequences, no single highlighted word in a headline.
- No emoji icons, no icon libraries. Original SVG doodles only.
- No skill bars or proficiency percentages.

## List view

A plain single-column page with all content, reachable from a persistent,
obvious toggle. Starting point: `reference/v0-mockup.html`. Ships zero JS.
