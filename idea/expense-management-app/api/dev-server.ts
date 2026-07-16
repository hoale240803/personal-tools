/**
 * Local Express dev server — replaces `vercel dev` for local development.
 * Routes Vercel Function handlers to Express endpoints, avoiding cloud linking.
 *
 * Usage: npm run dev  (invoked via api/package.json)
 */

import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env from monorepo root
const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '..', '.env') })
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

// ── adapter: Express req/res → Vercel req/res ────────────────────────────
type VercelHandler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>

function adapt(handler: VercelHandler) {
  return async (req: Request, res: Response) => {
    // VercelRequest/VercelResponse are supersets of IncomingMessage/ServerResponse
    // Express req/res are compatible — cast is safe
    await handler(req as unknown as VercelRequest, res as unknown as VercelResponse)
  }
}

// ── app setup ──────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
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

// 404 for unmatched /api/* routes
app.all('/api/*path', (_req, res) => {
  res.status(404).json({ data: null, error: { message: 'API route not found' } })
})

// ── start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀 API dev server running at http://localhost:${PORT}`)
  console.log(`     Health: http://localhost:${PORT}/api/health\n`)
})
