# Product

<!-- impeccable:product-schema 1 -->

`CLAUDE.md` is the source of truth for this project. Where this file and
`CLAUDE.md` disagree, `CLAUDE.md` wins.

## Platform

web

## Stack

Astro (static output) with TypeScript strict. Plain CSS with custom
properties. GSAP for SVG motion, loaded only in the room island. Content in
`src/content/` collections (Markdown + zod). Deployed to Vercel as a static
site; no server code. No Tailwind, UI kit, component library, or React.

## Users

- Recruiters screening for CS / ML / AI / data science internships. They spend
  30–90 seconds and want facts fast: school, experience, projects, contact,
  résumé.
- Engineers who will poke around and enjoy the details.

## Product Purpose

Rayhan Rinzan's portfolio for internship recruiting. It presents education,
experience, projects, and contact details. Success means a recruiter finds
the experience and a way to get in touch without having to explore, and an
engineer who does explore finds it rewarding.

Recruiting target: TODO(rinzan): season and role types (e.g. summer 2027
internships in ML / AI / data science / SWE).

## Positioning

The homepage is a single hand-drawn room that visitors explore by clicking
objects, and the same content is always one obvious toggle away as a plain
single-column list. Both are first-class.

## Operating Context

- Object-to-content map: laptop → projects; corkboard / sticky notes →
  experience; bookshelf → education + coursework; mug → about me; picture
  frame → gallery of pictures; trophy → awards; phone /
  envelope → contact + résumé; window → the sky (easter egg).
- Content opens as paper notebook pages that slide over the room. The room
  stays visible behind them.
- The window sky is the blue afternoon by day and stars at night; the lamp
  toggles between them.
- Deep links (`/#projects`, `/#experience`, …) open the matching panel; the
  back button closes it.
- The list view is also the no-JS, reduced-motion, and screen-reader-first
  experience, and ships zero JS.

## Capabilities and Constraints

- Static site only. All interactive code lives in one client island
  (`src/components/room/`).
- Facts come only from `content/profile.md` and Rayhan's answers. Nothing is
  invented; missing information stays as a visible `TODO(rinzan):`.
- All art is original. If Rayhan supplies drawings in `art/`, they are used
  instead of drawn ones.
- Project entries: what it does, what was hard, one concrete result, tools,
  links. First person, plain verbs.
- Production deploys happen only on merge to `main`, by Rayhan.

## Brand Commitments

- Name: Rayhan Rinzan.
- Voice: first person, plain verbs, sentence case. No filler copy
  (passionate, leveraging, cutting-edge, seamless, innovative, "turning ideas
  into reality", "Hi, I'm X").
- Visual tokens, typefaces, and the room concept are fixed in `CLAUDE.md` and
  recorded in `DESIGN.md`.

## Evidence on Hand

From `content/profile.md` (LinkedIn extract, 2026-10-04):

- Cornell University, BS Computer Science, 2025–2029, with coursework list.
- Five roles with titles and dates: IMGNi (Software Engineer Intern), Cornell
  AutoBoat Project Team (Software Engineer; Electrical Systems), Weill Cornell
  Medicine (Machine Learning Research Intern), Syracuse University College of
  Engineering and Computer Science (Robotics Systems Engineer), SUNY Oswego
  (Computational Research Intern).
- Email and LinkedIn URL.
- `reference/v0-mockup.html`: list-view starting point and illustration style
  reference.

Absent, and not to be fabricated:

- TODO(rinzan): GitHub URL.
- TODO(rinzan): résumé PDF at `public/resume.pdf`.
- TODO(rinzan): recruiting target ("looking for").
- TODO(rinzan): a "what I did + result" line for every experience entry.
- TODO(rinzan): 2–4 projects (name, description, what was hard, one result,
  tools, links).
- No drawings in `art/` yet.
- Intro copy in `content/profile.md` is a suggestion; not approved for
  publishing.

## Product Principles

1. Recruiters are never forced to explore. Every fact is reachable from the
   list view in one click from anywhere.
2. The room rewards curiosity without hiding anything.
3. Facts only. A visible TODO beats an invented detail.
4. The list view must be complete and good on its own.
5. Subtle over showy: nothing that costs frame rate or attention.

## Accessibility & Inclusion

WCAG AA contrast for all text (fill colors never carry text). Every room object
is a real `<button>` with an accessible name and a visible focus ring.
Full keyboard operation (Tab, Enter, Escape; focus returns to the object).
`prefers-reduced-motion`: no parallax, no boiling, no ambient loops; panels
cross-fade instantly. Lighthouse accessibility target: 100.
