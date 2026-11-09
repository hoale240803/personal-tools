import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { google } from 'googleapis'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '../..')
const repoRoot = path.resolve(appRoot, '../..')

dotenv.config({ path: path.join(appRoot, '.env') })

const sessionPath = path.join(appRoot, '.dev-session.json')
const tradingSettingsPath = path.join(repoRoot, 'idea/trading-tool/settings.json')

function extractBody(payload) {
  if (!payload) return ''
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractBody(part)
      if (text) return text
    }
  }
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }
  return ''
}

async function sendTelegramNotification(message) {
  let botToken = process.env.TELEGRAM_BOT_TOKEN
  let chatId = process.env.TELEGRAM_CHAT_ID

  if ((!botToken || !chatId) && fs.existsSync(tradingSettingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(tradingSettingsPath, 'utf-8'))
      botToken = botToken || settings?.telegram?.bot_token
      chatId = chatId || settings?.telegram?.chat_id
    } catch {
      // ignore parse errors
    }
  }

  if (!botToken || !chatId || botToken.includes('YOUR_') || chatId.includes('YOUR_')) {
    console.warn(
      '[Telegram] Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID trong .env hoặc idea/trading-tool/settings.json.',
    )
    return false
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Telegram API error (${res.status}): ${errText}`)
  }
  console.log('[Telegram] Đã gửi thông báo thành công.')
  return true
}

async function checkSecurityEmails(days = 1) {
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Không tìm thấy file session tại ${sessionPath}`)
  }

  const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'))
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )

  auth.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  })

  auth.on('tokens', (tokens) => {
    if (tokens.access_token) {
      session.accessToken = tokens.access_token
      if (tokens.refresh_token) session.refreshToken = tokens.refresh_token
      fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2), 'utf-8')
    }
  })

  const gmail = google.gmail({ version: 'v1', auth })
  const query = `newer_than:${days}d (from:(render.com OR github.com OR vercel.com OR fly.io OR google.com OR npmjs.com OR cloudflare.com) OR subject:(security OR advisory OR vulnerability OR CVE OR deprecated OR action required OR incident)) -category:promotions -category:social`

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 10,
  })

  const messages = listRes.data.messages ?? []
  const results = []

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    })
    const headers = Object.fromEntries(
      (detail.data.payload?.headers ?? []).map((h) => [h.name, h.value]),
    )
    const bodyText = extractBody(detail.data.payload) || detail.data.snippet || ''
    results.push({
      id: msg.id,
      date: headers.Date,
      from: headers.From,
      subject: headers.Subject,
      snippet: detail.data.snippet,
      bodyPreview: bodyText.slice(0, 1500),
    })
  }

  console.log(JSON.stringify({ count: results.length, query, emails: results }, null, 2))
}

const args = process.argv.slice(2)
const notifyIdx = args.indexOf('--notify-telegram')
if (notifyIdx !== -1 && args[notifyIdx + 1]) {
  sendTelegramNotification(args[notifyIdx + 1]).catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
} else {
  const daysArg = args.find((a) => a.startsWith('--days='))
  const days = daysArg ? Number(daysArg.split('=')[1]) || 1 : 1
  checkSecurityEmails(days).catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}

