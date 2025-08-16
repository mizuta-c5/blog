import { html } from 'hono/html'

export const Nav = (user: { name: string } | null) => {
  return user
    ? html`<nav class="w-full flex items-center gap-4 font-bold text-lg mb-8">
        <a href="/" class="text-gray-500 hover:text-gray-700">Home</a>
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">About</a>
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Projects</a>
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Contact</a>
        <a href="/logout" class="text-gray-500 hover:text-gray-700">Logout</a>
      </nav>`
    : html`<nav class="w-full flex items-center gap-4 font-bold text-lg mb-8">
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">About</a>
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Projects</a>
        <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Contact</a>
        <a href="/login" class="text-gray-500 hover:text-gray-700">Login</a>
      </nav>`
}
