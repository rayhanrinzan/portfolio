# Build plan

Read `CLAUDE.md` first. One phase per session (use `/clear` between phases).
Start each phase in plan mode (Shift+Tab twice), show me the plan, then build.
End each UI phase with `/critique` and show me screenshots.

---

## Phase 0: Toolchain check

- Run `/mcp` and `/plugin` and list what's installed vs. what `CLAUDE.md`'s
  skill routing expects. If something's missing, point me to `setup.sh`;
  don't install things yourself.
- Read `content/profile.md` and list every `TODO(rinzan)`.

## Phase 1: Art direction (no production code)

1. Run `/impeccable init` so PRODUCT.md and DESIGN.md exist; reconcile them
   with `CLAUDE.md` (CLAUDE.md wins).
2. Build three quick throwaway HTML sketches of the room in `sketches/`,
   each a different composition (e.g. desk by window, corner with shelf,
   kitchen-table view). Same tokens, same line style.
3. Screenshot all three and recommend one. I pick.

## Phase 2: Scaffold

1. Astro (minimal, TS strict) in place. Content collections + zod schemas
   for projects and experience. Populate from `content/profile.md`, TODOs
   kept visible.
2. `tokens.css` (light + night), `@fontsource` fonts, base layout with meta,
   Open Graph tags, skip link, theme handling.
3. List view first: port `reference/v0-mockup.html` into Astro components
   using real content. Zero JS. This must be complete and good on its own.

## Phase 3: The room (static)

1. Draw the chosen room as layered SVG components in `src/components/art/`.
   If I've put drawings in `art/`, use mine.
2. Every object is a `<button>` with label, focus ring, accessible name.
3. Window sky states: morning, afternoon, golden hour, night (lamp on).
4. Responsive: on narrow screens the room crops/re-composes around the
   objects rather than shrinking to illegibility.

## Phase 4: Bring it to life

1. Boiling-line hover effect, object reactions, notebook-page panels
   (GSAP timelines, ≤600ms).
2. Ambient loops (clouds, steam, plant, cursor), paused when tab hidden.
3. Pointer parallax (desktop only).
4. Laptop "training run" mini-animation.
5. Deep links, back-button behavior, focus management, reduced-motion tier.
6. View toggle between room and list, remembered per visitor (localStorage,
   try/catch).

## Phase 5: Polish

1. `/impeccable polish`, then `/critique`.
2. Easter egg: pushable clouds in the window.
3. Open Graph image with `canvas-design` in the room style.
4. Remove one thing that isn't earning its place.

## Phase 6: Deploy to Vercel

Git is already set up: the public GitHub repo `portfolio` was created in
Phase 0 with `gh repo create`, and every phase since has landed on `main`
through a pull request (see "Git workflow" below).

1. Work on a `phase-6-deploy` branch. I run `vercel login` myself.
2. Walk me through importing the GitHub repo in Vercel (preset: Astro, build
   `npm run build`, output `dist`). Merging a PR into `main` = production;
   phase branches and PRs get preview URLs.
3. Optional (ask first): `@vercel/analytics`, custom domain.
4. Open the Phase 6 PR and give me the link. After I merge it, run the final
   `/critique` against the production URL.

---

## Git workflow (every phase after Phase 0)

- One branch per phase, named `phase-N-short-name` (e.g.
  `phase-1-art-direction`), cut from an up-to-date `main`.
- When the phase is done, push the branch, open a pull request with
  `gh pr create`, and give me the link.
- Never merge, and never push to `main` directly. I review and merge.
