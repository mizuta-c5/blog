import { useEffect, useMemo, useRef, useState } from "react"
import { slide } from "../client/slide"

// Lightweight, purely front-end terminal card (no real command execution)
// - History (↑/↓)
// - Tab completion (commands)
// - Fake commands: help, clear, echo, date, whoami, uname, pwd, ls, cat, open, theme
// - Autoscroll, focus-on-click, optional themes

export default function TerminalCard() {
  interface Line {
    kind: "in" | "out"
    text: string
  }
  type Theme = "matrix" | "classic" | "light"

  const [lines, setLines] = useState<Line[]>([{
    kind: "out",
    text:
      "Welcome! Type `help` to see available commands.\nThis is a simulated terminal — nothing actually runs.",
  }])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState<number | null>(null)
  const [theme, setTheme] = useState<Theme>("matrix")

  const outRef = useRef<HTMLDivElement | null>(null)
  const inRef = useRef<HTMLInputElement | null>(null)

  const prompt = useMemo(() => "guest@portfolio:~$", [])

  const themeClasses = useMemo(() => {
    switch (theme) {
      case "light":
        return "bg-white text-zinc-900 border border-zinc-200"
      case "classic":
        return "bg-zinc-900 text-zinc-100"
      default:
        return "bg-black text-green-500"
    }
  }, [theme])

  // Basic fake file system (flat) for ls/cat demo
  const files = useMemo(
    () => ({
      "about.txt": `Hi, I’m Renku.\nI build web apps and study quantum + security.`,
      "skills.txt": `TypeScript, React, Tailwind, Hono, Cloudflare Workers\nPython, Django, SQL, Linux, pentesting basics`,
      "projects.txt": `• KPI dashboard with token price deltas\n• Habit tracker (Django + React)\n• Cloudflare Workers blog`,
    }),
    []
  )

  // --- Command handlers ----------------------------------------------------
  type Handler = (args: string[]) => string | null | Promise<string | null>

  const handlers: Record<string, Handler> = {
    help: () =>
      [
        "Available commands:",
        "  help           Show this help",
        "  clear          Clear the screen",
        "  echo <text>    Print text",
        "  date           Show local time",
        "  whoami         Print user",
        "  uname          Print system info",
        "  pwd            Print directory",
        "  ls             List demo files",
        "  cat <file>     Show file (about.txt | skills.txt | projects.txt)",
        "  open <url>     Open link in new tab",
        "  theme <name>   matrix | classic | light",
      ].join("\n"),

    clear: () => {
      setLines([])
      return null
    },

    echo: (args) => args.join(" "),

    date: () => new Date().toLocaleString(),

    whoami: () => "guest",

    uname: () => "portfolio 1.0.0 x86_64 (simulated)",

    pwd: () => "~/",

    ls: () => Object.keys(files).join("  "),

    cat: (args) => {
      const name = args[0]
      if (!name) return "cat: missing file name"
      const content = (files as Record<string, string>)[name]
      return content ?? `cat: ${name}: No such file`
    },

    open: (args) => {
      const url = args[0]
      if (!url) return "open: missing url"
      // add protocol if omitted
      const finalUrl = /^(https?:)?\/\//.test(url) ? url : `https://${url}`
      try {
        window.open(finalUrl, "_blank", "noopener,noreferrer")
        return `Opening ${finalUrl}…`
      } catch {
        return `open: failed to open ${finalUrl}`
      }
    },

    theme: (args) => {
      const t = (args[0] as Theme) || "matrix"
      if (!(["matrix", "classic", "light"] as const).includes(t)) {
        return "theme: supported -> matrix | classic | light"
      }
      setTheme(t)
      return `Theme set to ${t}`
    },
  }

  const commandList = useMemo(() => Object.keys(handlers), [handlers])

  // Tokenize respecting quoted strings
  const tokenize = (line: string): string[] => {
    const matches = line.match(/"([^"]*)"|'([^']*)'|\S+/g) ?? []
    return matches.map((m) => (m.startsWith('"') || m.startsWith("'") ? m.slice(1, -1) : m))
  }

  const run = async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    // echo the input as a line
    setLines((prev) => [...prev, { kind: "in", text: `${prompt} ${trimmed}` }])

    const [cmd, ...args] = tokenize(trimmed)
    const handler = handlers[cmd]

    if (!handler) {
      setLines((prev) => [
        ...prev,
        { kind: "out", text: `${cmd}: command not found (try \`help\`)` },
      ])
      return
    }

    try {
      const out = await handler(args)
      if (out) {
        setLines((prev) => [...prev, { kind: "out", text: out }])
      }
    } catch (e) {
      setLines((prev) => [...prev, { kind: "out", text: String(e) }])
    }
  }

  // Autoscroll
  useEffect(() => {
    const el = outRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  // Focus input on mount and click
  useEffect(() => {
    inRef.current?.focus()
  }, [])

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = input
      setInput("")
      setHistory((h) => (val ? [...h, val].slice(-100) : h))
      setHistIndex(null)
      void run(val)
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
          setInput("")
          return null
        }
        setInput(history[next] ?? "")
        return next
      })
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const [first] = tokenize(input)
      const partial = (first ?? "").toLowerCase()
      if (!partial) return
      const matches = commandList.filter((c) => c.startsWith(partial))
      if (matches.length === 1) {
        // complete command
        setInput(matches[0] + (input.endsWith(" ") ? "" : " "))
      } else if (matches.length > 1) {
        setLines((prev) => [...prev, { kind: "out", text: matches.join("  ") }])
      }
    }
  }

  return (
    <div className="relative group" onClick={() => inRef.current?.focus()}>
      <div className={slide.card}>
        <div className={`${slide.pane} flex flex-col ${themeClasses}`} style={{ aspectRatio: "16/9" }}>
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
