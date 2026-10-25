import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 文章集合。字段少是有意的：每多加一个必填字段，
 * 就多一次"想写但懒得填"的机会。
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // 首次发布，决定时间线排序与归档年份
    date: z.coerce.date(),
    // 改过就填。技术笔记会过时，页面上要诚实地显示出来
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // true 时构建会跳过；注意它仍然存在于 git 历史里
    draft: z.boolean().default(false),
    // 连载名，比如"建站笔记"
    series: z.string().optional(),
  }),
});

export const collections = { posts };
