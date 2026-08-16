import type { gmail_v1 } from 'googleapis'
import { getGmailClient } from './google'
import type { SessionData } from './session'

const BASE_PURCHASE_QUERY = 'category:purchases'

/**
 * Individual purchase signal terms — shared with webhook.ts for subject-line pre-filtering.
 */
export const BASE_PURCHASE_QUERY_TERMS = [
  'order', 'delivered', 'shipped', 'invoice', 'billing', 'payment',
  'subscription', 'purchase', 'đơn hàng', 'xác nhận', 'giao hàng',
  'shopee', 'lazada', 'amazon', 'temu', 'aliexpress', 'doordash',
]

export interface DateRange {
  /** Epoch seconds for the start of the range (inclusive), in user's local timezone */
  afterEpoch: number
  /** Epoch seconds for the end of the range (exclusive), in user's local timezone */
  beforeEpoch: number
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf-8')
}

function extractByMime(
  payload: gmail_v1.Schema$MessagePart | undefined,
  targetMime: string,
): string {
  if (!payload) return ''

  const mime = payload.mimeType ?? ''

  if (mime === targetMime && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }

  for (const part of payload.parts ?? []) {
    const found = extractByMime(part, targetMime)
    if (found) return found
  }

  return ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Detected content type of the email body */
type EmailContentType = 'text/plain' | 'text/html' | 'empty'

/** Raw payload from Gmail API */
type GmailRawPayload = gmail_v1.Schema$MessagePart | undefined

/**
 * Detect what content type is available in the email payload.
 * Returns 'text/plain' if plain text exists, otherwise 'text/html' if HTML exists,
 * otherwise 'empty'.
 */
function detectContentType(payload: GmailRawPayload): EmailContentType {
  const plain = extractByMime(payload, 'text/plain')
  if (plain.trim().length > 0) return 'text/plain'

  const html = extractByMime(payload, 'text/html')
  if (html.trim().length > 0) return 'text/html'

  return 'empty'
}

/**
 * Extract the email body based on the detected content type.
 * - text/plain → return as-is
 * - text/html  → strip HTML tags and return clean text
 * - empty      → return empty string
 */
function extractBody(
  payload: GmailRawPayload,
  contentType: EmailContentType,
): { raw: string; parsed: string } {
  switch (contentType) {
    case 'text/plain': {
      const raw = extractByMime(payload, 'text/plain')
      return { raw, parsed: raw }
    }
    case 'text/html': {
      const raw = extractByMime(payload, 'text/html')
      return { raw, parsed: stripHtml(raw) }
    }
    case 'empty':
      return { raw: '', parsed: '' }
  }
}

function extractImageUrl(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return ''

  for (const part of payload.parts ?? []) {
    const mime = part.mimeType ?? ''
    if (mime.startsWith('image/') && part.body?.attachmentId) {
      return `gmail-attachment:${part.body.attachmentId}`
    }
    const nested = extractImageUrl(part)
    if (nested) return nested
  }

  return ''
}

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''
}

export interface GmailPurchaseMessage {
  id: string
  receivedDate: string
  subject: string
  from: string
  body: string
  contentType: EmailContentType
  imageUrl: string
}

export async function listPurchaseMessages(
  session: SessionData,
  dateRange?: DateRange,
): Promise<GmailPurchaseMessage[]> {
  const gmail = getGmailClient(session)

  const q = dateRange
    ? `(${BASE_PURCHASE_QUERY}) after:${dateRange.afterEpoch} before:${dateRange.beforeEpoch}`
    : `${BASE_PURCHASE_QUERY} newer_than:60d`

  const list = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults: 50,
  })

  const messageIds = list.data.messages ?? []
  console.log(`[Gmail] Query: ${q}`)
  console.log(`[Gmail] Found ${messageIds.length} messages`)

  const messages: GmailPurchaseMessage[] = []

  for (const item of messageIds) {
    if (!item.id) continue

    const full = await gmail.users.messages.get({
      userId: 'me',
      id: item.id,
      format: 'full',
    })

    const headers = full.data.payload?.headers
    const internalDate = full.data.internalDate
      ? new Date(Number(full.data.internalDate))
      : new Date()

    const subject = getHeader(headers, 'Subject')
    const from = getHeader(headers, 'From')
    const receivedDate = internalDate.toISOString().slice(0, 10)

    const contentType = detectContentType(full.data.payload)
    const { raw, parsed } = extractBody(full.data.payload, contentType)
    const imageUrl = extractImageUrl(full.data.payload)

    console.log(`[Gmail] Message id=${item.id} subject="${subject}" from="${from}" receivedDate=${receivedDate} contentType=${contentType} imageUrl="${imageUrl}"`)
    console.log(`[Gmail]   body(raw):    ${raw.slice(0, 300)}${raw.length > 300 ? '...' : ''}`)
    console.log(`[Gmail]   body(parsed): ${parsed.slice(0, 300)}${parsed.length > 300 ? '...' : ''}`)

    messages.push({
      id: item.id,
      receivedDate,
      subject,
      from,
      body: `${subject}\n${parsed}`,
      contentType,
      imageUrl,
    })
  }

  return messages
}

