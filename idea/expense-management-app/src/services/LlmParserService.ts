const LLM_PROVIDER_ENV_KEY = "LLM_PROVIDER";
const LLM_API_KEY_ENV_KEY = "LLM_API_KEY";
const LLM_MODEL_ENV_KEY = "LLM_MODEL";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const ANTHROPIC_API_BASE = "https://api.anthropic.com/v1/messages";

import type { ParsedInvoice } from "@/services/types/DatabaseTypes";
import {
  buildCategoryPromptSection,
  getDefaultCategoryTree,
  normalizeCategoryLabel,
} from "@/services/helpers/CategoryTreeHelper";

/**
 * Raw LLM JSON response shape before validation.
 */
interface LlmRawInvoiceResponse {
  order_id?: string;
  date?: string;
  description?: string;
  amount?: number | string;
  platform?: string;
  category?: string;
  status?: string | null;
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
 * Strips HTML tags and collapses whitespace from an email body for LLM input.
 *
 * @param rawBody - Raw email body (plain text or HTML).
 * @returns Cleaned plain-text suitable for LLM parsing.
 */
export function stripHtmlFromEmailBody(rawBody: string): string {
  const withoutTags = rawBody.replace(/<[^>]+>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}

/**
 * Builds the system prompt that instructs the LLM to return structured invoice JSON.
 *
 * @returns System prompt string with category tree and JSON schema.
 */
export function buildInvoiceParserSystemPrompt(): string {
  const categorySection = buildCategoryPromptSection(getDefaultCategoryTree());

  return `You are an invoice extraction assistant for a personal expense tracker.
Extract purchase details from invoice/receipt emails and return ONLY valid JSON.

${categorySection}

Return JSON with exactly these fields:
{
  "order_id": "string — platform order/transaction ID",
  "date": "string — ISO date YYYY-MM-DD",
  "description": "string — short purchase description",
  "amount": number — positive number, no currency symbols,
  "platform": "string — merchant/platform name e.g. Grab, Shopee, Lazada",
  "category": "string — one valid category label or Unclassified",
  "status": "string or null — payment/delivery status if stated"
}

Rules:
- amount must be a positive number
- date must be YYYY-MM-DD
- If unsure about category, use "Unclassified"
- Return ONLY the JSON object, no markdown fences`;
}

/**
 * Builds the user prompt containing email metadata and body for parsing.
 *
 * @param subject - Email subject line.
 * @param sender - Email From header.
 * @param receivedAt - ISO timestamp when the email was received.
 * @param bodyText - Decoded email body text.
 * @returns User prompt string.
 */
export function buildInvoiceParserUserPrompt(
  subject: string,
  sender: string,
  receivedAt: string,
  bodyText: string
): string {
  const cleanedBody = stripHtmlFromEmailBody(bodyText).slice(0, 8000);

  return `Parse this purchase email:

Subject: ${subject}
From: ${sender}
Received: ${receivedAt}

Body:
${cleanedBody}`;
}

/**
 * Parses and validates the raw LLM JSON response into a ParsedInvoice object.
 *
 * @param raw - Parsed JSON object from the LLM.
 * @returns Validated ParsedInvoice ready for database upsert.
 */
export function validateLlmInvoiceResponse(raw: LlmRawInvoiceResponse): ParsedInvoice {
  const allowedLabels = getDefaultCategoryTree().flatMap((entry) =>
    entry.children.map((child) => `${entry.parent} > ${child}`)
  );

  const orderId = raw.order_id?.trim();
  const date = raw.date?.trim();
  const description = raw.description?.trim();
  const platform = raw.platform?.trim();
  const amount = typeof raw.amount === "string" ? parseFloat(raw.amount) : raw.amount;

  if (!orderId) {
    throw new Error("LLM response missing order_id");
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`LLM response has invalid date: ${raw.date}`);
  }
  if (!description) {
    throw new Error("LLM response missing description");
  }
  if (!platform) {
    throw new Error("LLM response missing platform");
  }
  if (amount === undefined || isNaN(amount) || amount < 0) {
    throw new Error(`LLM response has invalid amount: ${raw.amount}`);
  }

  return {
    order_id: orderId,
    date,
    description,
    amount,
    platform,
    category: normalizeCategoryLabel(raw.category, allowedLabels),
    status: raw.status ?? null,
  };
}

/**
 * Calls the Gemini Flash API to parse an invoice email.
 *
 * @param systemPrompt - System instructions for the LLM.
 * @param userPrompt - Email content to parse.
 * @returns Raw parsed JSON object from the model response.
 */
async function callGeminiParser(
  systemPrompt: string,
  userPrompt: string
): Promise<LlmRawInvoiceResponse> {
  const apiKey = requireEnv(LLM_API_KEY_ENV_KEY);
  const model = process.env[LLM_MODEL_ENV_KEY] ?? DEFAULT_GEMINI_MODEL;
  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  const textContent =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return JSON.parse(textContent) as LlmRawInvoiceResponse;
}

/**
 * Calls the Anthropic Claude Haiku API to parse an invoice email.
 *
 * @param systemPrompt - System instructions for the LLM.
 * @param userPrompt - Email content to parse.
 * @returns Raw parsed JSON object from the model response.
 */
async function callAnthropicParser(
  systemPrompt: string,
  userPrompt: string
): Promise<LlmRawInvoiceResponse> {
  const apiKey = requireEnv(LLM_API_KEY_ENV_KEY);
  const model = process.env[LLM_MODEL_ENV_KEY] ?? DEFAULT_ANTHROPIC_MODEL;

  const response = await fetch(ANTHROPIC_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  const textContent = payload?.content?.[0]?.text ?? "";
  const cleanedJson = textContent.replace(/```json\n?|\n?```/g, "").trim();

  return JSON.parse(cleanedJson) as LlmRawInvoiceResponse;
}

/**
 * Parses a single invoice email body into a structured ParsedInvoice using the configured LLM.
 *
 * @param subject - Email subject line.
 * @param sender - Email From header.
 * @param receivedAt - ISO timestamp when the email was received.
 * @param bodyText - Decoded email body text.
 * @returns Validated ParsedInvoice ready for database upsert.
 */
export async function parseInvoiceEmail(
  subject: string,
  sender: string,
  receivedAt: string,
  bodyText: string
): Promise<ParsedInvoice> {
  const provider = (process.env[LLM_PROVIDER_ENV_KEY] ?? "gemini").toLowerCase();
  const systemPrompt = buildInvoiceParserSystemPrompt();
  const userPrompt = buildInvoiceParserUserPrompt(subject, sender, receivedAt, bodyText);

  const rawResponse =
    provider === "anthropic"
      ? await callAnthropicParser(systemPrompt, userPrompt)
      : await callGeminiParser(systemPrompt, userPrompt);

  return validateLlmInvoiceResponse(rawResponse);
}
