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
      <div class="post p-4 bg-white rounded-lg shadow-md mb-4">
        <a href="/post/${r.slug}" class="text-lg font-semibold text-gray-500 hover:text-gray-700"
          >${r.title}</a
        >
        <div class="text-sm text-gray-500">
          <small>${new Date((r.created_at as number) * 1000).toLocaleString()}</small>
        </div>
      </div>
    `,
  )
  return c.html(
    Layout(
      'Blog',
      html`
        ${Nav(user as { name: string } | null)}
        <h1 class="text-2xl font-bold mb-4">Blog</h1>
        ${list.length ? list : html`<p>No posts yet</p>`}
      `,
    ),
  )
})
