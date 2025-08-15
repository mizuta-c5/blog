import { D1Database } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { html } from 'hono/html'
import { sign, verify } from 'hono/jwt'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

type Bindings = {
  DB: D1Database
  ADMIN_USER: string
  ADMIN_PASS: string
  SESSION_SECRET: string
  NODE_ENV: string
}

type Variables = {
  user: {
    name: string
  }
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
app.use('*', logger())
app.use('*', secureHeaders())

const layout = (title: string, body: string) =>
  html` <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${title}</title>
      <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
      <link rel="stylesheet" href="/styles.css" />
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

// セッション関連Utils
async function getUserFromCookie(c: any) {
  const token = getCookie(c, 'session')
  if (!token) return null
  try {
    const payload = await verify(token, c.env.SESSION_SECRET)
    return { name: (payload as any).sub as string }
  } catch (e) {
    c.error(e)
    return null
  }
}

async function requireAuth(c: any, next: any) {
  const user = await getUserFromCookie(c)
  if (!user) {
    return c.redirect('/login', 302)
  }
  c.set('user', user)
  await next()
}

app.get('/', async (c) => {
  const user = await getUserFromCookie(c)
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

  const nav = user
    ? html`
        <nav>
          <a href="/">Home</a>
          <a href="/new">New Post</a>
          <a href="/logout">Logout</a>
        </nav>
      `
    : html`<nav>
        <a href="/">Home</a>
        <a href="/login">Login</a>
      </nav>`

  return c.html(
    layout(
      'Blog',
      await html`${nav}
        <h1>Blog</h1>
        ${list.length > 0 ? list : html`<p>No posts yet</p>`}`,
    ),
  )
})

// 記事の詳細
app.get('/p/:slug', async (c) => {
  const user = await getUserFromCookie(c)
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare('SELECT title, content, created_at FROM posts WHERE slug = ?')
    .bind(slug)
    .first()
  if (!row) return c.notFound()
  const r = row as any

  const controls = user
    ? html`<p>
      <a href="/edit/${r.slug}">Edit</a>
      <form class="inline" method="post" action="/p/${r.slug}/delete" onsubmit="return confirm('Delete this post?')">
        <button type="submit">Delete</button>
      </form>
    </p>`
    : ''

  const nav = user
    ? html`<nav>
        <a href="/">Home</a>
        <a href="/new">New Post</a>
        <a href="/logout">Logout</a>
      </nav>`
    : html`<nav>
        <a href="/">Home</a>
        <a href="/login">Login</a>
      </nav>`

  return c.html(
    layout(
      r.title,
      await html`${nav}
        <p><a href="/">Back</a></p>
        <h1>${r.title}</h1>
        <div>
          <small>${new Date((r.created_at as number) * 1000).toLocaleString('ja-JP')}</small>
        </div>
        <article>${r.content}</article>
        ${controls}`,
    ),
  )
})

app.get('/login', async (c) => {
  const user = await getUserFromCookie(c)
  if (user) return c.redirect('/', 302)
  return c.html(
    layout(
      'Login',
      await html`<h1>Login</h1>
        <form method="post" action="/login" autocomplete="off">
          <input name="user" placeholder="User" required />
          <input name="pass" type="password" placeholder="Password" required />
          <button type="submit">Sign in</button>
        </form>`,
    ),
  )
})

app.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const user = String(form['user'] || '')
  const pass = String(form['pass'] || '')
  if (user !== c.env.ADMIN_USER || pass !== c.env.ADMIN_PASS) {
    return c.redirect('/login', 302)
  }
  const token = await sign(
    {
      sub: user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    c.env.SESSION_SECRET,
  )
  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: !(c.env.NODE_ENV === 'dev'),
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return c.redirect('/', 302)
})

app.get('/logout', async (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.redirect('/', 302)
})

// Private
app.get('/new', requireAuth, async (c) => {
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

app.post('/new', requireAuth, async (c) => {
  const form = await c.req.parseBody()
  const title = String(form['title'] || '').trim()
  const content = String(form['content'] || '').trim()
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

app.get('/edit/:slug', requireAuth, async (c) => {
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
          <button type="submit">Update</button>
        </form>
      `,
    ),
  )
})

app.post('/edit/:slug', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  const form = await c.req.parseBody()
  const title = String(form['title'] || '').trim()
  const content = String(form['content'] || '').trim()
  if (!title || !content) return c.text('Missing title or content', 400)

  await c.env.DB.prepare('UPDATE posts SET title = ?, content = ? WHERE slug = ?')
    .bind(title, content, slug)
    .run()
  return c.redirect(`/p/${slug}`, 302)
})

app.post('/p/:slug/delete', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
  return c.redirect('/', 302)
})

// for debug
// ★診断ルート（秘密は出さない・true/falseだけ）
app.get('/__env', (c) =>
  c.json({
    hasDB: !!c.env.DB,
    hasAdminUser: !!c.env.ADMIN_USER,
    hasSessionSecret: !!c.env.SESSION_SECRET,
  }),
)

// 任意：生存確認
app.get('/__ping', (c) => c.text('pong'))

export default app
