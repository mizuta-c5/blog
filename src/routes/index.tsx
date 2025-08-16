import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout } from '../components/Layout'
import { Nav } from '../components/Nav'
import { getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types'
export const home = new Hono<{ Bindings: Bindings; Variables: Variables }>()

home.get('/', async (c) => {
  const user = await getUserFromCookie(c)
  return c.html(
    Layout(
      'Welcome to Our Site',
      html`
        ${Nav(user as { name: string } | null)}
        <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js"></script>
        <section class="mx-auto my-8 w-full max-w-2xl">
          <div
            class="relative rounded-2xl border-8 border-stone-700 dark:border-stone-300
           shadow-[inset_0_2px_10px_rgba(0,0,0,.45),0_18px_50px_rgba(0,0,0,.35)]
           bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-700 dark:to-stone-800 p-1"
          >
            <div
              class="relative overflow-hidden rounded-xl border-4 border-white dark:border-black"
              style="aspect-ratio: 16 / 9"
            >
              <video autoplay loop muted playsinline class="w-full h-full object-cover">
                <source src="/sunset_beach.mp4" type="video/mp4" />
              </video>

              <div class="pointer-events-none absolute inset-0" aria-hidden="true">
                <div
                  class="absolute inset-x-0 top-1/2 h-[10px] -translate-y-1/2 bg-white dark:bg-black"
                ></div>
                <div
                  class="absolute inset-y-0 left-1/2 w-[10px] -translate-x-1/2 bg-white dark:bg-black"
                ></div>
              </div>

              <div
                class="pointer-events-none absolute -left-1/4 -top-1/4 h-[200%] w-[50%]
               rotate-12 opacity-40"
                style="
          background: linear-gradient(100deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 60%);
          animation: shine 9s linear infinite;
        "
                aria-hidden="true"
              ></div>

              <div
                class="pointer-events-none absolute inset-0 ring-1 ring-black/10 dark:ring-white/10 rounded-xl"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        </section>

        <section id="about" class="about py-20">
          <div class="container mx-auto">
            <h2 class="text-3xl font-bold mb-8 text-center">About</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="feature bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-2xl font-semibold mb-4">Skills</h3>
                <p>Key abilities and expertise.</p>
              </div>
              <div class="feature bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-2xl font-semibold mb-4">Projects</h3>
                <p>Notable work and achievements.</p>
              </div>
              <div class="feature bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-2xl font-semibold mb-4">Contact</h3>
                <p>Ways to reach me.</p>
              </div>
            </div>
          </div>
        </section>
      `,
    ),
  )
})
