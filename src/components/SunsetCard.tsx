import React from 'react'
import { slide } from '../client/slide'

export default function SunsetCard() {
  return (
    <div className="relative group">
      <div className={slide.ring} />
      <div className={slide.card}>
        <div id="pane" className={slide.pane} style={{ aspectRatio: '16/9' }}>
          <div
            id="pane-content"
            className="absolute inset-0 will-change-transform opacity-0 transition-opacity"
          >
            <video
              id="hero-video"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover block"
            >
              <source src="/sunset_beach.mp4" type="video/mp4" />
            </video>

            {/* 下部の遮光 */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />

            {/* 斜めグレア */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-screen opacity-20"
              style={{
                background: `linear-gradient(108deg, rgba(255,255,255,.36) 0%, rgba(255,255,255,.10) 14%, rgba(255,255,255,0) 36%),
radial-gradient(130% 100% at -20% -20%, rgba(255,255,255,.10), transparent 60%)`,
              }}
            />

            {/* エッジの段差 */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[16px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
