import { useEffect, useMemo, useState, useRef } from 'react'
import { slide } from '../client/slide'

type Theme = 'matrix' | 'classic' | 'light'
type WasmAction =
  | { kind: 'print'; text: string }
  | { kind: 'clear' }
  | { kind: 'open'; url: string }
  | { kind: 'theme'; value: Theme }

// wasmモジュールの型
interface CmdEngineModule {
  default: () => Promise<void>
  handle_command: (input: string) => WasmAction[] | unknown[]
  commands: () => string[] | unknown[]
}

export default function TerminalEmuCard() {
  interface Line {
    kind: 'in' | 'out'
    text: string
  }

  const [lines, setLines] = useState<Line[]>([
    {
      kind: 'out',
      text: "Welcome! Type 'help' to see available commands.\nThis is a simulated terminal - nothing actually runs.",
    },
  ])

  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState<number | null>(null)
  const [theme, setTheme] = useState<Theme>('matrix')
  const [cmdlist, setCmdList] = useState<string[]>([])

  const outRef = useRef<HTMLDivElement | null>(null)
  const inRef = useRef<HTMLInputElement | null>(null)
  const engineRef = useRef<CmdEngineModule | null>(null)

  const prompt = useMemo(() => 'guest@portfolio:~$', [])

  const themeClasses = useMemo(() => {
    switch (theme) {
      case "light":   return "bg-white text-zinc-900 border border-zinc-200"
      case "classic": return "bg-zinc-900 text-zinc-100"
      default:        return "bg-black text-green-500"
    }
  }, [theme])

  // ===== WASM初期化 =====
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (typeof window === "undefined") return
      const url = new URL('/wasm_term/cmd_engine.js', window.location.href).toString()
      const mod = (await import(/* @vite-ignore */ url)) as unknown as CmdEngineModule
      await mod.default()
      if (!mounted) return 
      engineRef.current = mod

      // コマンド一覧(Tab補完用)
      const list = mod.commands()
      setCmdList(Array.isArray(list) ? list as string[] : [])
    })()
    return () => {
      mounted = false
    }
  }, [])

  // ===== コマンド実行 =====
  const run = async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    // 入力行をエコー
    setLines((prev) => [...prev, { kind: "in", text: `${prompt} ${trimmed}`}])

    const engine = engineRef.current
    if (!engine) {
      setLines((prev) => [...prev, { kind: "out", text: "engine: not ready"}])
      return
    }

    try {
      const actions = engine.handle_command(trimmed) as WasmAction[] | unknown[] | undefined
      const arr: WasmAction[] = Array.isArray(actions) ? actions : []

      for (const a of arr) {
        switch (a.kind) {
          case "print":
            setLines((prev) => [...prev, { kind: "out", text: a.text}])
            break
          case "clear":
            setLines([])
            break
          case "open":
            try {
              window.open(a.url, "_blank", "noopener, noreferrer") 
            } catch {
              setLines((prev) => [...prev, { kind: "out", text: "open failed" }])
            }
            break
          case "theme":
            if (["matrix", "classic", "light"].includes(a.value)) {
              setTheme(a.value)
            }
            break
        }

      }
    } catch (e) {
      setLines((prev) => [...prev, { kind: "out", text: String(e)}])
    }
  }

  // ===== オートスクロール =====
  useEffect(() => {
    const el = outRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [lines])

  // 初期フォーカス
  useEffect(() => {
    inRef.current?.focus()
  }, [])

  // ===== キーハンドラ(履歴 & Tab補完) =====
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = input
      setInput("")
      setHistory((h) => (val ? [...h, val].slice(-100) : h))
      setHistIndex(null)
      run(val).catch((e) => setLines((prev) => [...prev, { kind: "out", text: String(e)}]))
      return
    } 
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHistIndex((idx) => {
        const next = idx === null ? history.length - 1 : Math.max(0, idx - 1)
        setInput(history[next] ?? input)
        return next
      })
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHistIndex((idx) => {
        if (idx === null) return null
        const next = idx + 1
        if (next >= history.length) {
          setInput("");
          return null
        }
        setInput(history[next] ?? "")
        return next
      })
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const first = (input.trim().split(/\s+/)[0] ?? "").toLowerCase()
      if (!first) return
      const matches = cmdlist.filter((c) => c.startsWith(first))
      if (matches.length === 1) {
        setInput(matches[0] + (input.endsWith(" ") ? "" : " "))
      } else if (matches.length > 1) {
        setLines((prev) => [...prev, { kind: "out", text: matches.join(" ")}])
      }
    }
  }

  // ===== レンダリング =====
  return (
    <div className="relative group" onClick={() => inRef.current?.focus()}>
      <div className={slide.card}>
        <div className={`${slide.pane} flex flex-col ${themeClasses}`} style={{ aspectRatio: "16/9" }}>
         {/* ← ここにクライアントでターミナルを後乗せする */}
         <div className="js-terminal-emu" />
          {/* Title bar */}
          <div className={`${slide.termBar} select-none`}>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-auto text-[11px] md:text-xs text-zinc-500">
              {prompt.replace(":$", "")}
            </span>
          </div>

          {/* Output */}
          <div ref={outRef} className={`${slide.termOut} font-mono text-[13px] leading-6`}>
            {lines.map((ln, i) => (
              <pre key={i} className={`${ln.kind === "in" ? "opacity-90" : "opacity-100"} whitespace-pre-wrap`}>{ln.text}</pre>
            ))}
          </div>

          {/* Input */}
          <div className={`${slide.termInRow} font-mono text-[13px] leading-6`}>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 select-none">$</span>
              <input
                ref={inRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                className={`${slide.termIn} bg-transparent outline-none w-full placeholder:text-zinc-500/70`}
                placeholder="type 'help' and hit Enter"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
