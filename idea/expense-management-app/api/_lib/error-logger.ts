import { randomUUID } from 'crypto'
import type { SessionData } from './session'
import { appendErrorLog, type ErrorLogEntry } from './sheets'

interface LogErrorOptions {
  /** Source identifier: 'cron:flush' | 'cron:watch' | 'pipeline:webhook' | 'pipeline:batch' | etc. */
  source: string
  /** The caught error (Error instance or unknown) */
  error: unknown
  /** Email of the affected user (defaults to 'system') */
  userEmail?: string
  /** Extra contextual information — messageIds, counts, historyId, etc. */
  context?: Record<string, unknown>
  /** Session for writing to Google Sheets */
  session: SessionData
  /** Severity level (defaults to 'error') */
  severity?: 'error' | 'warning'
}

/**
 * Central error logger for all pipeline, cron, and webhook operations.
 *
 * 1. console.error() — visible in Vercel Runtime Logs (ephemeral)
 * 2. ErrorLog sheet  — persistent, viewable in app UI
 *
 * Usage:
 * ```ts
 * try {
 *   await processPipelineBatch(session, email)
 * } catch (error) {
 *   await logError({
 *     source: 'cron:flush',
 *     error,
 *     userEmail: email,
 *     session,
 *     context: { pendingCount: 3, trigger: 'daily-flush' },
 *   })
 * }
 * ```
 */
export async function logError(opts: LogErrorOptions): Promise<void> {
  const err =
    opts.error instanceof Error
      ? opts.error
      : new Error(String(opts.error))

  const entry: ErrorLogEntry = {
    errorId: randomUUID(),
    timestamp: new Date().toISOString(),
    source: opts.source,
    severity: opts.severity ?? 'error',
    userEmail: opts.userEmail ?? 'system',
    message: err.message,
    stackTrace: err.stack ?? '(no stack trace)',
    context: opts.context ?? {},
    resolved: false,
  }

  // 1. Always log to console (visible in Vercel Runtime Logs)
  console.error(`[ErrorLog] [${entry.source}] [${entry.severity}] ${entry.message}`)
  console.error(`[ErrorLog] Stack:\n${entry.stackTrace}`)
  if (Object.keys(entry.context).length > 0) {
    console.error(`[ErrorLog] Context:`, JSON.stringify(entry.context, null, 2))
  }

  // 2. Persist to ErrorLog sheet
  try {
    await appendErrorLog(opts.session, entry)
    console.log(`[ErrorLog] Written to ErrorLog sheet: errorId=${entry.errorId}`)
  } catch (sheetErr) {
    // If we can't even write to the error log, log to console as last resort
    console.error(
      '[ErrorLog] CRITICAL: Failed to write to ErrorLog sheet:',
      sheetErr instanceof Error ? sheetErr.message : sheetErr,
    )
  }
}
