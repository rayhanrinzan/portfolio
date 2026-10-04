# Rayhan Rinzan — portfolio

An explorable, hand-drawn illustrated room that doubles as my portfolio for
CS / ML / AI / data science internship recruiting.

Audience: recruiters (30–90 seconds, want facts fast) and engineers (will poke
around and enjoy details). The site must serve both: immersive for explorers,
instantly scannable for skimmers.

Read `PLAN.md` for the build phases. One phase at a time; stop for my review
at the end of each phase. Profile data: `content/profile.md`.

## Concept: "the room"

The homepage is a single illustrated room in soft sky-blue daylight, drawn in
a thin, wobbly, hand-drawn line style with flat pastel fills. Visitors explore
by clicking objects:

| object                  | opens                    |
|-------------------------|--------------------------|
| laptop                  | projects (camera zooms into the screen) |
| corkboard / sticky notes| experience               |
| bookshelf               | education + coursework   |
| mug                     | about me                 |
| phone / envelope        | contact + résumé         |
| window                  | just the sky (easter egg: clouds you can push around) |
| lamp                    | nothing; toggles day / night |

Panels open as paper notebook pages that slide over the room, never as modals
with dark overlays. The room stays visible and alive behind them.

The laptop is the exception: clicking it zooms the camera into the screen,
and the screen becomes the projects page. Closing it zooms back out to the
room.

The sky in the window follows the visitor's local time: morning, afternoon,
golden hour, night (stars, the room lamp turns on). Default to afternoon if
time is unknown.

The lamp is clickable and toggles day / night by hand, overriding the
local-time sky.

Laptop screen shows a tiny live "training run": a loss curve that redraws,
with a loss number ticking down. Clicking it while on the projects page
restarts the run.

A persistent, obvious "list view" toggle shows all content as a plain,
single-column page (the v0 mockup layout). This is also the no-JS,
reduced-motion, and screen-reader-first experience. Recruiters must never be
forced to explore to find my experience.

`reference/v0-mockup.html` is the earlier prototype: use it as the list view's
starting point and as the illustration style reference.

The original art-style inspiration is a third-party illustration. Do not
recreate, trace, or imitate its character. All art must be original.

## Stack

- Astro (static output) + TypeScript strict. Plain CSS with custom properties.
  No Tailwind, no UI kit, no component library, no React.
- GSAP (free incl. all plugins) for SVG motion: DrawSVG for line draw-ins,
  MorphSVG for subtle shape changes, timelines for panel transitions. Load it
  only in the room island.
- All interactive code in one client island (`src/components/room/`). The
  list view ships zero JS.
- Content in `src/content/` collections (Markdown + zod schemas).
- Deploy: Vercel, static. No server code.

## Visual tokens (source of truth: `src/styles/tokens.css`)

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
| --pink       | #F3BCC6   | fills only                            |
| --green      | #B5D98A   | fills only                            |

Night (dark mode and the night sky state): bg #1C2733, paper #253241,
line #4F6578, ink #DDE9F3, ink-soft #9FB4C6, link #8CC8EE; pastels about 15%
less saturated; lamp glow is a flat pale-yellow shape, not a blur.

Check WCAG AA for any new color. Pastels never carry text.

Type: Klee One 600 for headings and handwritten labels; Zen Maru Gothic
400/500/700 for body. Self-host with `@fontsource`. Sentence case.

## Illustration rules

- Inline SVG components in `src/components/art/`, layered (wall, furniture,
  objects, foreground) so layers can parallax independently.
- Strokes: `var(--line)`, 2–2.4px, round caps/joins. Fills: pastel tokens.
- "Boiling line" effect: a shared feTurbulence + feDisplacementMap filter
  whose seed steps through 3–4 values at about 8fps on hovered or active
  objects only (classic hand-drawn animation). Static otherwise.
- If I provide my own drawings in `art/`, use them instead of drawing; only
  vectorize, layer, and animate them.
- Every interactive object is a real `<button>` with an accessible name
  ("Open projects (laptop)"), visible focus ring that follows the object's
  outline, and a small handwritten label on hover/focus.

