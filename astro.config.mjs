// @ts-check
import { defineConfig } from 'astro/config';

// 部署到 GitHub Pages 时，site 要写成 https://<用户名>.github.io
// 将来换到自己的域名，只改这一行，其它地方都从 import.meta.env.SITE 读取。
export default defineConfig({
  site: 'https://dongyue2077-alt.github.io',
  build: {
    // 输出 /posts/hello-world/index.html，URL 可以带也可以不带结尾斜杠
    format: 'directory',
  },
  trailingSlash: 'ignore',
  markdown: {
    // 默认只挂 github-dark 一套主题，浅色页面的代码块也会被染成深色。
    // 给两套，由 prefers-color-scheme 决定用哪个。
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
