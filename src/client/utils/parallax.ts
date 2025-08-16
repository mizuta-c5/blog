export function setupParallax(paneSel: string, contentSel: string) {
  const pane = document.querySelector<HTMLElement>(paneSel)
  const content = document.querySelector<HTMLElement>(contentSel)
  if (!pane || !content) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  function apply(e: MouseEvent | Touch) {
    if (!pane || !content) return // Ensure pane and content are not null
    const r = pane.getBoundingClientRect()
    const x = ('clientX' in e ? e.clientX : 0) - r.left
    const y = ('clientY' in e ? e.clientY : 0) - r.top
    const nx = x / r.width - 0.5
    const ny = y / r.height - 0.5
    content.style.transform = `translate(${nx * 5}px, ${ny * 3}px) scale(1.005)`
  }
  function reset() {
    if (!content) return // Ensure content is not null
    content.style.transform = 'translate(0,0) scale(1)'
  }

  pane.addEventListener('mousemove', (e) => apply(e))
  pane.addEventListener('mouseleave', reset)
  pane.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0]
      if (t) apply(t)
    },
    { passive: true },
  )
  pane.addEventListener('touchend', reset)
}
