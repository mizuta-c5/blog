import { Context, Next } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import type { Bindings, Variables } from '../types'

interface JwtPayload {
  sub: string
  // Add other properties if needed
}

// This function retrieves the user from a cookie using JWT verification
export async function getUserFromCookie(c: Context<{ Bindings: Bindings; Variables: Variables }>) {
  const token = getCookie(c, 'session')
  // Return null if token is not present
  if (!token) return null
  try {
    // Verify the token using the session secret
    const payload = (await verify(token, c.env.SESSION_SECRET)) as JwtPayload
    return { name: payload.sub }
  } catch {
    return null
  }
}

// This function ensures the user is authenticated before proceeding
export async function requireAuth(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) {
  const user = await getUserFromCookie(c)
  // Check if user is present
  if (!user) {
    return c.redirect('/login', 302)
  }
  c.set('user', user)
  await next()
}

export const cookies = { setCookie, deleteCookie }
