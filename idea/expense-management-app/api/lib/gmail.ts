import type { gmail_v1 } from 'googleapis'
import { getGmailClient } from './google'
import type { SessionData } from './session'

const PURCHASE_QUERY =
  'category:purchases OR subject:(order OR "đơn hàng" OR "xác nhận" OR purchase OR shopee OR lazada) newer_than:30d'

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf-8')
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return ''

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }

  for (const part of payload.parts ?? []) {
    const mime = part.mimeType ?? ''
    if (mime === 'text/plain' && part.body?.data) {
      return decodeBase64Url(part.body.data)
    }
  }

  for (const part of payload.parts ?? []) {
    const nested = extractBody(part)
    if (nested) return nested
  }

  return ''
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
  body: string
  imageUrl: string
}

export async function listPurchaseMessages(session: SessionData): Promise<GmailPurchaseMessage[]> {
  const gmail = getGmailClient(session)
  const list = await gmail.users.messages.list({
    userId: 'me',
    q: PURCHASE_QUERY,
    maxResults: 20,
  })

  const messages: GmailPurchaseMessage[] = []

  for (const item of list.data.messages ?? []) {
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

    messages.push({
      id: item.id,
      receivedDate: internalDate.toISOString().slice(0, 10),
      subject: getHeader(headers, 'Subject'),
      body: `${getHeader(headers, 'Subject')}\n${extractBody(full.data.payload)}`,
      imageUrl: extractImageUrl(full.data.payload),
    })
  }

  return messages
}
