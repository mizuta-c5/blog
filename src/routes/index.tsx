import { Hono } from 'hono'
import Layout from '../components/Layout'
import Nav from '../components/Nav'
import SkillsModal from '../components/SkillsModal'
import { getUserFromCookie } from '../middleware/auth'
import type { Bindings, Variables } from '../types'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

const Home = ({ user }: { user: { name: string } | null }) => (
  <Layout title="Welcome to Our Site">
    <Nav user={user} />

    <section className="mx-auto w-full max-w-3xl md:mt-12">
      <div className="relative group">
        {/* グラデのリング（極薄） */}
        <div
          className="absolute -inset-0.5 rounded-[22px]
                 bg-[conic-gradient(at_30%_120%,theme(colors.zinc.400),theme(colors.zinc.700),theme(colors.zinc.400))]
                 opacity-30 blur-sm transition duration-500 group-hover:opacity-60"
        />

        {/* 外枠：ガラスカード */}
        <div
          className="relative rounded-[22px] bg-zinc-50/60 dark:bg-zinc-900/50
                 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10
                 shadow-[0_10px_40px_-10px_rgba(0,0,0,.35)] p-2"
        >
          {/* ガラス面 */}
          <div
            id="pane"
            className="relative overflow-hidden rounded-[16px] ring-1 ring-inset ring-black/10 dark:ring-white/10"
            style={{ aspectRatio: '16 / 9' }}
          >
            {/* 中身（動画 + 仕上げ） */}
            <div
              id="pane-content"
              className="absolute inset-0 will-change-transform opacity-0 transition-opacity duration-1000"
            >
              <video
                id="hero-video"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/sunset_beach.mp4" type="video/mp4" />
              </video>

              {/* 下部の遮光 */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />

              {/* 斜めグレア（細く・弱く） */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-screen opacity-20"
                style={{
                  background: `linear-gradient(108deg, rgba(255,255,255,.36) 0%, rgba(255,255,255,.10) 14%, rgba(255,255,255,0) 36%),
radial-gradient(130% 100% at -20% -20%, rgba(255,255,255,.10), transparent 60%)`,
                }}
              />

              {/* エッジの“段差”だけで面を見せる */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[16px]"
                style={{
                  boxShadow: `inset 0 28px 50px rgba(0,0,0,.18),
inset 0 -26px 44px rgba(0,0,0,.22),
inset 8px 0 24px rgba(0,0,0,.14),
inset -8px 0 24px rgba(0,0,0,.14)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="about" className="about sm:p-20 pb-10 mt-10 sm:mt-0">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">About</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            id="open-skills"
            role="button"
            tabIndex={0}
            className="feature cursor-pointer bg-white p-6 rounded-lg shadow-md outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-lg transition"
            aria-haspopup="dialog"
            aria-controls="skills-modal"
            aria-label="Open Skills modal"
          >
            <h3 className="text-2xl font-semibold mb-4">Skills</h3>
            <p>Key abilities and expertise.</p>
          </div>
          <div className="feature bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Projects</h3>
            <p>Notable work and achievements.</p>
          </div>
          <div className="feature bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Contact</h3>
            <p>Ways to reach me.</p>
          </div>
        </div>
      </div>
    </section>

    <SkillsModal />

    {/* 既存のクライアントJS */}
    <script type="module" src="/js/home.js" />
    <script type="module" src="/js/editor.js" />

    {/* onloadeddata をJSでハンドル（TS構文なし） */}
    <script>{`
      (() => {
        const v = document.getElementById('hero-video');
        const pane = document.getElementById('pane-content');
        if (v && pane) {
          v.addEventListener('loadeddata', () => { pane.style.opacity = '1'; });
        }
      })();
    `}</script>
  </Layout>
)

export default Home

export const home = new Hono<{ Bindings: Bindings; Variables: Variables }>()

home.get('/', async (c) => {
  const user = await getUserFromCookie(c)

  return c.html(ReactDOMServer.renderToString(<Home user={user as { name: string } | null} />))
})
