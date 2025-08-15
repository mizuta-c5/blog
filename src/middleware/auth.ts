import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { Context, Next } from 'hono'
import type { Bindings, Variables } from '../types'

// ユーザーを取得
export async function getUserFromCookie(c: Context<{ Bindings: Bindings, Variables: Variables}>) {
    const token = getCookie(c, 'session')
    if (!token) return null
    try {
        const payload = await verify(token, c.env.SESSION_SECRET)
        return { name: (payload as any).sub as string }
    } catch {
        return null
    }
}

// 認証が必要なルートに対してユーザーを設定
export async function requireAuth(c: Context<{ Bindings: Bindings, Variables: Variables}>, next: Next) {
    const user = await getUserFromCookie(c);
    if (!user) {
        return c.redirect('/login', 302)
    }
    c.set('user', user)
    await next()
}

export const cookies = { setCookie, deleteCookie }
