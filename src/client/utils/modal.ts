// This function sets up a dialog with a trigger button and dialog element
export function setupDialog(triggerId: string, dialogId: string) {
  const btn = document.getElementById(triggerId)
  const dlg = document.getElementById(dialogId) as HTMLDialogElement | null
  // Check if button and dialog exist and if the dialog supports showModal
  if (!btn || !dlg || typeof dlg.showModal !== 'function') return

  // Open the dialog with animation
  const open = () => {
    dlg.showModal()
    requestAnimationFrame(() => dlg.classList.add('is-open'))
  }

  // Close the dialog
  const closeWithAnim = () => {
    dlg.classList.remove('is-open')
    let done = false
    const onEnd = () => {
      // Check if the operation is done
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
    // Check for Enter or Space key press
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
