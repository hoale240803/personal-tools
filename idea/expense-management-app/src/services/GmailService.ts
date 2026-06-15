const GMAIL_PURCHASES_CATEGORY = "category:purchases";
const GMAIL_MAX_RESULTS_PER_PAGE = 50;
const DEFAULT_SYNC_LOOKBACK_DAYS = 30;

/**
 * Lightweight representation of a Gmail message needed by the sync pipeline.
 */
export interface GmailMessagePayload {
  id: string;
  threadId: string;
  subject: string;
  sender: string;
  receivedAt: string;
  bodyText: string;
}

/**
 * Converts an ISO-8601 timestamp to a Unix epoch string used by Gmail `after:` queries.
 *
 * @param isoTimestamp - RFC-3339 timestamp (e.g. profile.last_gmail_sync_at).
 * @returns Unix epoch seconds as a string for Gmail search syntax.
 */
export function isoTimestampToGmailAfterEpoch(isoTimestamp: string): string {
  const epochSeconds = Math.floor(new Date(isoTimestamp).getTime() / 1000);
  return String(epochSeconds);
}

/**
 * Builds the default lookback timestamp when no checkpoint exists yet.
 *
 * @returns ISO-8601 timestamp for DEFAULT_SYNC_LOOKBACK_DAYS ago.
 */
export function buildDefaultSyncStartTimestamp(): string {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - DEFAULT_SYNC_LOOKBACK_DAYS);
  return lookbackDate.toISOString();
}

/**
 * Constructs the Gmail search query for purchase-category emails after a checkpoint.
 *
 * @param afterIsoTimestamp - ISO timestamp of the last successful sync checkpoint.
 * @returns Gmail search query string.
 */
export function buildGmailPurchaseQuery(afterIsoTimestamp: string): string {
  const afterEpoch = isoTimestampToGmailAfterEpoch(afterIsoTimestamp);
  return `${GMAIL_PURCHASES_CATEGORY} after:${afterEpoch}`;
}

/**
 * Decodes a base64url-encoded Gmail message part body into plain UTF-8 text.
 *
 * @param encodedBody - Base64url-encoded body from the Gmail API.
 * @returns Decoded UTF-8 string.
 */
function decodeBase64UrlBody(encodedBody: string): string {
  const normalizedBase64 = encodedBody.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalizedBase64, "base64").toString("utf-8");
}

/**
 * Recursively walks a Gmail message payload tree and returns the first text/plain or text/html body.
 *
 * @param parts - Gmail message parts array from the API response.
 * @returns Decoded email body text, or an empty string when none is found.
 */
function extractBodyFromParts(
  parts: Array<{ mimeType?: string | null; body?: { data?: string | null }; parts?: unknown[] }>
): string {
  for (const part of parts) {
    const mimeType = part.mimeType ?? "";
    const bodyData = part.body?.data;

    if (bodyData && (mimeType === "text/plain" || mimeType === "text/html")) {
      return decodeBase64UrlBody(bodyData);
    }

    if (part.parts && Array.isArray(part.parts)) {
      const nestedBody = extractBodyFromParts(
        part.parts as Array<{ mimeType?: string | null; body?: { data?: string | null }; parts?: unknown[] }>
      );
      if (nestedBody) {
        return nestedBody;
      }
    }
  }
  return "";
}

/**
 * Extracts the plain-text or HTML body from a full Gmail message resource.
 *
 * @param message - Full Gmail message object from `users.messages.get`.
 * @returns Decoded email body text.
 */
export function extractEmailBodyFromGmailMessage(message: {
  payload?: {
    mimeType?: string | null;
    body?: { data?: string | null };
    parts?: Array<{ mimeType?: string | null; body?: { data?: string | null }; parts?: unknown[] }>;
  };
}): string {
  const payload = message.payload;
  if (!payload) {
    return "";
  }

  if (payload.body?.data) {
    return decodeBase64UrlBody(payload.body.data);
  }

  if (payload.parts) {
    return extractBodyFromParts(payload.parts);
  }

  return "";
}

/**
 * Reads a specific header value from a Gmail message header list.
 *
 * @param headers - Gmail message headers array.
 * @param headerName - Case-insensitive header name to find.
 * @returns Header value or an empty string.
 */
function getHeaderValue(
  headers: Array<{ name?: string | null; value?: string | null }>,
  headerName: string
): string {
  const match = headers.find(
    (header) => header.name?.toLowerCase() === headerName.toLowerCase()
  );
  return match?.value ?? "";
}

/**
 * Fetches purchase-category Gmail messages after the given checkpoint timestamp.
 *
 * @param accessToken - Valid Google OAuth access token with Gmail read scope.
 * @param afterIsoTimestamp - ISO checkpoint; only messages after this time are fetched.
 * @returns Array of lightweight message payloads ready for LLM parsing.
 */
export async function fetchPurchaseEmails(
  accessToken: string,
  afterIsoTimestamp: string
): Promise<GmailMessagePayload[]> {
  const { google } = await import("googleapis");

  const oauthClient = new google.auth.OAuth2();
  oauthClient.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauthClient });
  const searchQuery = buildGmailPurchaseQuery(afterIsoTimestamp);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: searchQuery,
    maxResults: GMAIL_MAX_RESULTS_PER_PAGE,
  });

  const messageIds = listResponse.data.messages ?? [];
  const payloads: GmailMessagePayload[] = [];

  for (const messageRef of messageIds) {
    if (!messageRef.id) {
      continue;
    }

    const fullMessage = await gmail.users.messages.get({
      userId: "me",
      id: messageRef.id,
      format: "full",
    });

    const headers = fullMessage.data.payload?.headers ?? [];
    const internalDateMs = Number(fullMessage.data.internalDate ?? Date.now());

    payloads.push({
      id: messageRef.id,
      threadId: messageRef.threadId ?? messageRef.id,
      subject: getHeaderValue(headers, "Subject"),
      sender: getHeaderValue(headers, "From"),
      receivedAt: new Date(internalDateMs).toISOString(),
      bodyText: extractEmailBodyFromGmailMessage(fullMessage.data),
    });
  }

  return payloads;
}
