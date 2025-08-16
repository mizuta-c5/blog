import { html } from 'hono/html'

export const Footer = () => {
  return html`<footer class="text-center text-sm text-gray-500">
    <p class="flex justify-center gap-4">
      <a href="https://github.com/mizuta-c5" class="text-gray-500 hover:text-gray-700"
        ><i class="fab fa-github text-2xl"></i
      ></a>
      <a href="https://x.com/mizuta_c5" class="text-gray-500 hover:text-gray-700"
        ><i class="fab fa-twitter text-2xl"></i
      ></a>
      <a
        href="https://www.linkedin.com/in/naoki-mizuta-b1b2602a7/"
        class="text-gray-500 hover:text-gray-700"
        ><i class="fab fa-linkedin text-2xl"></i
      ></a>
    </p>
  </footer>`
}
