import type { GmailSyncResult } from "@/services/types/DatabaseTypes";
import { createSupabaseServerClient } from "@/services/SupabaseServerService";
import {
  extractGoogleTokensFromSession,
  getValidGoogleAccessToken,
} from "@/services/GoogleTokenService";
import { fetchPurchaseEmails } from "@/services/GmailService";
import {
  fetchUserProfile,
  resolveSyncStartTimestamp,
  updateGmailSyncCheckpoint,
} from "@/services/SyncCheckpointService";
import { parseInvoiceEmail } from "@/services/LlmParserService";
import { upsertParsedExpenses } from "@/services/ExpenseUpsertService";

/**
 * Orchestrates the full Gmail sync pipeline: fetch → parse → upsert → checkpoint.
 *
 * @param userId - UUID of the authenticated user initiating the sync.
 * @returns Summary of emails processed, expenses upserted, and checkpoint timestamp.
 */
export async function runGmailSyncPipeline(userId: string): Promise<GmailSyncResult> {
  const supabase = await createSupabaseServerClient();
  const profile = await fetchUserProfile(supabase, userId);
  const syncStartTimestamp = resolveSyncStartTimestamp(profile);

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    throw new Error("No active session. User must be authenticated.");
  }

  const googleTokens = extractGoogleTokensFromSession(session);
  const { accessToken } = await getValidGoogleAccessToken(googleTokens);

  const emails = await fetchPurchaseEmails(accessToken, syncStartTimestamp);

  const parsedInvoices = [];
  const errors: string[] = [];

  for (const email of emails) {
    try {
      if (!email.bodyText.trim()) {
        errors.push(`Skipped message ${email.id}: empty body`);
        continue;
      }
      const parsed = await parseInvoiceEmail(
        email.subject,
        email.sender,
        email.receivedAt,
        email.bodyText
      );
      parsedInvoices.push(parsed);
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      errors.push(`Failed to parse message ${email.id}: ${message}`);
    }
  }

  const upsertedCount = await upsertParsedExpenses(supabase, userId, parsedInvoices);

  const checkpointTimestamp = new Date().toISOString();
  await updateGmailSyncCheckpoint(supabase, userId, checkpointTimestamp);

  return {
    emailsFetched: emails.length,
    expensesParsed: parsedInvoices.length,
    expensesUpserted: upsertedCount,
    checkpointUpdatedAt: checkpointTimestamp,
    errors,
  };
}
