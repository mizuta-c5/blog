import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/Layout'
import { Nav } from '../components/Nav'
import { getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types'
export const home = new Hono<{ Bindings: Bindings; Variables: Variables }>()

home.get('/', async (c) => {
  const user = await getUserFromCookie(c)
  const { results } = await c.env.DB.prepare(
    'SELECT slug, title, created_at FROM posts ORDER BY created_at DESC',
  ).all()
  const list = (results as any[]).map(
    (r) => html`
      <div class="post">
        <a href="/${r.slug}"><strong>${r.title}</strong></a>
        <div><small>${new Date((r.created_at as number) * 1000).toLocaleString()}</small></div>
      </div>
    `,
  )
  return c.html(
    Layout(
      'Blog',
      html`
        ${Nav(user as { name: string } | null)}
        <h1>Blog</h1>
        ${list.length ? list : html`<p>No posts yet</p>`}
      `,
    ),
  )
})
