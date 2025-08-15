import { Hono } from 'hono'
import { html, raw} from 'hono/html'
import { Layout } from '../components/Layout'
import { Nav } from '../components/Nav'
import { getUserFromCookie, requireAuth } from '../middleware/auth'
import { renderMarkdown } from '../lib/markdown'
import type { Bindings, Variables } from '../types'

export const post = new Hono<{Bindings: Bindings, Variables: Variables}>()

post.get('/:slug', async(c) => {
    const user = await getUserFromCookie(c)
    const slug= c.req.param('slug')
    const row = await c.env.DB.prepare('SELECT slug, title, content, created_at FROM posts WHERE slug = ?').bind(slug).first(
    )
    if (!row) {
        return c.notFound()
    }
    const r = row as any

    const controls = user ? html`<p><a href="/edit/${r.slug}">Edit</a>
    <form class="inline" method="post" action="/p/${r.slug}/delete" onsubmit="return confirm('Delete this post?')"><button type="submit">Delete</button></form></p>` : ''

    return c.html(Layout(r.title, html`${Nav(user)}<p><a href="/">Home</a></p>
    <h1>${r.title}</h1><div>
    <small>${new Date(((r.created_at) as number) * 1000).toLocaleString('ja-JP')}</small></div>
    <article class="prose">${raw(renderMarkdown(r.content))}</article>
    ${controls}
    `))
})

post.post('/p/:slug/delte', requireAuth, async (c) => {
    const slug = c.req.param('slug')
    await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
    return c.redirect('/')
})