/**
 * Production Express server — for deployment on Render, Fly.io, or any
 * long-running Node.js host.
 *
 * Mirrors dev-server.ts but without the Vercel adapter shim.
 * Handlers are compatible with both Express and Vercel because
 * VercelRequest/VercelResponse are supersets of IncomingMessage/ServerResponse.
 *
 * Usage:
 *   npm run build   →  tsc (outputs to dist/)
 *   npm run start   →  node dist/server.js
 */

import express from 'express'
import type { Request, Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ── handler imports ────────────────────────────────────────────────────────
import healthHandler from './health.js'
import loginHandler from './auth/login.js'
import callbackHandler from './auth/callback.js'
import meHandler from './auth/me.js'
import logoutHandler from './auth/logout.js'
import expensesHandler from './expenses/index.js'
import categoriesHandler from './categories/index.js'
import gmailSyncHandler from './gmail/sync.js'
import gmailStatusHandler from './gmail/status.js'
import gmailHistoryHandler from './gmail/history.js'
import gmailWatchHandler from './gmail/watch.js'
import gmailWebhookHandler from './gmail/webhook.js'
import gmailFlushHandler from './gmail/flush.js'
import gmailCronSyncHandler from './gmail/cron-sync.js'

// ── adapter: Express req/res → Vercel req/res ────────────────────────────
// VercelRequest/VercelResponse are supersets of IncomingMessage/ServerResponse.
// Express req/res are compatible — cast is safe for all existing handlers.
type VercelHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => void | Promise<void | VercelResponse>

function adapt(handler: VercelHandler) {
  return async (req: Request, res: Response) => {
    await handler(
      req as unknown as VercelRequest,
      res as unknown as VercelResponse,
    )
  }
}

// ── app setup ──────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS — allow frontend origin (configured via APP_ORIGIN env var)
app.use((req, res, next) => {
  const origin = process.env.APP_ORIGIN ?? ''
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    )
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ── routes ────────────────────────────────────────────────────────────────
app.all('/api/health', adapt(healthHandler))
app.all('/api/auth/login', adapt(loginHandler))
app.all('/api/auth/callback', adapt(callbackHandler))
app.all('/api/auth/me', adapt(meHandler))
app.all('/api/auth/logout', adapt(logoutHandler))
app.all('/api/expenses', adapt(expensesHandler))
app.all('/api/categories', adapt(categoriesHandler))
app.all('/api/gmail/sync', adapt(gmailSyncHandler))
app.all('/api/gmail/status', adapt(gmailStatusHandler))
app.all('/api/gmail/history', adapt(gmailHistoryHandler))
app.all('/api/gmail/watch', adapt(gmailWatchHandler))
app.all('/api/gmail/webhook', adapt(gmailWebhookHandler))
app.all('/api/gmail/flush', adapt(gmailFlushHandler))
app.all('/api/gmail/cron-sync', adapt(gmailCronSyncHandler))

// 404 for unmatched /api/* routes
app.all('/api/*path', (_req, res) => {
  res.status(404).json({ data: null, error: { message: 'API route not found' } })
})

// ── start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀 API server running at http://localhost:${PORT}`)
  console.log(`     Health: http://localhost:${PORT}/api/health\n`)
})
