import { google } from 'googleapis'
import { getEnv, GOOGLE_SCOPES } from './env'
import type { SessionData } from './session'

export function createOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    getEnv('GOOGLE_CLIENT_ID'),
    getEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri ?? getEnv('GOOGLE_REDIRECT_URI'),
  )
}

export function getGoogleAuthUrl(): string {
  const client = createOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
  })
}

export async function exchangeCodeForSession(code: string): Promise<SessionData> {
  const client = createOAuth2Client()
  const { tokens } = await client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Google OAuth did not return required tokens')
  }

  client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const { data: profile } = await oauth2.userinfo.get()

  if (!profile.email) {
    throw new Error('Google profile is missing email')
  }

  return {
    email: profile.email,
    name: profile.name ?? profile.email,
    picture: profile.picture ?? '',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  }
}

export function getAuthedClient(session: SessionData) {
  const client = createOAuth2Client()
  client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  })
  return client
}

export function getSheetsClient(session: SessionData) {
  return google.sheets({ version: 'v4', auth: getAuthedClient(session) })
}

export function getGmailClient(session: SessionData) {
  return google.gmail({ version: 'v1', auth: getAuthedClient(session) })
}
