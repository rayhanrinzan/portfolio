import { defineConfig } from 'astro/config';

// TODO(rinzan): set `site` to the production URL once the Vercel project
// exists (Phase 6). Canonical and og:url tags are emitted only when it is set.
export default defineConfig({
  output: 'static',
});
