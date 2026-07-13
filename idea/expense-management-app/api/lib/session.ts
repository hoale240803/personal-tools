import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { SignJWT, jwtVerify } from 'jose'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getEnv } from './env'

const DEV_SESSION_PATH = resolve(process.cwd(), '..', '.dev-session.json')

function isDevMode() {
  return process.env.VERCEL_ENV !== 'production'
}

export function persistDevSession(session: SessionData): void {
  if (!isDevMode()) return
  try {
    writeFileSync(DEV_SESSION_PATH, JSON.stringify(session, null, 2), 'utf-8')
  } catch {
    // ignore write errors silently
  }
}

function loadDevSession(): SessionData | null {
  if (!isDevMode()) return null
  try {
    const raw = readFileSync(DEV_SESSION_PATH, 'utf-8')
    const data = JSON.parse(raw) as SessionData
    if (!data.email || !data.accessToken || !data.refreshToken) return null
    return data
  } catch {
    return null
  }
}

const COOKIE_NAME = 'session'
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export interface SessionData {
  email: string
  name: string
  picture: string
  accessToken: string
  refreshToken: string
  spreadsheetId: string
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

/**
 * Looks up the session for a given email address.
 * Used by the Pub/Sub webhook where there is no request cookie available.
 *
 * In dev: reads .dev-session.json (single-user tool).
 * In production: reads from the dev session file as a fallback for a personal tool.
 * For multi-user support, extend this with a server-side session store.
 */
export async function readSessionByEmail(email: string): Promise<SessionData | null> {
  const dev = loadDevSession()
  if (dev && dev.email === email) return dev

  // Production: no server-side session store — webhook only processes for
  // the session owner whose token was used to call /api/gmail/watch.
  // Extend here if multi-user support is needed.
  console.warn(`[Session] No session found for ${email} (webhook requires active session)`)
  return null
}

export async function readSession(req: VercelRequest): Promise<SessionData | null> {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret())
      return {
        email: String(payload.email),
        name: String(payload.name),
        picture: String(payload.picture),
        accessToken: String(payload.accessToken),
        refreshToken: String(payload.refreshToken),
        spreadsheetId: String(payload.spreadsheetId ?? ''),
      }
    } catch {
      // JWT invalid or expired — fall through to dev session fallback
    }
  }

  return loadDevSession()
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
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000'
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  return `${proto}://${host}`
}
