import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/Layout'
import { slugify } from '../lib/slugify'
import { requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

export const editor = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 新しい記事を作成するページを表示する
editor.get('/new', async (c) => {
  return c.html(
    Layout(
      'New Post',
      html`
        <h1 class="text-2xl font-bold mb-4">New Post</h1>
        <form method="post" action="/new" class="flex flex-col gap-4">
          <input name="title" placeholder="Title" required class="w-full p-3 font-mono border rounded-lg" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="content"
              id="md"
              rows="18"
              required
              class="w-full p-3 font-mono border rounded-lg resize-none"
              placeholder="Write in Markdown..."
            ></textarea>
            <div
              id="preview"
              class="w-full p-3 bg-white border rounded-lg overflow-auto prose resize-none"
            ></div>
            <button type="submit" class="mt-3">Create</button>
          </div>
        </form>
        <script type="module" src="/editor.js"></script>
      `,
      { wide: true },
    ),
  )
})

editor.post('/new', requireAuth, async (c) => {
  const form = await c.req.parseBody()
  const title = String(form['title'] || '')
  const content = String(form['content'] || '')

  if (!title || !content) {
    return c.text('Missing title or content', 400)
  }

  let slug = slugify(title)
  if (await c.env.DB.prepare('SELECT slug FROM posts WHERE slug=?').bind(slug).first()) {
    slug = `${slug}-${Date.now().toString(36)}`
  }
  await c.env.DB.prepare('INSERT INTO posts (slug, title, content) VALUES (?, ?, ?)')
    .bind(slug, title, content)
    .run()
  return c.redirect(`/post/${slug}`, 302)
})

// 編集
editor.get('/edit/:slug', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare('SELECT slug, title, content FROM posts WHERE slug=?')
    .bind(slug)
    .first()
  if (!row) {
    return c.notFound()
  }
  const r = row as any
  return c.html(
    Layout(
      'Edit Post',
      html`
        <h1 class="text-2xl font-bold mb-4">Edit Post</h1>
        <form method="post" actioin="/edit/${r.slug}">
          <input name="title" required value="${r.title}" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="content"
              id="md"
              rows="18"
              required
              class="w-full p-3 font-mono border rounded-lg"
            >
${r.content}</textarea
            >
            <div
              id="preview"
              class="w-full p-3 bg-white border rounded-lg overflow-auto prose"
            ></div>
            <button type="submit" class="mt-3">Update</button>
          </div>
        </form>
        <script type="module" src="/editor.js"></script>
      `,
      { wide: true },
    ),
  )
})

editor.post('/edit/:slug', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  const form = await c.req.parseBody()
  const title = String(form['title'] || '')
  const content = String(form['content'] || '')
  if (!title || !content) {
    return c.text('Missing title or content', 400)
  }
  await c.env.DB.prepare('UPDATE posts SET title=?, content=? WHERE slug=?')
    .bind(title, content, slug)
    .run()
  return c.redirect(`/post/${slug}`, 302)
})
