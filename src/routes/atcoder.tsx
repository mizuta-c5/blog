import { Hono } from 'hono'

const ONE_WEEK = 60 * 60 * 24 * 7

export const atcoder = new Hono()

atcoder.get('/atcoder/:user', async (c) => {
  const user = c.req.param('user')
  const upstreamURL = `https://atcoder.jp/users/${user}/history/json`

  // Cloudflare Workers では caches.default に Request をキーとして渡す
  const cacheKey = new Request(new URL(c.req.url), { method: 'GET' })
  const cache = caches.default

  // 1) キャッシュヒットならそのまま返す（ヘッダも保持）
  const hit = await cache.match(cacheKey)
  if (hit) return hit

  // 2) 取得
  const upstream = await fetch(upstreamURL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    // （任意）上流の自動キャッシュを無効化して手動管理に一元化
    cf: { cacheTtl: 0, cacheEverything: false },
  })
  if (!upstream.ok) return c.text('bad gateway', 502)

  const body = await upstream.text()

  // 3) レスポンス作成
  const res = new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${ONE_WEEK}, stale-while-revalidate=86400`,
      'CDN-Cache-Control': `max-age=${ONE_WEEK}`,
      Vary: 'Accept-Encoding',
    },
  })

  // 4) 非同期で保存（clone を忘れない）
  c.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))

  return res
})
