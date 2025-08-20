import { slide } from '../client/slide'

export default function AtCoderCard() {
  const ATCODER_USER = 'richard_5_'
  const ATCODER_CHART_ID = 'atcoder-chart-richard_5_'

  return (
    <div className={slide.terminalEmuCard}>
      <div className={slide.ring} />
      <div className={slide.card}>
        <div id="pane" className={`${slide.pane} aspect-[16/9] isolate`}>
          {/* p-4 + h-full で Chart.js をフィットさせる */}
          <div className="absolute inset-0 rounded-[16px] p-4 bg-white">
            <div className="w-full h-full">
              <canvas id={ATCODER_CHART_ID} className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ビルド生成物を読み込み（データ属性で設定） */}
      <script
        type="module"
        src="/js/atcoder.js"
        data-atcoder
        data-user={ATCODER_USER}
        data-target={ATCODER_CHART_ID}
      />
    </div>
  )
}
