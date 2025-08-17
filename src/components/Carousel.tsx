// src/components/Carousel.tsx
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useEffect, useMemo, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  /** 1枚の占有率（%） */
  slideWidth?: string
  /** スライド最大幅(px) */
  maxWidthPx?: number
  /** スライド最小幅(px) */
  minWidthPx?: number
}

export default function Carousel({
  children,
  className = '',
  options,
  slideWidth = '85%',
  maxWidthPx = 720, 
  minWidthPx = 320,
}: Props) {
  // 中央スナップを強制
  const [emblaRef, api] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    slidesToScroll: 1,
    loop: true,
    ...(options ?? {}),
  })

  // 中央スライド強調用
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())

    // 初期化直後に 0 番を中央へ
    requestAnimationFrame(() => api.scrollTo(0))
    onSelect()

    api.on('select', onSelect)
    api.on('reInit', () => {
      api.scrollTo(api.selectedScrollSnap())
      onSelect()
    })

    return () => {
      // Embla のバージョンにより off が無い場合がある
      api.off?.('select', onSelect)
      api.off?.('reInit', onSelect)
    }
  }, [api])

  // 縦ホイールを横送りに
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!api) return
    // 横スク(deltaX)優先。縦しか出ないマウスでは deltaY を使う
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta === 0) return
    e.preventDefault()
    if (delta > 0) {
      api.scrollNext()
    } else {
      api.scrollPrev()
    }
  }

  const slides = useMemo(() => React.Children.toArray(children), [children])

  // 幅を % を基準に最小/最大で clamp
  const basis = typeof maxWidthPx === 'number'
    ? `clamp(${minWidthPx}px, ${slideWidth}, ${maxWidthPx}px)`
    : slideWidth

  return (
    <div className={`${className} w-full overflow-x-clip flex items-center`}>
      {/* viewport: 横スクのみ・スクロールバー非表示 */}
      <div
        className="overflow-hidden touch-pan-x overscroll-x-contain overscroll-y-none w-full"
        ref={emblaRef}
        aria-roledescription="carousel"
        onWheel={onWheel}
        data-embla="viewport" 
      >
        {/* track: 左右paddingは0にしてスナップ中心の見た目ズレを防ぐ */}
        <div className="flex will-change-transform w-full px-0 py-0" data-embla="container">
          {slides.map((child, i) => (
            <div
              key={i}
              className={[
                'transition-all motion-safe:duration-300 ease-out shrink-0',
                i === selected ? 'scale-100 opacity-100 z-10' : 'scale-95 opacity-60 z-0',
              ].join(' ')}
              style={{ flex: `0 0 ${basis}`, marginRight: i === slides.length - 1 ? 0 : '1rem' }}
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