## Interaction and motion rules

Allowed, and wanted:
- Hover/focus: object boils, lifts 2–4px, label appears.
- Click: a short GSAP timeline (≤600ms) where the object reacts (mug steams
  harder, sticky note peels) and the notebook page slides in.
- Laptop click: the camera zooms into the laptop screen, which becomes the
  projects page.
- Lamp click: toggles day / night.
- Ambient life, all subtle: cloud drift, mug steam, plant sway, occasional
  blink of the laptop cursor. Pause everything when the tab is hidden.
- Pointer parallax on desktop: layers shift at most 6–12px.
- Deep links: `/#projects`, `/#experience` etc. open the right panel; back
  button closes it.

Banned:
- Scroll-jacking, custom cursors, cursor trails, preloaders over 300ms,
  sound that autoplays, particle backgrounds, typing-effect text.
- Fade-and-slide-up on every block, hover lift on every element.
- Anything that drops below 60fps on a mid-range phone.

`prefers-reduced-motion`: no parallax, no boiling, no ambient loops; panels
cross-fade instantly, and the laptop zoom becomes a cross-fade too. Room still
clickable.

## Anti-slop rules (hard requirements)

- No gradients, glassmorphism, glows, blurred blobs, neon, drop shadows.
- No identical rounded cards, no ALL-CAPS eyebrow labels, no 01/02/03
  markers on non-sequences, no single highlighted word in a headline.
- No emoji icons, no icon libraries. Original SVG doodles only.
- No skill bars or proficiency percentages.
- No filler copy: passionate, leveraging, cutting-edge, seamless, innovative,
  "turning ideas into reality", "Hi, I'm X 👋".
- No Inter, Poppins, Montserrat, or system-ui as the visible face.

## Skill routing (several design skills are installed; this decides who leads)

1. This file wins every conflict. Tokens, fonts, and concept above are fixed.
2. `impeccable` leads design work: use its craft / audit / polish commands.
3. `design-taste-frontend` is the second opinion: run it as a critic after
   impeccable, don't let it restyle.
4. Anthropic `frontend-design`: background principles only.
5. `ui-ux-pro-max`: UX guideline lookups only. Never adopt its palettes,
   font pairings, or style presets.
6. GSAP skills (`gsap-core`, `gsap-timeline`, `gsap-plugins`,
   `gsap-performance`) for all animation code; `accessible-animation` and
   `60fps-animation` for reduced-motion tiers and performance checks.
7. `canvas-design` for the Open Graph share image (1200×630) in the room style.
8. `algorithmic-art` only if we try a generative sky/cloud texture.
9. QA: `web-design-guidelines`, `webapp-testing`, Playwright MCP
   (screenshots), Chrome DevTools MCP (performance traces, Lighthouse).
10. Deploy: Vercel plugin.

## Content rules

- Facts only from `content/profile.md` and my answers. Never invent employers,
  dates, titles, metrics, or links. Missing info stays as a visible
  `TODO(rinzan):` and goes in your phase summary.
- Project entries: what it does, what was hard, one concrete result, tools,
  links. First person, plain verbs.

## Quality bar (every phase that touches UI)

1. Playwright screenshots at 375 / 768 / 1280 / 1920, morning + night sky,
   room view + list view, one panel open. Look at them and fix issues.
2. Run the `design-critic` subagent (`.claude/agents/design-critic.md`).
3. Chrome DevTools MCP performance trace while hovering and opening panels:
   no long tasks over 50ms, no layout shift. Lighthouse mobile 90+ perf
   (room view), 100 accessibility, 95+ elsewhere.
4. Keyboard-only run: tab through every object, open and close each panel
   with Enter/Escape, focus returns to the object.
5. `npm run build` with no warnings.

## Commands

- `npm run dev` (http://localhost:4321), `npm run build`, `npm run preview`
- `/critique` runs the full quality bar.
- Deploys go through Vercel's GitHub integration on push to `main`.
  Never run a production deploy without asking me.
