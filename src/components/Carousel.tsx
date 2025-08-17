// src/components/Carousel.tsx
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures'
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
    ...(options ?? {}),
  }

  // plugins 配列も any[] にしない
  const plugins = useMemo<EmblaPluginType[]>(
    () => [
      WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging',
      }) as EmblaPluginType,
    ],
    [],
  )

  // v8 は第2引数で plugins を受け取れる
  const [emblaRef, api] = useEmblaCarousel(baseOptions, plugins)
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!api) return

    const update = () => setSelected(api.selectedScrollSnap())

    const handleReInit = () => {
      const idx = api.selectedScrollSnap()
      // 再初期化後に同じ場所へ即復帰（アニメ無し）
      api.scrollTo(idx, false)
      setSelected(idx)
    }

    // 初期反映
    update()

    // "settle" だと折返し後に最終位置が確定してから反映されて安定
    api.on('settle', update)
    api.on('reInit', handleReInit)

    return () => {
      api.off?.('settle', update)
      api.off?.('reInit', handleReInit)
    }
  }, [api])

  // 追加: 選択スライドの video だけ再生
  useEffect(() => {
    if (!api) return

    const originals = api.slideNodes() // 元スライドだけ

    const playOnlySelected = () => {
      const idx = api.selectedScrollSnap()
      // 全videoを停止
      originals.forEach((el) => {
        const v = el.querySelector('video')
        if (v) v.pause()
      })
      // 選択スライドのvideoだけ再生
      const current = originals[idx]?.querySelector('video')
      if (current) {
        current.muted = true
        current.playsInline = true
        // 自動再生エラーは握りつぶす
        const p = current.play?.()
        if (typeof p?.catch === 'function')
          p.catch(() => {
            console.log('error')
          })
      }
      setSelected(idx)
    }

    // 初期 & 再初期化 & スナップ確定で実行
    playOnlySelected()
    api.on('settle', playOnlySelected)
    api.on('reInit', playOnlySelected)

    return () => {
      api.off?.('settle', playOnlySelected)
      api.off?.('reInit', playOnlySelected)
    }
  }, [api])

  const gutter = gutterPx ?? 0
  const edge = edgePaddingPx ?? 0

  return (
    <div className={`${className} w-full overflow-x-clip flex items-center`}>
      <div
        className="overflow-hidden touch-pan-x overscroll-x-contain overscroll-y-none w-full"
        style={{ paddingLeft: edge, paddingRight: edge }}
        ref={emblaRef}
        aria-roledescription="carousel"
        data-embla="viewport"
        data-embla-react
      >
        <div
          className="flex will-change-transform w-full"
          data-embla="container"
          style={{ marginLeft: -gutter, marginRight: -gutter }}
        >
          {slides.map((child, i) => (
            <div
              key={i}
              className="shrink-0 transition-all motion-safe:duration-300 ease-out scale-100 opacity-100 z-10"
              style={{ flex: `0 0 ${basis}`, paddingLeft: gutter, paddingRight: gutter }}
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
