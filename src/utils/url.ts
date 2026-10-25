/**
 * 内部链接统一走 href()。
 *
 * GitHub Pages 的仓库如果不是 <用户名>.github.io，站点会挂在 /<仓库名>/ 下面，
 * 这时 astro.config 里的 base 会变成 '/blog/'，所有以 '/' 开头的链接都会失效。
 * 把路径集中到这一处，换部署位置时不用改页面。
 */
const rawBase = import.meta.env.BASE_URL; // '/' 或 '/blog/'
export const BASE = rawBase.replace(/\/+$/, ''); // '' 或 '/blog'

/** 生成带 base 的内部链接，参数以 '/' 开头 */
export function href(path: string): string {
  return `${BASE}${path}`;
}

/** 去掉 pathname 里已经存在的 base 前缀，避免重复拼接 */
export function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    return pathname.slice(BASE.length) || '/';
  }
  return pathname;
}
