Please read the handover rules in "agent-rules.md" and follow them strictly.

Your task is to write a Google Apps Script that acts as an automated finance tracker running on an hourly time-driven trigger (Interval: 1 hour). The script must fetch bank alert emails from Gmail, parse them dynamically based on a "Config" sheet, and log the data into monthly sheets.

Here are the specific technical requirements:

1. CONFIGURATION SHEET SET-UP:
   - Read rules from a tab named "Config".
   - The "Config" tab has 4 columns: [Sender Email], [Keyword], [Transaction Type (Income/Expense)], and [Account Name].
   - Example rules:
     - "no.reply.alerts@chase.com" | "charged" | "Expense" | "Chase Credit"
     - "no.reply.alerts@chase.com" | "direct deposit" | "Income" | "Chase Debit"

2. GMAIL SEARCH & FILTER:
   - The script should search Gmail for unread emails within the last 2 hours.
   - Filter query: "after:(now - 2h) is:unread" (or scan a specific Gmail label like "Finance-Alerts").

3. DYNAMIC PARSING & CHECKING LOGIC:
   - For each email found:
     - Check if the Sender matches [Sender Email] in the Config sheet.
     - Scan the email body/subject for the [Keyword].
     - If matched, classify it as "Income" or "Expense" and assign the [Account Name].
     - Use RegEx to flexibly extract: Date, Amount, and Merchant/Description.
     - Mark the email as READ after processing to prevent duplicate logging.

4. TARGET SHEET ROUTING & FORMATTING (CRITICAL):
   - Dynamic Monthly Sheet: Based on the transaction date, locate the corresponding sheet (e.g., June). If the monthly sheet does not exist, create it automatically.
   - Specific Row Target (Row 85):
     According to "image_6035e2.png", the ledger table titled "Theo dõi chi phí" starts at Row 85.
     - Row 85 contains headers: [Ngày] (Col A) | [Món hàng] (Col B) | [Chi phí] (Col C).
     - The script must NOT append to the very end of the spreadsheet. Instead, it must insert a new row directly BELOW Row 85 (at Row 86), shifting existing formula rows down, and insert the parsed data into Columns A, B, and C.

5. HANDOVER MANDATE:
   Before you finish, you MUST create or update the "AGENT_STATE.md" file in the root directory exactly as instructed in "agent-rules.md", detailing your branch name, the service/helper files you created, and the progress for the next agent.
