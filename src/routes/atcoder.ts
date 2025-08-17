import { Hono } from 'hono'

export const atcoder = new Hono()

atcoder.get('/', async (c) => {
  const user = c.req.param('user')
  const r = await fetch(`https://atcoder.jp/users/${user}/history/json`, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  })
  if (!r.ok) {
    return c.text('bad gateway', 502)
  }
  c.header('Cashe-Control', 'public, max-age=3600, s-maxage=3600')
  c.header('Access-Control-Allow-Origin', '*')
  return c.json(await r.json())
})