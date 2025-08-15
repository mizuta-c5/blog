import { html } from 'hono/html'

export const Nav = (user: { name: string } | null) => {
  return user
    ? html`<nav><a href="/">Home</a><a href="/new">New Post</a><a href="/logout">Logout</a></nav>`
    : html`<nav><a href="/login">Login</a></nav>`
}