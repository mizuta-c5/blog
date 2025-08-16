import React from 'react'

const SkillsModal = () => (
  <>
    <dialog
      id="skills-modal"
      className="p-0 m-0 w-screen h-dvh max-w-none max-h-none bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
      aria-labelledby="skills-title"
    >
      {/* オーバーレイ（アニメ対象） */}
      <div
        className="overlay fixed inset-0 bg-black/55 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out"
        data-close
      ></div>

      {/* カード本体（アニメ対象） */}
      <div
        className="card relative mx-auto w-[min(92vw,720px)] rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl ring-1 ring-black/10 dark:ring-white/10
               opacity-0 translate-y-2 scale-[0.985] transition-[opacity,transform] duration-500 ease-out"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="skills-title" className="text-xl font-semibold">
            Skills
          </h3>
          <form method="dialog">
            <button
              className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
              autoFocus
            >
              &times;
            </button>
          </form>
        </div>

        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>TypeScript / React / Hono</li>
            <li>Cloudflare Workers / D1</li>
            <li>Tailwind CSS / UI設計</li>
            <li>Security / TryHackMe</li>
          </ul>
        </div>
      </div>
    </dialog>

    <style>{`
      /* フルスクリーン＋中央寄せ */
      #skills-modal { top: 0; left: 0; border: 0; }
      #skills-modal[open] { display: grid; place-items: center; }
      /* “開いている状態”の見た目（このクラスでトランジション終点へ） */
      #skills-modal.is-open .overlay { opacity: 1; }
      #skills-modal.is-open .card { opacity: 1; transform: translateY(0) scale(1); }
    `}</style>
  </>
)

export default SkillsModal
