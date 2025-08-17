// src/types/embla-carousel-react.d.ts
declare module 'embla-carousel-react' {
    import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
  
    // Embla の React フックは [viewportRef, api] を返す
    export default function useEmblaCarousel(
      options?: EmblaOptionsType
    ): [
      (node: HTMLDivElement | null) => void,
      EmblaCarouselType | undefined
    ]
  }
  