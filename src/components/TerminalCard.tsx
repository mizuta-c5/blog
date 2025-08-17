import { slide } from '../client/slide'

export default function TerminalCard() {
  return (
    <div className="relative group">
      <div className={slide.card}>
        <div
          className={`${slide.pane} flex flex-col bg-black text-green-500`}
          style={{ aspectRatio: '16 / 9' }}
        >
          {/* タイトルバー */}
          <div className={slide.termBar}>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-auto text-[11px] md:text-xs text-zinc-500">guest@portfolio:~</span>
          </div>

          {/* 出力 */}
          <div id="term-output" className={slide.termOut} />

          {/* 入力 */}
          <div className={slide.termInRow}>
            <div className="flex items-center gap-2 font-mono text-[13px] leading-6">
              <span className="text-emerald-600 select-none">$</span>
              <input
                id="term-input"
                type="text"
                autoComplete="off"
                className={slide.termIn}
                placeholder="type 'help' and hit Enter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
