// src/components/Carousel.tsx
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useEffect, useMemo, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  /** 1枚の占有率（%） 例: '85%' */
  slideWidth?: string
  /** スライド最大幅(px) */
  maxWidthPx?: number
  /** スライド最小幅(px) */
  minWidthPx?: number
  /** スライド間の間隔(px) */
  gutterPx?: number
  /** ビューポート左右の外側余白(px) */
  edgePaddingPx?: number
  /** ループ用に追加で複製するスライド数（不足時に増やす） */
  loopAdditionalSlides?: number
}

export default function Carousel({
  children,
  className = '',
  options,
  slideWidth,
  maxWidthPx,
  minWidthPx,
  gutterPx,
  edgePaddingPx,
  loopAdditionalSlides, // 未指定なら slideWidth から自動推定
}: Props) {
  // slideWidth から、画面内に同時に見えるおおよその枚数を推定
  const percent =
    typeof slideWidth === 'string' && slideWidth.endsWith('%')
      ? Math.max(1, Math.min(100, parseFloat(slideWidth)))
      : undefined
  // 85%なら ≒1.17枚 → 2枚見える想定なので、複製を「2」にして隙間を防ぐ
  const autoLoopExtra = percent ? Math.max(2, Math.ceil(100 / percent)) : 2
  const loopExtra = loopAdditionalSlides ?? autoLoopExtra

  // ループ＋センターの安定設定（containScroll は loop と併用不要）
  const [emblaRef, api] = useEmblaCarousel({
    align: 'center',
    dragFree: false,
    skipSnaps: false,
    slidesToScroll: 1,
    loop: true,
    // ↓ Embla v6/v7 で使える追加クローン数（環境によっては無視されます）
    //   効かない場合は無視されるだけなので安全
    // @ts-expect-error: 一部型定義に無い場合がある
    loopAdditionalSlides: loopExtra,
    startIndex: 3, // クローン境界を避ける
    inViewThreshold: 0.6, // 中央判定の安定化
    ...(options ?? {}),
  })

  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off?.('select', onSelect)
      api.off?.('reInit', onSelect)
    }
  }, [api])

  // トラックパッド/マウスの縦ホイールを横送りに
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!api) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (!d) return
    e.preventDefault()
    if (d > 0) {
      api.scrollNext()
    } else {
      api.scrollPrev()
    }
  }

  const slides = useMemo(() => React.Children.toArray(children), [children])

  // 幅を % 基準に min/max を clamp
  const basis =
    typeof maxWidthPx === 'number'
      ? `clamp(${minWidthPx}px, ${slideWidth}, ${maxWidthPx}px)`
      : slideWidth

  return (
    <div className={`${className} w-full overflow-x-clip flex items-center`}>
      {/* viewport：左右外側余白は style で正確に制御 */}
      <div
        className="overflow-hidden touch-pan-x overscroll-x-contain overscroll-y-none w-full"
        style={{ paddingLeft: edgePaddingPx, paddingRight: edgePaddingPx }}
        ref={emblaRef}
        aria-roledescription="carousel"
        onWheel={onWheel}
        data-embla="viewport"
        data-embla-react
      >
        {/* track：負マージンで相殺 → スライドの padding がそのまま間隔になる */}
        <div
          className="flex will-change-transform w-full"
          data-embla="container"
          style={{ marginLeft: gutterPx ? -gutterPx : 0, marginRight: gutterPx ? -gutterPx : 0 }}
        >
          {slides.map((child, i) => (
            <div
              key={i}
              className="shrink-0 transition-all motion-safe:duration-300 ease-out scale-100 opacity-100 z-10"
              style={{
                flex: `0 0 ${basis}`,
                paddingLeft: gutterPx,
                paddingRight: gutterPx, // ← 間隔はここで一元管理
              }}
              aria-current={i === selected ? 'true' : 'false'}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
