export function setupDialog(triggerId: string, dialogId: string) {
  const btn = document.getElementById(triggerId)
  const dlg = document.getElementById(dialogId) as HTMLDialogElement | null
  if (!btn || !dlg || typeof dlg.showModal !== 'function') return

  const open = () => {
    dlg.showModal()
    requestAnimationFrame(() => dlg.classList.add('is-open'))
  }

  const closeWithAnim = () => {
    dlg.classList.remove('is-open')
    let done = false
    const onEnd = () => {
      if (done) return
      done = true
      dlg.removeEventListener('transitionend', onEnd, true)
      dlg.close()
    }
    dlg.addEventListener('transitionend', onEnd, true)
    setTimeout(onEnd, 600)
  }

  btn.addEventListener('click', open)
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  })

  dlg.querySelector<HTMLElement>('.overlay')?.addEventListener('click', closeWithAnim)
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault()
    closeWithAnim()
  })
}
