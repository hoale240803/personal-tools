/**
 * Row shape for the `profiles` table (Phase 1 migration 000001).
 */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  last_gmail_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Row shape for inserting or upserting into the `expenses` table (Phase 1 migration 000002).
 */
export interface ExpenseInsertRow {
  user_id: string;
  order_id: string;
  date: string;
  description: string | null;
  category: string;
  amount: number;
  platform: string;
  status: string | null;
}

/**
 * Structured output returned by the LLM invoice parser.
 */
export interface ParsedInvoice {
  order_id: string;
  date: string;
  description: string;
  amount: number;
  platform: string;
  category: string;
  status: string | null;
}

/**
 * Summary returned by the Gmail sync pipeline.
 */
export interface GmailSyncResult {
  emailsFetched: number;
  expensesParsed: number;
  expensesUpserted: number;
  checkpointUpdatedAt: string;
  errors: string[];
}
