import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { Layout } from '../components/Layout'
import { Nav } from '../components/Nav'
import { renderMarkdown } from '../lib/markdown'
import { getUserFromCookie, requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

export const post = new Hono<{ Bindings: Bindings; Variables: Variables }>()

post.get('/post/:slug', async (c) => {
  const user = await getUserFromCookie(c)
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare(
    'SELECT slug, title, content, created_at FROM posts WHERE slug = ?',
  )
    .bind(slug)
    .first()
  if (!row) {
    return c.notFound()
  }
  const r = row as any

  const controls = user
    ? html`
        <div class="flex items-center gap-3 flex-wrap mt-4">
          <a
            href="/post/edit/${r.slug}"
            class="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4
            font-semibold text-white leading-none hover:bg-gray-700"
          >
            Edit
          </a>

          <form
            method="post"
            action="/post/${r.slug}/delete"
            onsubmit="return confirm('Delete this post?')"
            class="m-0"
          >
            <button
              type="submit"
              class="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4
                   font-semibold text-white leading-none hover:bg-gray-700"
            >
              Delete
            </button>
          </form>

          <a
            href="/"
            class="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4
            font-semibold text-white leading-none hover:bg-gray-700"
          >
            Back to Home
          </a>
        </div>
      `
    : ''

  return c.html(
    Layout(
      r.title,
      html`${Nav(user)}
        <h1 class="text-2xl font-bold mb-4">${r.title}</h1>
        <div>
          <small>${new Date((r.created_at as number) * 1000).toLocaleString('ja-JP')}</small>
        </div>
        <article class="prose">${raw(renderMarkdown(r.content))}</article>
        ${controls} `,
    ),
  )
})

post.post('/post/:slug/delete', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
  return c.redirect('/')
})
