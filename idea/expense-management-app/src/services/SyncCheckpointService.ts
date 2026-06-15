import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/services/types/DatabaseTypes";
import { buildDefaultSyncStartTimestamp } from "@/services/GmailService";

const PROFILES_TABLE = "profiles";

/**
 * Reads the authenticated user's profile row including the Gmail sync checkpoint.
 *
 * @param supabase - Authenticated Supabase client.
 * @param userId - UUID of the authenticated user.
 * @returns The user's profile row.
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load profile for user ${userId}: ${error?.message ?? "not found"}`);
  }

  return data as ProfileRow;
}

/**
 * Resolves the Gmail sync start timestamp from the profile checkpoint.
 * Falls back to a 30-day lookback when no checkpoint has been saved yet.
 *
 * @param profile - User profile row containing `last_gmail_sync_at`.
 * @returns ISO-8601 timestamp to use as the Gmail `after:` filter.
 */
export function resolveSyncStartTimestamp(profile: ProfileRow): string {
  return profile.last_gmail_sync_at ?? buildDefaultSyncStartTimestamp();
}

/**
 * Persists the Gmail sync checkpoint to the user's profile after a successful run.
 *
 * @param supabase - Authenticated Supabase client.
 * @param userId - UUID of the authenticated user.
 * @param checkpointIsoTimestamp - ISO timestamp marking the end of this sync run.
 * @returns The updated checkpoint timestamp.
 */
export async function updateGmailSyncCheckpoint(
  supabase: SupabaseClient,
  userId: string,
  checkpointIsoTimestamp: string
): Promise<string> {
  const { error } = await supabase
    .from(PROFILES_TABLE)
    .update({ last_gmail_sync_at: checkpointIsoTimestamp })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update Gmail sync checkpoint: ${error.message}`);
  }

  return checkpointIsoTimestamp;
}
