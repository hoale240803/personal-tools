/**
 * Local Express dev server — replaces `vercel dev` for local development.
 * Routes Vercel Function handlers to Express endpoints, avoiding cloud linking.
 *
 * Usage: npm run dev  (invoked via api/package.json)
 */

import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
import { createRequire } from 'module'
import { existsSync } from 'fs'

// Load .env from project root (CommonJS-compatible, no import.meta)
const __dirname = resolve(__filename, '..')
loadEnv({ path: resolve(__dirname, '.env') })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _require = createRequire(__filename)
import express from 'express'
import type { Request, Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// ── handler imports ────────────────────────────────────────────────────────
import healthHandler from './api/health.js'
import loginHandler from './api/auth/login.js'
import callbackHandler from './api/auth/callback.js'
import meHandler from './api/auth/me.js'
import logoutHandler from './api/auth/logout.js'
import expensesHandler from './api/expenses/index.js'
import categoriesHandler from './api/categories/index.js'
import gmailSyncHandler from './api/gmail/sync.js'
import gmailStatusHandler from './api/gmail/status.js'
import gmailHistoryHandler from './api/gmail/history.js'
import gmailWatchHandler from './api/gmail/watch.js'
import gmailWebhookHandler from './api/gmail/webhook.js'
import gmailFlushHandler from './api/gmail/flush.js'

// ── adapter: Express req/res → Vercel req/res ────────────────────────────
// Allow handlers that may return VercelResponse (e.g. res.json(...) chain)
type VercelHandler = (req: VercelRequest, res: VercelResponse) => void | Promise<void | VercelResponse>

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

// ── Static files (production only) ────────────────────────────────────────
// In dev, the Vite dev server handles the frontend on a separate port.
// In production (Render), Express serves the built React app from web/dist.
const webDistPath = resolve(__dirname, 'web/dist')
if (process.env.NODE_ENV === 'production' && existsSync(webDistPath)) {
  app.use(express.static(webDistPath))
  // SPA fallback — send index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(resolve(webDistPath, 'index.html'))
  })
  console.log(`     Static: serving web/dist`)
}

// ── start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀 API dev server running at http://localhost:${PORT}`)
  console.log(`     Health: http://localhost:${PORT}/api/health\n`)
})
