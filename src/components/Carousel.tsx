// src/components/Carousel.tsx
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useEffect, useMemo, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  slideWidth?: string
  maxWidthPx?: number
  minWidthPx?: number
  gutterPx?: number
  edgePaddingPx?: number
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
}: Props) {
  // any[] 回避のために戻り型を固定
  const slides = useMemo<React.ReactNode[]>(() => React.Children.toArray(children), [children])

  // clamp は min/max が両方あるときだけ
  const basis =
    slideWidth && maxWidthPx != null && minWidthPx != null
      ? `clamp(${minWidthPx}px, ${slideWidth}, ${maxWidthPx}px)`
      : (slideWidth ?? '100%')

  const baseOptions: EmblaOptionsType = {
    align: 'center',
    dragFree: false,
    slidesToScroll: 1,
    skipSnaps: false,
    loop: slides.length > 1,
    inViewThreshold: 0.6,
    watchSlides: false,
    containScroll: 'trimSnaps',
    ...(options ?? {}),
  }

  // v8 は第2引数で plugins を受け取れる
  const [emblaRef, api] = useEmblaCarousel(baseOptions)
  const [selected] = useState(0)

  useEffect(() => {
    if (!api) return
    const fix = () => api.scrollTo(api.selectedScrollSnap(), false)
    requestAnimationFrame(fix) // 初回フレーム後に1回だけ
    api.on('reInit', fix) // 画像/リサイズで再初期化時も
    return () => {
      api.off?.('reInit', fix)
    }
  }, [api])

  const gutter = gutterPx ?? 0
  const edge = edgePaddingPx ?? 0

  const [mobileGutter, setMobileGutter] = useState(gutter)
  const [mobileEdge, setMobileEdge] = useState(edge)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateResponsive = () => {
      const isMobile = window.innerWidth <= 1024
      setMobileGutter(isMobile ? gutter / 1.5 : gutter)
      setMobileEdge(isMobile ? Math.max(0, Math.round(edge / 1.5)) : edge)
    }

    updateResponsive()
    window.addEventListener('resize', updateResponsive)

    return () => {
      window.removeEventListener('resize', updateResponsive)
    }
  }, [gutter, edge])

  return (
    <div className={`${className} w-full overflow-x-clip flex items-center`}>
      <div
        className="overflow-hidden touch-pan-x overscroll-x-contain overscroll-y-none w-full"
        style={{ paddingLeft: mobileEdge, paddingRight: mobileEdge }}
        ref={emblaRef}
        aria-roledescription="carousel"
        data-embla="viewport"
        data-embla-react
      >
        <div
          className="flex will-change-transform w-full"
          data-embla="container"
          style={{ marginLeft: -mobileGutter, marginRight: -mobileGutter }}
        >
          {slides.map((child, i) => (
            <div
              key={i}
              className="shrink-0 transition-all motion-safe:duration-300 ease-out opacity-100 z-10 bg-red-500 h-[30vh] sm:h-[50vh] flex items-center justify-center"
              style={{
                flex: `0 0 ${basis}`,
                paddingLeft: mobileGutter,
                paddingRight: mobileGutter,
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
