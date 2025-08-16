import { html } from 'hono/html'

export const Nav = (user: { name: string } | null) => {
  return html`<nav
    class="w-full flex items-center justify-between font-bold text-lg mb-8"
  >
    <div class="flex items-center gap-4">
      <a href="/" class="text-gray-500 hover:text-gray-700">Home</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">About</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Projects</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Contact</a>
      ${user ? html`<a href="/new" class="text-gray-500 hover:text-gray-700">New Post</a>` : ''}
      <a href="${user ? '/logout' : '/login'}" class="text-gray-500 hover:text-gray-700"
        >${user ? 'Logout' : 'Login'}</a
      >
    </div>
    <div class="flex items-center">
      <p class="flex justify-center gap-8">
        <a href="https://github.com/mizuta-c5" class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-github text-3xl"></i
        ></a>
        <a href="https://x.com/mizuta_c5" class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-twitter text-3xl"></i
        ></a>
        <a
          href="https://www.linkedin.com/in/naoki-mizuta-b1b2602a7/"
          class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-linkedin text-3xl"></i
        ></a>
      </p>
    </div>
  </nav>`
}