/**
 * Lightweight count: lists message IDs only (no body fetch).
 * Used to estimate processing time before starting a full sync.
 */
export async function countPurchaseMessages(
  session: SessionData,
  dateRange?: DateRange,
): Promise<number> {
  const gmail = getGmailClient(session)

  const q = dateRange
    ? `(${BASE_PURCHASE_QUERY}) after:${dateRange.afterEpoch} before:${dateRange.beforeEpoch}`
    : `${BASE_PURCHASE_QUERY} newer_than:60d`

  // Gmail list returns up to maxResults per page; we only need the count
  const list = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults: 500, // large enough to get an accurate count for typical ranges
  })

  const count = list.data.messages?.length ?? 0
  console.log(`[Gmail] Count-only query found ${count} messages (query: ${q})`)
  return count
}

/**
 * Fetch a single message by ID with full body.
 */
export async function getMessageById(
  session: SessionData,
  messageId: string,
): Promise<GmailPurchaseMessage | null> {
  const gmail = getGmailClient(session)

  try {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    })

    const headers = full.data.payload?.headers
    const internalDate = full.data.internalDate
      ? new Date(Number(full.data.internalDate))
      : new Date()

    const subject = getHeader(headers, 'Subject')
    const from = getHeader(headers, 'From')
    const receivedDate = internalDate.toISOString().slice(0, 10)

    const contentType = detectContentType(full.data.payload)
    const { raw, parsed } = extractBody(full.data.payload, contentType)
    const imageUrl = extractImageUrl(full.data.payload)

    console.log(`[Gmail] Message id=${messageId} subject="${subject}" from="${from}" receivedDate=${receivedDate} contentType=${contentType} imageUrl="${imageUrl}"`)
    console.log(`[Gmail]   body(raw):    ${raw.slice(0, 300)}${raw.length > 300 ? '...' : ''}`)
    console.log(`[Gmail]   body(parsed): ${parsed.slice(0, 300)}${parsed.length > 300 ? '...' : ''}`)

    return {
      id: messageId,
      receivedDate,
      subject,
      from,
      body: `${subject}\n${parsed}`,
      contentType,
      imageUrl,
    }
  } catch (err) {
    console.error(`[Gmail] Failed to fetch messageId=${messageId}:`, err)
    return null
  }
}

/**
 * Register (or renew) Gmail push notifications via Google Pub/Sub.
 * Returns the startHistoryId to store in SyncState for delta polling.
 */
export async function setupGmailWatch(
  session: SessionData,
  topicName: string,
): Promise<{ historyId: string; expiration: string }> {
  const gmail = getGmailClient(session)

  const res = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      labelIds: ['INBOX'],
      topicName,
    },
  })

  const historyId = String(res.data.historyId ?? '')
  const expiration = String(res.data.expiration ?? '')
  console.log(`[Gmail] Watch registered. historyId=${historyId} expires=${expiration}`)

  return { historyId, expiration }
}

/**
 * Stop Gmail push notifications for the current user.
 * Errors are swallowed gracefully — the watch will expire naturally after 7 days anyway.
 */
export async function stopGmailWatch(session: SessionData): Promise<void> {
  const gmail = getGmailClient(session)
  try {
    await gmail.users.stop({ userId: 'me' })
    console.log(`[Gmail] Watch stopped for ${session.email}`)
  } catch (err) {
    // Non-fatal: watch expires after 7 days regardless
    console.warn(`[Gmail] Failed to stop watch for ${session.email} (non-fatal):`, err)
  }
}

/**
 * Fetch Gmail history since a given historyId to discover newly arrived messages.
 * Returns only message IDs that were added (INBOX additions).
 */
export async function getGmailHistory(
  session: SessionData,
  startHistoryId: string,
): Promise<string[]> {
  const gmail = getGmailClient(session)

  try {
    const res = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      historyTypes: ['messageAdded'],
      labelId: 'INBOX',
    })

    const messageIds: string[] = []
    for (const record of res.data.history ?? []) {
      for (const added of record.messagesAdded ?? []) {
        const id = added.message?.id
        if (id) messageIds.push(id)
      }
    }

    console.log(`[Gmail] History since ${startHistoryId}: found ${messageIds.length} new messages`)
    return messageIds
  } catch (err: unknown) {
    // historyId too old → full re-sync needed
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: number }).code === 404
    ) {
      console.warn(`[Gmail] historyId ${startHistoryId} expired or invalid — need full re-sync`)
      return []
    }
    throw err
  }
}
