#!/usr/bin/env bash
#
# 记一条流水账，可选立即推送。
#
#   bash scripts/note.sh "今天做了什么"
#   bash scripts/note.sh "今天做了什么" --push
#   printf '%s' "内容里有 '引号' 时走这个" | bash scripts/note.sh --push
#
# 只做两件事：追加到当天的 Markdown 文件；--push 时提交并推送。
# 不做任何网络以外的判断，失败会直接报错退出。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOTES_DIR="$ROOT/src/content/notes"
TZ_NAME="${NOTE_TZ:-Asia/Shanghai}"

usage() {
  cat >&2 <<'EOF'
用法: note.sh '内容' [--push]

  --push    记录后立即 commit 并 push（约 1 分钟后上线）
  也可以把内容通过 stdin 传入，适合带引号的文本
EOF
}

PUSH=0
PARTS=()
for arg in "$@"; do
  case "$arg" in
    --push) PUSH=1 ;;
    -h | --help)
      usage
      exit 0
      ;;
    *) PARTS+=("$arg") ;;
  esac
done

if [ ${#PARTS[@]} -gt 0 ]; then
  TEXT="$(printf '%s ' "${PARTS[@]}")"
elif [ ! -t 0 ]; then
  TEXT="$(cat)"
else
  usage
  exit 1
fi

# 一条记录占一行：折叠换行，压缩空白
TEXT="$(printf '%s' "$TEXT" | tr '\n\r' '  ' | sed 's/[[:space:]]\{1,\}/ /g; s/^ //; s/ $//')"

if [ -z "$TEXT" ]; then
  echo "内容为空，什么都没记。" >&2
  exit 1
fi

DAY="$(TZ="$TZ_NAME" date +%Y-%m-%d)"
HHMM="$(TZ="$TZ_NAME" date +%H:%M)"
FILE="$NOTES_DIR/$DAY.md"

mkdir -p "$NOTES_DIR"
if [ ! -f "$FILE" ]; then
  printf -- '---\ndate: %s\n---\n\n' "$DAY" >"$FILE"
fi

printf -- '- %s %s\n' "$HHMM" "$TEXT" >>"$FILE"
echo "已记录 ${DAY} ${HHMM} → src/content/notes/${DAY}.md"

if [ "$PUSH" -eq 1 ]; then
  cd "$ROOT"

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "这里不是 git 仓库，只写入了文件。" >&2
    exit 0
  fi

  git add "$NOTES_DIR"

  if git diff --cached --quiet; then
    echo "内容没有变化，跳过提交。"
    exit 0
  fi

  git commit -q -m "note: ${DAY} ${HHMM}"
  git push -q origin HEAD
  echo "已推送，约 1 分钟后上线。"
fi
