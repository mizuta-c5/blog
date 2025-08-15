import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false, // XSS対策で生HTMLは禁止
  linkify: true, // 自動リンク
  typographer: true, // 引用符の変換
  breaks: true, // 改行を<br>に変換
})

export const renderMarkdown = (text: string) => md.render(text ?? '')