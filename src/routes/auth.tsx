import { Hono } from 'hono'
import { html } from 'hono/html'
import { sign } from 'hono/jwt'
import { Layout } from '../components/Layout'
import { cookies, getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

export const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

auth.get('/login', async (c) => {
  if (await getUserFromCookie(c)) {
    return c.redirect('/', 302)
  }
  return c.html(
    Layout(
      'Login',
      html`
        <h1>Login</h1>
        <form method="post" action="/login">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Sign in</button>
        </form>
      `,
    ),
  )
})

auth.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const user = String(form['username'] || '')
  const pass = String(form['password'] || '')
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
