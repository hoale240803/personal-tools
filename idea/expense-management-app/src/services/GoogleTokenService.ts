const GOOGLE_CLIENT_ID_ENV_KEY = "GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET_ENV_KEY = "GOOGLE_CLIENT_SECRET";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * Google OAuth token bundle stored in the Supabase session after Google sign-in.
 */
export interface GoogleTokenBundle {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
}

/**
 * Result of a token refresh or validation operation.
 */
export interface GoogleTokenResult {
  accessToken: string;
  wasRefreshed: boolean;
}

/**
 * Reads a required environment variable and throws when it is missing.
 *
 * @param envKey - Name of the environment variable to read.
 * @returns The non-empty environment variable value.
 */
function requireEnv(envKey: string): string {
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
  return value;
}

/**
 * Extracts Google OAuth tokens from a Supabase session object.
 *
 * @param session - Supabase auth session returned by `getSession()`.
 * @returns Google access/refresh tokens and expiry timestamp.
 */
export function extractGoogleTokensFromSession(
  session: { provider_token?: string | null; provider_refresh_token?: string | null; expires_at?: number | null }
): GoogleTokenBundle {
  return {
    accessToken: session.provider_token ?? "",
    refreshToken: session.provider_refresh_token ?? null,
    expiresAt: session.expires_at ?? null,
  };
}

/**
 * Determines whether the current access token is expired or about to expire.
 *
 * @param expiresAt - Unix timestamp (seconds) when the token expires.
 * @returns True when the token should be refreshed before use.
 */
function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) {
    return true;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= expiresAt - TOKEN_EXPIRY_BUFFER_SECONDS;
}

/**
 * Calls the Google OAuth token endpoint to exchange a refresh token for a new access token.
 *
 * @param refreshToken - Long-lived Google refresh token from Supabase session.
 * @returns A fresh Google access token string.
 */
async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv(GOOGLE_CLIENT_ID_ENV_KEY),
      client_secret: requireEnv(GOOGLE_CLIENT_SECRET_ENV_KEY),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google token refresh failed (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

/**
 * Returns a valid Google access token, refreshing it via Google OAuth when expired.
 *
 * @param tokens - Google token bundle extracted from the Supabase session.
 * @returns A valid access token and whether a refresh was performed.
 */
export async function getValidGoogleAccessToken(
  tokens: GoogleTokenBundle
): Promise<GoogleTokenResult> {
  if (!tokens.accessToken) {
    throw new Error("No Google access token found. User must sign in with Google OAuth.");
  }

  if (!isTokenExpired(tokens.expiresAt)) {
    return { accessToken: tokens.accessToken, wasRefreshed: false };
  }

  if (!tokens.refreshToken) {
    throw new Error("Google access token expired and no refresh token is available. Re-authenticate with Google.");
  }

  const refreshedAccessToken = await refreshGoogleAccessToken(tokens.refreshToken);
  return { accessToken: refreshedAccessToken, wasRefreshed: true };
}
