/**
 * 站点信息。改这里的名字和简介，全站（含 RSS）会一起变。
 */
export const SITE = {
  title: '我的博客',
  author: 'dongyue2077-alt',
  // 出现在首页、RSS 描述、meta description 里
  description: '长文与笔记。写给三年后的自己，也写给恰好路过的朋友。',
} as const;

/** 导航项。加页面时再往里塞，超过六项手机上会换行。 */
export const NAV = [
  { href: '/', label: '首页' },
  { href: '/notes/', label: '记录' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/', label: '标签' },
  { href: '/about/', label: '关于' },
] as const;
