import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getEnv } from './env'

const COOKIE_NAME = 'session'
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export interface SessionData {
  email: string
  name: string
  picture: string
  accessToken: string
  refreshToken: string
}

function getSecret() {
  return new TextEncoder().encode(getEnv('SESSION_SECRET'))
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, decodeURIComponent(rest.join('='))]
    }),
  )
}

function isProduction() {
  return process.env.VERCEL_ENV === 'production'
}

export async function createSessionToken(session: SessionData): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret())
}

export async function readSession(req: VercelRequest): Promise<SessionData | null> {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      email: String(payload.email),
      name: String(payload.name),
      picture: String(payload.picture),
      accessToken: String(payload.accessToken),
      refreshToken: String(payload.refreshToken),
    }
  } catch {
    return null
  }
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const secure = isProduction() ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`,
  )
}

export function clearSessionCookie(res: VercelResponse) {
  const secure = isProduction() ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  )
}

export function getAppOrigin(req: VercelRequest): string {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000'
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  return `${proto}://${host}`
}
