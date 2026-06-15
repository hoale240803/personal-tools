import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/services/SupabaseServerService";
import { runGmailSyncPipeline } from "@/services/GmailSyncOrchestrator";

/**
 * POST /api/sync-gmail
 * Triggers an incremental Gmail purchase-email sync for the authenticated user.
 * Fetches new emails since the last checkpoint, parses them via LLM, and upserts expenses.
 *
 * @returns JSON summary of the sync run.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runGmailSyncPipeline(userData.user.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gmail sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
