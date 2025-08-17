import { useEffect } from 'react'
import { slide } from '../client/slide'

export default function SunsetCard() {
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
          {/* ★ video を absolute で全面に敷く */}
          <video
            id="hero-video"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/sunset_beach.mp4" type="video/mp4" />
          </video>

          {/* ★ 下部遮光：全面に敷いて、角丸を揃える（はみ出し防止） */}
          <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-t from-black/20 to-transparent" />

          {/* 斜めグレア：角丸を揃える */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[16px] mix-blend-screen opacity-20"
            style={{
              background:
                'linear-gradient(108deg, rgba(255,255,255,.36) 0%, rgba(255,255,255,.10) 14%, rgba(255,255,255,0) 36%), radial-gradient(130% 100% at -20% -20%, rgba(255,255,255,.10), transparent 60%)',
            }}
          />

          {/* エッジの段差：角丸を揃える */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            style={{
              boxShadow:
                'inset 0 28px 50px rgba(0,0,0,.18), inset 0 -26px 44px rgba(0,0,0,.22), inset 8px 0 24px rgba(0,0,0,.14), inset -8px 0 24px rgba(0,0,0,.14)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
