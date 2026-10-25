/**
 * 流水账条目的解析与渲染。
 *
 * 一天一个 Markdown 文件，正文形如：
 *   - 09:12 写了点东西
 *   - 14:30 另一件事
 *
 * 之所以自己解析而不是整篇交给 Markdown 渲染：
 * 时间戳要单独排成一列，必须拆开才能给每个条目套结构。
 */

export interface NoteEntry {
  /** HH:MM，没有时间前缀时为 undefined */
  time?: string;
  /** 渲染后的 HTML（只允许行内格式） */
  html: string;
  /** 纯文本，用于 RSS 和空内容判断 */
  text: string;
}

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPE[c]);

/**
 * 极简行内 Markdown：`code`、**粗体**、裸链接。
 *
 * 故意不支持完整语法——流水账里出现表格或标题的概率极低，
 * 而每多一条规则就多一种把用户的字吃掉的可能。
 */
export function renderInline(raw: string): string {
  // 先把 code 抽出来占位，避免里面的 * 和 URL 被后面的规则误伤
  const codes: string[] = [];
  let text = raw.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(escapeHtml(code));
    return `\u0000${codes.length - 1}\u0000`;
  });

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]*[^\s<.,;:!?。，、；：！？）)】」])/g, (url) => {
      return `<a href="${url}" rel="noopener" target="_blank">${url}</a>`;
    });

  return text.replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code>${codes[Number(i)]}</code>`);
}

/** 把一天的正文拆成条目，保持文件内的原始顺序（旧 → 新） */
export function parseNoteEntries(body: string): NoteEntry[] {
  const entries: NoteEntry[] = [];

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    // 支持 `- 09:12 内容` / `- 内容` / 无项目符号的纯段落
    const matched = line.match(/^[-*]\s+(?:(\d{1,2}:\d{2})\s+)?(.*)$/);
    const time = matched?.[1];
    const text = (matched?.[2] ?? line).trim();
    if (!text) continue;

    entries.push({ time, html: renderInline(text), text });
  }

  return entries;
}

/** 时间戳列宽固定，避免没有时间的那行把正文顶歪 */
export const padTime = (time?: string) => time ?? '';

/** 只依赖这三个字段，避免把页面和 content collection 的类型绑死 */
export interface NoteSource {
  id: string;
  data: { date: Date };
  body?: string;
}

export interface NoteDay {
  id: string;
  date: Date;
  entries: NoteEntry[];
}

/** 按天分组，日期倒序（最新的一天在最上面） */
export function groupNotes(sources: NoteSource[]): NoteDay[] {
  return [...sources]
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((source) => ({
      id: source.id,
      date: source.data.date,
      entries: parseNoteEntries(source.body ?? ''),
    }))
    // 空文件不占位置
    .filter((day) => day.entries.length > 0);
}

/** 跨天取最近 N 条，返回最新在前 */
export function latestEntries(days: NoteDay[], limit: number) {
  const flat: { date: Date; entry: NoteEntry }[] = [];
  // days 是新→旧，反过来展平才能保证"旧→新"的真实顺序
  for (const day of [...days].reverse()) {
    for (const entry of day.entries) {
      flat.push({ date: day.date, entry });
    }
  }
  return flat.slice(-limit).reverse();
}
