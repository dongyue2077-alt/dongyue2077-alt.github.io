# 我的博客

纯静态个人博客：Astro 构建，Markdown 写作，产物是 HTML + CSS。
没有数据库、没有后台、没有常驻服务。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
npm run preview  # 预览构建结果
```

## 写一篇文章

在 `src/content/posts/` 新建一个 `.md` 文件，文件名就是 URL 里的 slug：

```
src/content/posts/my-first-post.md  →  /posts/my-first-post/
```

Frontmatter 字段：

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 标题 |
| `description` | 是 | 摘要，用于列表、meta、RSS |
| `date` | 是 | 首次发布，`YYYY-MM-DD`，决定排序和归档年份 |
| `updated` | 否 | 改过就填，页面会显示"更新于" |
| `tags` | 否 | 字符串数组，会自动生成标签页 |
| `draft` | 否 | `true` 时构建跳过该篇 |
| `series` | 否 | 连载名，页面显示为系列标记 |

示例：

```markdown
---
title: 标题
description: 一句话说明这篇在讲什么
date: 2026-10-25
tags: [随笔]
---

正文用 Markdown 写。
```

**注意**：`draft: true` 只影响构建，文件本身仍在 git 里。草稿不想被看到就别提交，或者把仓库设为私有。

## 记流水账

短记录不进文章列表，单独的时间线在 `/notes/`，首页也会显示最近 5 条。

```bash
# 记一笔，只写本地
bash scripts/note.sh "今天做了什么"

# 记一笔并立即发布（约 1 分钟后上线）
bash scripts/note.sh "今天做了什么" --push

# 内容里有引号时走 stdin，避免转义
printf '%s' "带 '引号' 的内容" | bash scripts/note.sh --push
```

存储是 `src/content/notes/YYYY-MM-DD.md`，一天一个文件，`- HH:MM 内容` 一行一条。
支持 `**粗体**`、`` `行内代码` `` 和裸链接，其余按纯文本处理。

**让 Hermes 学会这个动作**：仓库根目录的 [AGENTS.md](AGENTS.md) 已经写好了规则。
在仓库目录下启动 Hermes（或 `hermes --in ~/Desktop/dsh`），说"记一笔：……"，它就会调用脚本。

**注意**：仓库公开，记录即公开。写进去的东西会永久留在 git 历史里。

## 目录结构

```
src/
├── consts.ts              站点名、作者、导航 —— 改这里
├── content.config.ts      文章字段定义（Zod 校验）
├── content/posts/         ← 所有文章
├── content/notes/         ← 流水账，一天一个文件
├── layouts/BaseLayout.astro
├── components/PostCard.astro
├── utils/
│   ├── date.ts            日期格式化与按年分组
│   ├── notes.ts           流水账条目解析与行内渲染
│   └── url.ts             内部链接统一入口（处理 base）
├── pages/
│   ├── index.astro        首页（文章 + 最近记录）
│   ├── notes/index.astro  流水账时间线
│   ├── archive.astro      按年归档
│   ├── posts/[...slug].astro
│   ├── tags/              标签索引与标签页
│   ├── about.astro
│   ├── 404.astro
│   └── rss.xml.ts
└── styles/global.css      全部样式，手写，无 CSS 框架

scripts/note.sh            记一笔流水账
AGENTS.md                  给 Hermes 等 agent 的仓库约定
```

## 部署到 GitHub Pages

1. 把仓库推到 GitHub，分支用 `main`。
2. 按仓库名改 `astro.config.mjs`（见下表）。
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
4. push 后 `.github/workflows/deploy.yml` 会自动构建并发布。

| 仓库名 | `site` | `base` | 访问地址 |
|---|---|---|---|
| `<用户名>.github.io` | `https://<用户名>.github.io` | 不填 | `https://<用户名>.github.io/` |
| `blog`（任意名字） | `https://<用户名>.github.io` | `'/blog'` | `https://<用户名>.github.io/blog/` |

`base` 必须和仓库名一致——站内链接都由 `import.meta.env.BASE_URL` 生成，写错了会全站 404。
用自定义域名时，`base` 要去掉。

第一次构建大约 1–2 分钟，进度在仓库的 Actions 页面。

## 换自己的域名

1. 在仓库 Settings → Pages → Custom domain 填入域名。
2. 域名 DNS 加一条 CNAME 指向 `<用户名>.github.io`。
3. 把 `astro.config.mjs` 的 `site` 改成新域名，并去掉 `base`，重新构建。

用自定义域名后，需要先确认域名在大陆能访问——`github.io` 本身在部分网络下并不稳定。

## 想让搜索引擎收录

- 删掉 `public/robots.txt`
- 删掉 `src/layouts/BaseLayout.astro` 里的 `<meta name="robots" content="noindex, nofollow" />`

## 备选：搬到自己的服务器

静态站的迁移不影响内容和 URL。构建后把 `dist/` 同步到服务器，用 Nginx 托管即可：

```bash
npm run build
rsync -avz --delete dist/ user@host:/var/www/blog/
```

Nginx 需要的最小配置：

```nginx
server {
  listen 443 ssl http2;
  server_name your.domain;
  root /var/www/blog;
  index index.html;

  # Astro 的静态资源带哈希，可以长期缓存
  location /_astro/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location / {
    try_files $uri $uri/ $uri/index.html =404;
  }
}
```

## 已知取舍

- **没有评论、没有搜索**：文章少于三十篇时，归档页足够用。
- **样式手写**：没引 Tailwind，一个 `global.css` 管全站，改起来不需要懂构建配置。
- **`github.io` 在国内不稳定**：这是选 GitHub Pages 的唯一硬伤，换服务器可解。
