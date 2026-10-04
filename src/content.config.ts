import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// "2026-08"
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    org: z.string(),
    location: z.string().optional(),
    roles: z
      .array(
        z.object({
          title: z.string(),
          start: month,
          // omitted means the role is current
          end: month.optional(),
        }),
      )
      .min(1),
    // newest first, 1 = top
    order: z.number().int(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tools: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
    order: z.number().int(),
  }),
});

export const collections = { experience, projects };
