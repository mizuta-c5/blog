import { html } from 'hono/html'

export const Nav = (user: { name: string } | null) => {
  return html`<nav
    class="w-full flex flex-col sm:flex-row items-center justify-between font-bold text-lg sm:text-2xl p-10 pl-5 pr-5"
  >
    <div class="flex flex-row items-center gap-2 sm:gap-4">
      <a href="/" class="text-gray-500 hover:text-gray-700">Home</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">About</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Projects</a>
      <a href="#" class="text-gray-400 cursor-not-allowed" aria-disabled="true">Contact</a>
      ${user ? html`<a href="/new" class="text-gray-500 hover:text-gray-700">New Post</a>` : ''}
      <a href="${user ? '/logout' : '/login'}" class="text-gray-500 hover:text-gray-700"
        >${user ? 'Logout' : 'Login'}</a
      >
    </div>
    <div class="flex items-center mt-2 sm:mt-0">
      <p class="flex justify-end gap-4 sm:gap-6">
        <a href="https://github.com/mizuta-c5" class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-github text-2xl sm:text-3xl"></i
        ></a>
        <a href="https://x.com/mizuta_c5" class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-twitter text-2xl sm:text-3xl"></i
        ></a>
        <a
          href="https://www.linkedin.com/in/naoki-mizuta-b1b2602a7/"
          class="text-gray-500 hover:text-gray-700"
          ><i class="fab fa-linkedin text-2xl sm:text-3xl"></i
        ></a>
      </p>
    </div>
  </nav>`
}
