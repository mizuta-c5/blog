import { Hono } from 'hono'
import ReactDOMServer from 'react-dom/server'
import Layout from '../components/Layout'
import Nav from '../components/Nav'
import { renderMarkdown } from '../lib/markdown'
import { slugify } from '../lib/slugify'
import { getUserFromCookie, requireAuth } from '../middleware/auth'
import type { Bindings, Variables } from '../types/misc'

interface Post {
  slug: string
  title: string
  content: string
  created_at: number
}

export const blog = new Hono<{ Bindings: Bindings; Variables: Variables }>()

blog.get('/blog', async (c) => {
  const user = await getUserFromCookie(c)
  const { results } = await c.env.DB.prepare(
    'SELECT slug, title, created_at FROM posts ORDER BY created_at DESC',
  ).all()
  const list = (results as { slug: string; title: string; created_at: number }[]).map((r) => (
    <div
      key={r.slug}
      className="post p-4 bg-white rounded-lg shadow-md mb-4 flex flex-col items-left w-full"
    >
      <a
        href={`/blog/${r.slug}`}
        className="text-lg font-semibold text-gray-500 hover:text-gray-700"
      >
        {r.title}
      </a>
      <div className="text-sm text-gray-500">
        <small>{new Date(r.created_at * 1000).toLocaleString()}</small>
      </div>
    </div>
  ))
  return c.html(
    ReactDOMServer.renderToString(
      <Layout title="Blog">
        <Nav user={user as { name: string } | null} />
        <h1 className="text-2xl font-bold mb-4">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full p-5 gap-4">{list}</div>
      </Layout>,
    ),
  )
})

blog.get('/blog/:slug', async (c) => {
  const user = await getUserFromCookie(c)
  const slug = c.req.param('slug')
  const row = await c.env.DB.prepare(
    'SELECT slug, title, content, created_at FROM posts WHERE slug = ?',
  ).bind(slug).first()

  if (!row) return c.notFound()
  const r = row as unknown as Post
  const createdAt = new Date(r.created_at * 1000)

  const controls = user ? (
    <div className="flex items-center gap-3 flex-wrap mt-8">
      <a
        href={`/blog/edit/${r.slug}`}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700 transition"
      >
        Edit
      </a>
      <form
        method="post"
        action={`/blog/${r.slug}/delete`}
        onSubmit={() => confirm('Delete this post?')}
        className="m-0"
      >
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700 transition"
        >
          Delete
        </button>
      </form>
      <a
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700 transition"
      >
        Back to Home
      </a>
    </div>
  ) : null

  return c.html(
    ReactDOMServer.renderToString(
      <Layout title={r.title}>
        <Nav user={user as { name: string } | null} />

        <div className="mx-auto w-full max-w-screen-3xl px-4 md:px-6 lg:px-8">
          {/* パンくず */}
          <nav className="mb-4 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700">Home</a>
            <span className="mx-2">/</span>
            <a href="/blog" className="hover:text-gray-700">Blog</a>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{r.title}</span>
          </nav>

          {/* カード（グラデリング + ガラスっぽい面） */}
          <div className="relative group">
            <div
              className="pointer-events-none absolute -inset-0.5 rounded-[22px]
                         bg-[conic-gradient(at_30%_120%,theme(colors.zinc.400),theme(colors.zinc.700),theme(colors.zinc.400))]
                         opacity-20 blur-sm transition group-hover:opacity-30"
            />
            <div
              className="relative rounded-[20px] border border-gray-200/70 bg-white/90
                         shadow-lg backdrop-blur-sm"
            >
              {/* ヘッダー */}
              <header className="px-6 pt-6 pb-4 md:px-6 md:pt-8 md:pb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                  {r.title}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <time dateTime={createdAt.toISOString()}>
                    {createdAt.toLocaleString('ja-JP')}
                  </time>
                </div>
              </header>

              {/* 区切り線 */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* 本文 */}
              <article
                className="px-2 py-6 md:px-8 md:py-8"
              >
                <div
                  className="markdown-body prose max-w-none prose-headings:scroll-mt-24
                             prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200
                             prose-img:rounded-xl prose-hr:border-gray-200
                             selection:bg-gray-200"
                  // 色は .markdown-body の既存CSSで継承
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(r.content) }}
                />
              </article>
            </div>
          </div>

          {controls}
        </div>
      </Layout>,
    ),
  )
})


blog.post('/blog/:slug/delete', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  await c.env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run()
  return c.redirect('/')
})

// 新しい記事を作成するページを表示する
blog.get('/new', (c) => {
  return c.html(
    ReactDOMServer.renderToString(
      <Layout title="New Post">
        <h1 className="text-2xl font-bold mb-4">New Post</h1>
        <form method="post" action="/new" className="flex flex-col gap-4">
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full p-3 font-mono border rounded-lg"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="content"
              id="md"
              rows={18}
              required
              className="w-full p-3 font-mono border rounded-lg resize-none"
              placeholder="Write in Markdown..."
            ></textarea>
            <div
              id="preview"
              className="w-full bg-white p-3 border rounded-lg overflow-auto resize-none prose markdown-body"
            ></div>
            <button type="submit" className="mt-3">
              Create
            </button>
          </div>
        </form>
        <script type="module" src="/editor.js"></script>
      </Layout>,
    ),
  )
})

blog.post('/new', requireAuth, async (c) => {
  const form = await c.req.parseBody()
  const title = typeof form.title === 'string' ? form.title : ''
  const content = typeof form.content === 'string' ? form.content : ''

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
  const r = row as unknown as Post
  return c.html(
    ReactDOMServer.renderToString(
      <Layout title="Edit Post">
        <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
        <form method="post" action={`/blog/edit/${r.slug}`}>
          <input
            name="title"
            className="w-full p-3 font-mono border rounded-lg mb-4"
            required
            value={r.title}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              name="content"
              id="md"
              rows={18}
              required
              className="w-full p-3 font-mono border rounded-lg resize-none"
            >
              {r.content}
            </textarea>
            <div
              id="preview"
              className="w-full p-3 bg-white border rounded-lg overflow-auto prose markdown-body"
            ></div>
            <button type="submit" className="mt-3">
              Update
            </button>
          </div>
        </form>
        <script type="module" src="/editor.js"></script>
      </Layout>,
    ),
  )
})

blog.post('/blog/edit/:slug', requireAuth, async (c) => {
  const slug = c.req.param('slug')
  const form = await c.req.parseBody()
  const title = typeof form.title === 'string' ? form.title : ''
  const content = typeof form.content === 'string' ? form.content : ''
  if (!title || !content) {
    return c.text('Missing title or content', 400)
  }
  await c.env.DB.prepare('UPDATE posts SET title=?, content=? WHERE slug=?')
    .bind(title, content, slug)
    .run()
  return c.redirect(`/blog/${slug}`, 302)
})
