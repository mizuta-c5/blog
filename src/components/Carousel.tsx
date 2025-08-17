// src/components/Carousel.tsx
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useEffect, useMemo, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  aspect?: '16/9' | '3/2'
  slideWidth?: string
}

function isEmblaApi(x: unknown): x is EmblaCarouselType {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.on === 'function' &&
    typeof o.scrollNext === 'function' &&
    typeof o.scrollPrev === 'function' &&
    typeof o.selectedScrollSnap === 'function'
  )
}

type EmblaWithOff = EmblaCarouselType & {
  off: (event: string, handler: (...args: unknown[]) => void) => void
}

export default function Carousel({
  children,
  className = '',
  options,
  aspect = '16/9',
  slideWidth = '85%',
}: Props) {
  const [emblaRef, api] = useEmblaCarousel({
    align: 'center',
    ...(options ?? {}),
  })
  const [selected, setSelected] = useState(0)

  // ✅ Tailwindに確実に認識させるため、動的テンプレートをやめてリテラル分岐に
  const aspectClass = aspect === '3/2' ? 'aspect-[3/2]' : 'aspect-[16/9]'

  useEffect(() => {
    if (!isEmblaApi(api)) {
      console.error('Embla API is not initialized correctly.')
      return
    }
    console.log('Embla API initialized:', api)
    const handleSelect = () => {
      console.log('Slide selected:', api.selectedScrollSnap())
      setSelected(api.selectedScrollSnap())
    }
    handleSelect()
    api.on('select', handleSelect)
    api.on('reInit', handleSelect)
    return () => {
      const off = (api as Partial<EmblaWithOff>).off
      if (typeof off === 'function') {
        off.call(api as EmblaWithOff, 'select', handleSelect)
        off.call(api as EmblaWithOff, 'reInit', handleSelect)
      }
    }
  }, [api])

  const slides = useMemo(() => React.Children.toArray(children), [children])

  const scrollPrev = () => {
    if (isEmblaApi(api)) api.scrollPrev()
  }
  const scrollNext = () => {
    if (isEmblaApi(api)) api.scrollNext()
  }

  return (
    <div className={`${className} bg-red-500 w-screen overflow-x-hidden`}>
      {/* ✅ スクロールバー非表示 & ドラッグのための touch-pan-y は viewport に付ける */}
      <div
        className="overflow-hidden touch-pan-y scroll-snap-x scroll-snap-mandatory scroll-padding-50px h-full w-full flex justify-center items-center"
        ref={emblaRef}
        aria-roledescription="carousel"
      >
        <div className="flex justify-center -ml-6 will-change-transform">
          {slides.map((child, i) => (
            <div
              key={i}
              className={[
                'pl-6 transition-all motion-safe:duration-300 ease-out',
                i === selected ? 'scale-100 opacity-100 z-10 h-full' : 'scale-95 opacity-60 z-0',
              ].join(' ')}
              style={{ flex: `0 0 ${slideWidth}`, marginRight: '10px' }}
              aria-current={i === selected ? 'true' : 'false'}
            >
              {/* ✅ 高さが0にならない（Tailwindが確実に生成） */}
              <div className={aspectClass}>
                <div className="h-full w-full">{child}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={scrollPrev}
          className="rounded-full bg-white/80 px-3 py-1.5 text-sm ring-1 ring-zinc-200"
        >
          ←
        </button>
        <button
          onClick={scrollNext}
          className="rounded-full bg-white/80 px-3 py-1.5 text-sm ring-1 ring-zinc-200"
        >
          →
        </button>
      </div>
    </div>
  )
}
