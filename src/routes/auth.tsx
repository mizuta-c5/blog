import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import ReactDOMServer from 'react-dom/server'
import Layout from '../components/Layout'
import { cookies, getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types/misc'

export const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

auth.get('/login', async (c) => {
  if (await getUserFromCookie(c)) {
    return c.redirect('/', 302)
  }
  return c.html(
    ReactDOMServer.renderToString(
      <Layout title="Login">
        <p className="text-2xl font-bold mb-4">Login</p>
        <form method="post" action="/login" className="flex flex-col gap-2">
          <input
            name="username"
            placeholder="Username"
            required
            className="border border-gray-300 rounded-md p-2"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="border border-gray-300 rounded-md p-2"
          />
          <button type="submit" className="bg-gray-500 text-white p-2 rounded-md cursor-pointer">
            Sign in
          </button>
        </form>
      </Layout>,
    ),
  )
})

auth.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const user = typeof form.username === 'string' ? form.username : ''
  const pass = typeof form.password === 'string' ? form.password : ''
  if (user !== c.env.ADMIN_USER || pass !== c.env.ADMIN_PASS) {
    return c.redirect('/login', 302)
  }
  const token = await sign(
    {
      sub: user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    c.env.SESSION_SECRET,
  )
  cookies.setCookie(c, 'session', token, {
    httpOnly: true,
    secure: !(c.env.NODE_ENV === 'dev'),
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  return c.redirect('/', 302)
})

auth.get('/logout', (c) => {
  cookies.deleteCookie(c, 'session', { path: '/' })
  return c.redirect('/login', 302)
})
