import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { auth } from './routes/auth'
import { editor } from './routes/editor'
import { home } from './routes/index'
import { post } from './routes/post'
import type { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', logger())
app.use('*', secureHeaders())

// ルーティング
app.route('/', home)
app.route('/', auth)
app.route('/', editor)
app.route('/', post)

// debug

// debug
app.get('/__ping', (c) => c.text('pong'))
app.get('/__env', (c) =>
  c.json({
    hasDB: !!c.env.DB,
    hasAdminUser: !!c.env.ADMIN_USER,
    hasSessionSecret: !!c.env.SESSION_SECRET,
  }),
)

export default app
