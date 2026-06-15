import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpenseInsertRow, ParsedInvoice } from "@/services/types/DatabaseTypes";

const EXPENSES_TABLE = "expenses";
const UPSERT_CONFLICT_COLUMNS = "user_id,order_id,platform";

/**
 * Maps a ParsedInvoice from the LLM into a database-ready ExpenseInsertRow.
 *
 * @param userId - UUID of the authenticated user who owns the expense.
 * @param parsed - Structured invoice data from the LLM parser.
 * @returns Row object ready for Supabase upsert.
 */
export function mapParsedInvoiceToExpenseRow(
  userId: string,
  parsed: ParsedInvoice
): ExpenseInsertRow {
  return {
    user_id: userId,
    order_id: parsed.order_id,
    date: parsed.date,
    description: parsed.description,
    category: parsed.category,
    amount: parsed.amount,
    platform: parsed.platform,
    status: parsed.status,
  };
}

/**
 * Upserts an array of parsed invoices into the expenses ledger.
 * Uses the composite unique constraint (user_id, order_id, platform) for idempotency.
 *
 * @param supabase - Authenticated Supabase client.
 * @param userId - UUID of the authenticated user.
 * @param parsedInvoices - Array of LLM-parsed invoice objects.
 * @returns Number of rows successfully upserted.
 */
export async function upsertParsedExpenses(
  supabase: SupabaseClient,
  userId: string,
  parsedInvoices: ParsedInvoice[]
): Promise<number> {
  if (parsedInvoices.length === 0) {
    return 0;
  }

  const rows = parsedInvoices.map((parsed) => mapParsedInvoiceToExpenseRow(userId, parsed));

  const { error, count } = await supabase
    .from(EXPENSES_TABLE)
    .upsert(rows, {
      onConflict: UPSERT_CONFLICT_COLUMNS,
      ignoreDuplicates: false,
      count: "exact",
    });

  if (error) {
    throw new Error(`Expense upsert failed: ${error.message}`);
  }

  return count ?? rows.length;
}
