import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { SignJWT, jwtVerify, decodeJwt } from 'jose'
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

export function loadDevSession(): SessionData | null {
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
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60 // 90 days
const REFRESH_THRESHOLD_SECONDS = 7 * 24 * 60 * 60 // renew if < 7 days remaining

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

function isSessionValid(session: SessionData): boolean {
  // If refresh token is missing, session cannot be renewed — force re-login
  return Boolean(session.refreshToken)
}

export async function readSession(req: VercelRequest): Promise<SessionData | null> {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret())
      const session: SessionData = {
        email: String(payload.email),
        name: String(payload.name),
        picture: String(payload.picture),
        accessToken: String(payload.accessToken),
        refreshToken: String(payload.refreshToken),
        spreadsheetId: String(payload.spreadsheetId ?? ''),
      }
      if (!isSessionValid(session)) return null
      return session
    } catch {
      // JWT invalid or expired — fall through to dev session fallback
    }
  }

  const devSession = loadDevSession()
  if (devSession && !isSessionValid(devSession)) return null
  return devSession
}

/**
 * Rolls the session cookie if it is within the refresh threshold.
 * Call this at the start of authenticated endpoints to keep the session alive.
 * Also updates the session data (e.g. new accessToken after Google refresh).
 */
export async function refreshSessionIfNeeded(
  req: VercelRequest,
  res: VercelResponse,
  updatedSession?: SessionData,
): Promise<void> {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
  if (!token && !updatedSession) return

  let session = updatedSession
  let shouldRefresh = Boolean(updatedSession) // always refresh if we have new session data

  if (!session && token) {
    try {
      const payload = decodeJwt(token)
      const exp = payload.exp ?? 0
      const now = Math.floor(Date.now() / 1000)
      const remaining = exp - now
      if (remaining < REFRESH_THRESHOLD_SECONDS) {
        shouldRefresh = true
        session = {
          email: String(payload.email),
          name: String(payload.name),
          picture: String(payload.picture),
          accessToken: String(payload.accessToken),
          refreshToken: String(payload.refreshToken),
          spreadsheetId: String(payload.spreadsheetId ?? ''),
        }
      }
    } catch {
      // Ignore decode errors
    }
  }

  if (shouldRefresh && session) {
    const newToken = await createSessionToken(session)
    setSessionCookie(res, newToken)
    persistDevSession(session)
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
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3000'
  const proto = req.headers['x-forwarded-proto'] ?? 'http'
  return `${proto}://${host}`
}
