// 強調クラス
const ACTIVE_ADD = ['scale-100', 'opacity-100', 'z-10']
const ACTIVE_REMOVE = ['scale-90', 'opacity-60', 'z-0']
const INACTIVE_ADD = ['scale-90', 'opacity-60', 'z-0']
const INACTIVE_REMOVE = ['scale-100', 'opacity-100', 'z-10']

export interface Carousel {
  track: HTMLElement
  slides: HTMLElement[]
  setActive: (idx: number) => void
  update: () => void
  goBy: (dir: number) => void
  destroy: () => void
}

export function initCarousel(trackId = 'carousel-track'): Carousel | null {
  const track = document.getElementById(trackId)
  if (!track) return null

  const slides = Array.from(track.querySelectorAll<HTMLElement>('.js-slide'))
  let activeIdx = 0

  const setActive = (idx: number) => {
    activeIdx = idx
    slides.forEach((el, i) => {
      if (i === idx) {
        el.classList.add(...ACTIVE_ADD)
        el.classList.remove(...ACTIVE_REMOVE)
        el.setAttribute('aria-current', 'true')
      } else {
        el.classList.add(...INACTIVE_ADD)
        el.classList.remove(...INACTIVE_REMOVE)
        el.setAttribute('aria-current', 'false')
      }
    })
  }

  // 指定インデックスを“中央”にスクロール
  const centerOn = (track: HTMLElement, el: HTMLElement, smooth = true) => {
    const trackRect = track.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    // el の左端までの相対距離 + 現在の scrollLeft
    const elLeftInTrack = track.scrollLeft + (elRect.left - trackRect.left)
    const target = elLeftInTrack - (track.clientWidth - el.clientWidth) / 2
    track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' })
  }

  const update = () => {
    const rect = track.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    let best = 0
    let bestDist = Number.POSITIVE_INFINITY

    slides.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      const mid = r.left + r.width / 2
      const d = Math.abs(mid - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })

    setActive(best)
  }

  const goBy = (dir: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, activeIdx + dir))
    const el = slides[next]
    if (el) centerOn(track, el, true)
  }

  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }

  const onScroll = () => requestAnimationFrame(update)
  const onResize = () => {
    const el = slides[activeIdx] ?? slides[0]
    if (el) centerOn(track, el, false)
    update()
  }

  track.addEventListener('scroll', onScroll, { passive: true })
  track.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('resize', onResize)

  // 矢印ボタン（任意）
  document.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((btn) => {
    const dir = parseInt(btn.dataset.dir ?? '0', 10) || 0
    btn.addEventListener('click', () => goBy(dir))
  })

  // 初期反映：DOMレイアウトが安定してから中央へ
  requestAnimationFrame(() => {
    const el = slides[0]
    if (el) centerOn(track, el, true)
    update()
  })

  const destroy = () => {
    track.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  }

  return { track, slides, setActive, update, goBy, destroy }
}

// 自動初期化（任意）
if (typeof window !== 'undefined') {
  const run = () => initCarousel()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true })
  } else {
    run()
  }
}
