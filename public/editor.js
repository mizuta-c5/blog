import MarkdownIt from 'https://esm.sh/markdown-it@14?bundle'
const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
})

const ta = document.getElementById('md')
const pv = document.getElementById('preview')
const render = () => {
    pv.innerHTML = md.render(ta.value || '')
}

render()
ta.addEventListener('input', render)