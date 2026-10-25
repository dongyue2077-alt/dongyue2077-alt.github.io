/**
 * 统一日期格式为 YYYY-MM-DD。
 *
 * 不走 toLocaleDateString：构建机的时区会改变输出，
 * 比如 UTC 零点在 UTC-8 会退回前一天。这里直接取 ISO 日期部分。
 */
export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 按年份倒序分组，用于归档页 */
export function groupByYear<T extends { data: { date: Date } }>(items: T[]) {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const year = item.data.date.getUTCFullYear();
    const bucket = map.get(year);
    if (bucket) bucket.push(item);
    else map.set(year, [item]);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}
