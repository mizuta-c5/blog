// src/client/atcoder.ts
import Chart from 'chart.js/auto'

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

function toWeeklySeries(raw: any[]) {
  
  const pts = raw
    .map((d) => ({
      t: new Date(d.EndTime ?? d.ContestEndTime ?? d.ContestStartTime ?? d.Date),
      r: (d.NewRating ?? d.newRating ?? d.New_Rating) | 0,
    }))
    .filter((p) => !isNaN(p.t))
    .sort((a, b) => +a.t - +b.t)

  if (!pts.length) return { labels: [] as string[], values: [] as number[] }

  const JST = 9 * 3600 * 1000,
    WEEK = 7 * 24 * 3600 * 1000
  const toMonJST = (d: Date) => {
    const j = new Date(d.getTime() + JST)
    const dow = (j.getUTCDay() + 6) % 7
    const mid = Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate() - dow)
    return new Date(mid - JST)
  }

  const start = toMonJST(pts[0].t),
    end = new Date()
  const labels: string[] = [],
    values: number[] = []
  let w = start,
    i = 0,
    last = pts[0].r
  while (w <= end) {
    while (i < pts.length && pts[i].t < new Date(w.getTime() + WEEK)) {
      last = pts[i].r
      i++
    }
    labels.push(w.toISOString().slice(0, 10))
    values.push(last)
    w = new Date(w.getTime() + WEEK)
  }
  return { labels, values }
}

async function getWeeklyData(user: string) {
  const KEY = `atcoder_cache_${user}`
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null') as {
      savedAt: number
      data: any[]
    } | null
    if (c && Date.now() - c.savedAt < ONE_WEEK) return c.data
  } catch {}

  const url = `/data/atcoder-${encodeURIComponent(user)}.json`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    console.error('static json missing:', res.status, url)
    return []
  }
  const data = (await res.json()) as any[]
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {}
  return data
}

function clearCache(user: string) {
  const KEY = `atcoder_cache_${user}`
  localStorage.removeItem(KEY)
}

// Clear cache for the user 'richard_5_'
clearCache('richard_5_')

// ページ内の <script data-atcoder ...> を走査して描画
async function boot(node: HTMLScriptElement) {
  const user = node.dataset.user || 'richard_5_'
  const target = node.dataset.target || 'atcoder-chart'
  const raw = await getWeeklyData(user)
  const { labels, values } = toWeeklySeries(raw)
  const el = document.getElementById(target) as HTMLCanvasElement | null
  if (!el) return

  new Chart(el, {
    type: 'line',
    data: { labels, datasets: [{ data: values, stepped: true, fill: false }] },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 親要素の高さにフィット
      plugins: {
        legend: { display: false },
        title: { display: true, text: `AtCoder Rating (Weekly) — ${user}` },
      },
      scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { beginAtZero: false } },
    },
  })
}

Array.from(document.querySelectorAll<HTMLScriptElement>('script[data-atcoder]')).forEach(boot)
