import { useEffect } from 'react'
import { slide } from '../client/slide'

export default function SampleCard1() {
  useEffect(() => {
    const video = document.getElementById('hero-video') as HTMLVideoElement | null
    const pane = document.getElementById('pane')
    if (video && pane) {
      const handle = () => pane.classList.remove('opacity-0') // 読み込み後にフェードインしたいなら
      video.addEventListener('loadeddata', handle)
      return () => video.removeEventListener('loadeddata', handle)
    }
  }, [])

  return (
    <div className="relative group">
      <div className={slide.ring} />
      <div className={slide.card}>
        {/* ★ isolate でブレンドのにじみ防止。角丸は 16px に統一 */}
        <div id="pane" className={`${slide.pane} aspect-[16/9] isolate`}>
          <div className="absolute inset-0 rounded-[16px]">
            <img
              src="/img/aic.png"
              alt="AIC"
              className="absolute inset-0 object-cover w-full h-full rounded-[16px] opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
