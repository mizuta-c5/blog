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

        <section class="mx-auto w-full max-w-3xl md:mt-12">
          <div class="relative group">
            <!-- グラデのリング（極薄） -->
            <div
              class="absolute -inset-0.5 rounded-[22px]
                        bg-[conic-gradient(at_30%_120%,theme(colors.zinc.400),theme(colors.zinc.700),theme(colors.zinc.400))]
                        opacity-35 blur-sm transition duration-500 group-hover:opacity-60"
            ></div>

            <!-- 外枠：ガラスカード -->
            <div
              class="relative rounded-[22px] bg-zinc-50/60 dark:bg-zinc-900/50
                        backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10
                        shadow-[0_10px_40px_-10px_rgba(0,0,0,.35)] p-2"
            >
              <!-- ガラス面 -->
              <div
                id="pane"
                class="relative overflow-hidden rounded-[16px] ring-1 ring-inset ring-black/10 dark:ring-white/10"
                style="aspect-ratio: 16 / 9"
              >
                <!-- クリックで開く幕（極薄） -->
                <!-- Removed play button -->

                <!-- 中身（動画 + 仕上げ） -->
                <div
                  id="pane-content"
                  class="absolute inset-0 will-change-transform opacity-0 transition-opacity duration-1000"
                >
                  <video
                    autoplay
                    loop
                    muted
                    playsinline
                    class="w-full h-full object-cover"
                    onloadeddata="this.parentElement.style.opacity='1'"
                  >
                    <source src="/sunset_beach.mp4" type="video/mp4" />
                  </video>

                  <!-- 下部の遮光 -->
                  <div
                    class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent"
                  ></div>

                  <!-- 斜めグレア（細く・弱く） -->
                  <div
                    class="pointer-events-none absolute inset-0 mix-blend-screen opacity-20"
                    style="background:
                         linear-gradient(108deg, rgba(255,255,255,.36) 0%, rgba(255,255,255,.10) 14%, rgba(255,255,255,0) 36%),
                         radial-gradient(130% 100% at -20% -20%, rgba(255,255,255,.10), transparent 60%)"
                  ></div>

                  <!-- エッジの“段差”だけで面を見せる -->
                  <div
                    class="pointer-events-none absolute inset-0 rounded-[16px]"
                    style="box-shadow:
                         inset 0 28px 50px rgba(0,0,0,.18),
                         inset 0 -26px 44px rgba(0,0,0,.22),
                         inset 8px 0 24px rgba(0,0,0,.14),
                         inset -8px 0 24px rgba(0,0,0,.14)"
                  ></div>
                </div>

                <!-- ※縦横の線（桟）は削除しました -->
              </div>
            </div>
          </div>
        </section>

        <script>
          ;(function () {
            var pane = document.getElementById('pane')
            var content = document.getElementById('pane-content')
            if (!pane || !content) return
            var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

            function applyParallax(e) {
              var r = pane.getBoundingClientRect()
              var x = (e.clientX - r.left) / r.width - 0.5
              var y = (e.clientY - r.top) / r.height - 0.5
              content.style.transform = 'translate(' + x * 5 + 'px, ' + y * 3 + 'px) scale(1.005)'
            }
            function reset() {
              content.style.transform = 'translate(0,0) scale(1)'
            }
            if (!reduce) {
              pane.removeEventListener('mousemove', applyParallax)
              pane.removeEventListener('mouseleave', reset)
              pane.removeEventListener(
                'touchmove',
                function (e) {
                  var t = e.touches[0]
                  if (t) applyParallax(t)
                },
                { passive: true },
              )
              pane.removeEventListener('touchend', reset)
            }
          })()
        </script>

        <section id="about" class="about sm:p-20 pb-10 mt-12">
          <div class="container mx-auto">
            <h2 class="text-3xl font-bold mb-8 text-center">About</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div class="feature bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-2xl font-semibold mb-4">Skills</h3>
                <p>Key abilities and expertise.</p>
              </div>
              <div class="feature bg-white p-6 rounded-lg shadow-md ">
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
