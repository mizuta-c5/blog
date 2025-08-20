interface Slide {
  section: string
  card: string
  pane: string
  termBar: string
  termOut: string
  termInRow: string
  termIn: string
  terminalEmuCard: string
  ring: string
}

export const slide: Slide = {
  section: 'mx-auto w-full',
  // p-2 → モバイルで p-1、SM以上で従来どおり p-2
  card: 'relative rounded-[22px] bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-xl w-full aspect-[16/9] p-0.5 sm:p-1.5',
  // pane も同様に
  pane: 'relative overflow-hidden rounded-[16px] p-1 sm:p-2',
  // バー/本文周りも少し詰めるとバランス良い
  termBar: 'flex items-center border-b border-zinc-200/70 px-3 sm:px-4 py-1.5 sm:py-2 gap-1',
  termOut:
    'min-h-0 grow whitespace-pre-wrap font-mono text-[13px] leading-6 text-zinc-800 overflow-y-auto',
  termInRow: 'border-t border-zinc-200/70 px-3 sm:px-4 py-2 sm:py-3',
  termIn: 'flex-1 outline-none placeholder:text-zinc-400 text-emerald-500',
  terminalEmuCard: 'relative group w-full h-full flex justify-center items-center w-[]',
  ring: 'ring-1 ring-inset ring-black/10 dark:ring-white/10',
}
