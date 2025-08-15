import type { D1Database } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database // データベース
  ADMIN_USER: string // 管理者ユーザー
  ADMIN_PASS: string // 管理者パスワード
  SESSION_SECRET: string // セッションシークレット
  NODE_ENV: string // ノード環境
}

export type Variables = {
  user: { name: string } // ユーザー
}
