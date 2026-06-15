import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/services/SupabaseServerService";
import {
  extractGoogleTokensFromSession,
  getValidGoogleAccessToken,
} from "@/services/GoogleTokenService";

/**
 * GET /api/auth/google-token
 * Validates the authenticated user's Google OAuth access token and refreshes it when expired.
 * Used to verify Gmail API connectivity before triggering a full sync.
 *
 * @returns JSON with token validity status and whether a refresh was performed.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    const googleTokens = extractGoogleTokensFromSession(session);
    const { accessToken, wasRefreshed } = await getValidGoogleAccessToken(googleTokens);

    return NextResponse.json({
      valid: true,
      wasRefreshed,
      tokenPreview: `${accessToken.slice(0, 8)}...`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token validation failed";
    return NextResponse.json({ error: message, valid: false }, { status: 400 });
  }
}
