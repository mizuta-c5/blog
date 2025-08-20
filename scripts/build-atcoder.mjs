// ./scripts/build-atcoder.mjs
// Node v18+ 推奨（fetch 同梱）
import fs from 'node:fs/promises'
import path from 'node:path'

const users =
  (process.env.ATCODER_USER || 'richard_5_')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

const OUT_DIR = path.join(process.cwd(), 'public', 'data')

async function fetchUser(user) {
  const url = `https://atcoder.jp/users/${encodeURIComponent(user)}/history/json`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`Upstream ${res.status} ${res.statusText} for ${user}`)
  const text = await res.text()
  // JSON 健全性チェック（BOM混入なども一旦受けてから parse）
  const data = JSON.parse(text)
  await fs.mkdir(OUT_DIR, { recursive: true })
  const outFile = path.join(OUT_DIR, `atcoder-${user}.json`)
  await fs.writeFile(outFile, JSON.stringify(data)) // 最小化保存
  console.log(`✅ Wrote ${outFile} (${data.length} recs)`)
}

async function main() {
  for (const u of users) {
    try {
      await fetchUser(u)
    } catch (e) {
      console.error(`⚠️  build-atcoder: ${u}:`, e?.message || e)
      // 失敗しても既存ファイルがあればそれを使いたいので exit 0
    }
  }
}
main()
