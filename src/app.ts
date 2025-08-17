import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

// Internal routes
import { auth } from './routes/auth'
import { blog } from './routes/blog'
import { home } from './routes/index'

// Type imports
import type { Bindings, Variables } from './types/misc'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', logger())
app.use('*', secureHeaders())

// ルーティング
app.route('/', home)
app.route('/', auth)
app.route('/', blog)

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
