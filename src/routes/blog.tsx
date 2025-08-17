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
    <div key={r.slug} className="post p-4 bg-white rounded-lg shadow-md mb-4">
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
        <div className="flex flex-col max-w-2xl items-left">{list}</div>
      </Layout>,
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
  const r = row as unknown as Post

  const controls = user ? (
    <div className="flex items-center gap-3 flex-wrap mt-4">
      <a
        href={`/blog/edit/${r.slug}`}
        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700"
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
          className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700"
        >
          Delete
        </button>
      </form>
      <a
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-md bg-gray-600 px-4 font-semibold text-white leading-none hover:bg-gray-700"
      >
        Back to Home
      </a>
    </div>
  ) : null

  return c.html(
    ReactDOMServer.renderToString(
      <Layout title={r.title}>
        <Nav user={user as { name: string } | null} />
        <div className="post p-8 bg-white rounded-lg shadow-md mb-8">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{r.title}</p>
          <div className="flex justify-end text-sm text-gray-500">
            <small>{new Date(r.created_at * 1000).toLocaleString('ja-JP')}</small>
          </div>
          <article
            className="markdown-body mx-auto w-full max-w-screen-md"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(r.content) }}
          />
        </div>
        {controls}
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
      <Layout title="New Post" wide={true}>
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
      <Layout title="Edit Post" wide={true}>
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
