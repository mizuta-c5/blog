import { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { html } from 'hono/html'

type Bindings = {
  DB: D1Database
  ADMIN_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const layout = (title: string, body: string) =>
  html` <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${title}</title>
      <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
      <style>
        body {
          max-width: 720px;
          margin: 40px auto;
          padding: 0 16px;
          font:
            16px/1.6 system-ui,
            sans-serif;
        }
        a {
          color: inherit;
        }
        input,
        textarea,
        button {
          width: 100%;
          padding: 8px;
          margin: 6px 0;
        }
        .post {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>`

// slugify: 文字列をURLに適したものに変換する
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^-+|-+$/g, '')

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT slug, title, created_at FROM posts ORDER BY created_at DESC',
  ).all()
  const list = ((results as any[]) ?? []).map(
    (r) =>
      html` <div class="post">
        <a href="/p/${r.slug}"><strong>${r.title}</strong></a>
        <div>
          <small>${new Date((r.created_at as number) * 1000).toLocaleString('ja-JP')}</small>
        </div>
      </div>`,
  )
  return c.html(
    layout(
      'Blog',
      await html`<h1>Blog</h1>
        <p><a href="/new">New Post</a></p>
        ${list.length > 0 ? list : html`<p>No posts yet</p>`}`,
    ),
  )
})

// 記事の詳細
app.get('/p/:slug', async (c) => {
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare('SELECT title, content, created_at FROM posts WHERE slug = ?')
    .bind(slug)
    .first()
  if (!row) return c.notFound()
  const r = row as any
  return c.html(
    layout(
      r.title,
      await html`<p><a href="/">Back</a></p>
        <h1>${r.title}</h1>
        <div>
          <small>${new Date((r.created_at as number) * 1000).toLocaleString('ja-JP')}</small>
        </div>
        <article>${r.content}</article>
        <form method="post" action="/p/${slug}/delete">
          <input name="adminKey" type="password" placeholder="Admin Key" required />
          <button type="submit">Delete</button>
        </form>`,
    ),
  )
})

app.post('/p/:slug/delete', async (c) => {
  const slug = c.req.param('slug')
  const form = await c.req.parseBody()
  const adminKey = String(form['adminKey'] || '')
  if (adminKey !== c.env.ADMIN_KEY) return c.text('Invalid admin key', 401)

  await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
  return c.redirect('/', 302)
})

app.get('/new', async (c) => {
  return c.html(
    layout(
      'New Post',
      await html`
        <h1>New Post</h1>
        <form method="post" action="/new">
          <input name="title" placeholder="Title" required />
          <textarea name="content" placeholder="Content" required></textarea>
          <input name="adminKey" type="password" placeholder="Admin Key" required />
          <button type="submit">Create</button>
        </form>
      `,
    ),
  )
})

app.post('/new', async (c) => {
  const form = await c.req.parseBody()
  const title = String(form['title'] || '').trim()
  const content = String(form['content'] || '').trim()
  const adminKey = String(form['adminKey'] || '')
  if (adminKey != c.env.ADMIN_KEY) return c.text('Invalid admin key', 401)
  if (!title || !content) return c.text('Missing title or content', 400)

  let slug = slugify(title)
  const exists = await c.env.DB.prepare('SELECT 1 FROM posts WHERE slug=?').bind(slug).first()
  if (exists) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  await c.env.DB.prepare('INSERT INTO posts (slug, title, content) VALUES (?, ?, ?)')
    .bind(slug, title, content)
    .run()

  return c.redirect(`/p/${slug}`, 302)
})

app.get('/edit/:slug', async (c) => {
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare('SELECT title, content FROM posts WHERE slug = ?')
    .bind(slug)
    .first()
  if (!row) return c.notFound()
  const r = row as any
  return c.html(
    layout(
      'Edit Post',
      await html`
        <h1>Edit Post</h1>
        <form method="post" action="/edit/${r.slug}">
          <input name="title" placeholder="Title" required value="${r.title}" />
          <textarea name="content" placeholder="Content" required>${r.content}</textarea>
          <input name="adminKey" type="password" placeholder="Admin Key" required />
          <button type="submit">Update</button>
        </form>
      `,
    ),
  )
})

export default app
