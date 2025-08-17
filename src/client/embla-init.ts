// src/client/embla-init.ts
import EmblaCarousel, { type EmblaOptionsType } from 'embla-carousel'

const initEmbla = (root: HTMLElement, options?: EmblaOptionsType) => {
  // viewport は data-embla="viewport"
  const viewport = root.matches('[data-embla="viewport"]')
    ? root
    : root.querySelector<HTMLElement>('[data-embla="viewport"]')

  if (!viewport) return

  const embla = EmblaCarousel(viewport, {
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    slidesToScroll: 1,
    loop: true,
    duration: 1000,
    ...options,
  })

  // 横ホイール（または縦しか出ないマウスは縦）で左右に送る
  const onWheel = (e: WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (!delta) return
    e.preventDefault()
    if (delta > 0) {
      embla.scrollNext()
    } else {
      embla.scrollPrev()
    }
  }
  viewport.addEventListener('wheel', onWheel, { passive: false })

  // data-dir ボタンがあれば連動
  const buttons = viewport.parentElement?.querySelectorAll<HTMLButtonElement>('[data-dir]') ?? []
  buttons.forEach((btn) => {
    const dir = Number.parseInt(btn.dataset.dir ?? '0', 10) || 0
    btn.addEventListener('click', () => (dir > 0 ? embla.scrollNext() : embla.scrollPrev()))
  })
}

// 複数カルーセル対応：data-embla="viewport" を拾って初期化
const boot = () => {
  const viewports = document.querySelectorAll<HTMLElement>('[data-embla="viewport"]')
  viewports.forEach((vp) => initEmbla(vp))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
