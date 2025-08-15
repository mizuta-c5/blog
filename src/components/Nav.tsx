import { html } from 'hono/html'

export const Nav = (user: { name: string } | null) => {
  return user
    ? html`<nav class="w-full flex items-center gap-4 font-bold text-lg mb-4">
        <a href="/">Home</a><a href="/new">New Post</a><a href="/logout">Logout</a>
      </nav>`
    : html`<nav class="w-full flex items-center gap-4 font-bold text-lg mb-4">
        <a href="/login">Login</a>
      </nav>`
}
