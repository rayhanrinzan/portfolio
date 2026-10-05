import { defineConfig } from 'astro/config';

// On Vercel, `site` is the project's production domain (the custom domain
// once one is added), which Vercel exposes to every build, previews included.
// Canonical, og:url and the absolute og:image URL are emitted only when it is
// set, so local builds stay root-relative.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export default defineConfig({
  output: 'static',
  site: productionHost ? `https://${productionHost}` : undefined,
});
