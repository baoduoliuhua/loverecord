import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: z.object({
    title: z.string(),
    date: z.string(), // 显示用日期，如 2025.05.20
    sortDate: z.string(), // 排序用，YYYY-MM-DD
    scene: z.enum(['default', 'seaside', 'mountain', 'city', 'spring', 'summer', 'autumn', 'winter', 'rain', 'fireworks', 'starlight']).default('default'),
    image: z.string().optional(),
    alt: z.string().default(''),
    city: z.string().optional(),
    side: z.enum(['left', 'right']).default('left'),
    tilt: z.enum(['tilt-l', 'tilt-r', 'tilt-ls', 'tilt-rs']).default('tilt-ls'),
  }),
});

export const collections = { timeline };
