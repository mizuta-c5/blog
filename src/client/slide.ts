interface Slide {
  section: string
  card: string
  pane: string
  termBar: string
  termOut: string
  termInRow: string
  termIn: string
  ring: string
}

export const slide: Slide = {
  section: 'mx-auto w-full md:mt-12',
  card: 'relative rounded-[22px] bg-zinc-50/60 dark:bg-zinc-900/50 backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 p-2',
  pane: 'relative overflow-hidden rounded-[16px] ring-1 ring-inset ring-black/10 dark:ring-white/10',
  termBar: 'flex items-center gap-2 border-b border-zinc-200/70 px-4 py-2',
  termOut:
    'min-h-0 grow whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 text-zinc-800 overflow-y-auto',
  termInRow: 'border-t border-zinc-200/70 px-4 py-3',
  termIn: 'flex-1 outline-none placeholder:text-zinc-400 text-zinc-800',
  ring: 'your-ring-class',
}
