import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { Layout } from '../components/Layout'
import { Nav } from '../components/Nav'
import { renderMarkdown } from '../lib/markdown'
import { slugify } from '../lib/slugify'
import { getUserFromCookie, requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

export const blog = new Hono<{ Bindings: Bindings; Variables: Variables }>()

blog.get('/blog', async (c) => {
  const user = await getUserFromCookie(c)
  const { results } = await c.env.DB.prepare(
    'SELECT slug, title, created_at FROM posts ORDER BY created_at DESC',
  ).all()
  const list = (results as any[]).map(
    (r) => html`
      <div class="post p-4 bg-white rounded-lg shadow-md mb-4">
        <a href="/blog/${r.slug}" class="text-lg font-semibold text-gray-500 hover:text-gray-700"
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
        ${Nav(user)}
        <h1 class="text-2xl font-bold mb-4">Blog</h1>
        <div class="flex flex-col max-w-2xl items-left">${list}</div>
      `,
    ),
  )
})

blog.get('/blog/:slug', async (c) => {
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
            href="/blog/edit/${r.slug}"
            class="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4
              font-semibold text-white leading-none hover:bg-gray-700"
          >
            Edit
          </a>

          <form
            method="post"
            action="/blog/${r.slug}/delete"
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
        <div class="post p-8 bg-white rounded-lg shadow-md mb-8">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-bold">${r.title}</p>

          <div class="flex justify-end text-sm text-gray-500">
            <small>${new Date((r.created_at as number) * 1000).toLocaleString('ja-JP')}</small>
          </div>

          <article class="markdown-body mx-auto w-full max-w-screen-md">
            ${raw(renderMarkdown(r.content))}
          </article>
        </div>
        ${controls}
      `,
    ),
  )
})

blog.post('/blog/:slug/delete', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
  return c.redirect('/')
})

// 新しい記事を作成するページを表示する
blog.get('/new', async (c) => {
  return c.html(
    Layout(
      'New Post',
      html`
        <h1 class="text-2xl font-bold mb-4">New Post</h1>
        <form method="post" action="/new" class="flex flex-col gap-4">
          <input
            name="title"
            placeholder="Title"
            required
            class="w-full p-3 font-mono border rounded-lg"
          />
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
              class="w-full bg-white p-3 border rounded-lg overflow-auto resize-none prose markdown-body"
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

blog.post('/new', requireAuth, async (c) => {
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
  return c.redirect(`/blog/${slug}`, 302)
})

// 編集
blog.get('/blog/edit/:slug', requireAuth, async (c) => {
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
        <form method="post" action="/blog/edit/${r.slug}">
          <input
            name="title"
            class="w-full p-3 font-mono border rounded-lg mb-4"
            required
            value="${r.title}"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="content"
              id="md"
              rows="18"
              required
              class="w-full p-3 font-mono border rounded-lg resize-none"
            >
${r.content}</textarea
            >
            <div
              id="preview"
              class="w-full p-3 bg-white border rounded-lg overflow-auto prose markdown-body"
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

blog.post('/blog/edit/:slug', requireAuth, async (c) => {
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
  return c.redirect(`/blog/${slug}`, 302)
})
