import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})

const ta = document.getElementById('md')
const pv = document.getElementById('preview')
const render = () => {
  if (!pv) return // Ensure pv is not null
  pv.innerHTML = md.render((ta as HTMLTextAreaElement)?.value || '')
}

render()
if (ta) {
  ta.addEventListener('input', render)
}
