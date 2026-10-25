# 仓库约定

个人静态博客，Astro 构建，站点 https://dongyue2077-alt.github.io/
push 到 `main` 后由 GitHub Actions 自动构建发布，约 1 分钟生效。

## 记流水账

用户说「记一笔」「记一下」「记流水账」这类话时，**不要自己编辑 `src/content/notes/` 下的文件**，一律调用脚本：

```bash
cd /Users/tengxiao/Desktop/dsh
bash scripts/note.sh '要记的内容' --push
```

内容里有单引号、反引号、`$` 等字符时，改用 stdin 传入：

```bash
printf '%s' '要记的内容' | bash scripts/note.sh --push
```

规则：

- 把内容压缩成一句话，保留用户的原意和语气；不要加"用户说""记录如下"这类转述
- 不要改 frontmatter、文件名或时间戳，这些由脚本负责
- 脚本会打印记录的时间，成功后用一行话把时间回报给用户
- push 失败时如实报告，不要重试超过一次，也不要绕道去改 GitHub 上的文件

## 写长文

长文放 `src/content/posts/`，frontmatter 字段见 `README.md`。
写完直接 `git add -A && git commit -m "post: 标题" && git push`。
