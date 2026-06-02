########################
OPTION 1
########################
UPGRADE REQUIREMENT: MULTI-BANK & DYNAMIC INCOME/EXPENSE CONFIGURATION

Please upgrade the previous Google Apps Script to support multiple banks and dynamic classification (Income vs Expense) using a configuration tab in Google Sheets.

1. CONFIGURATION SHEET SET-UP:
   - The script should read configurations from a tab named "Config".
   - The "Config" tab will have 4 columns: [Sender Email], [Keyword], [Transaction Type (Income/Expense)], and [Account Name].
   - Example row: "no-reply@alert.chase.com" | "charged" | "Expense" | "Chase Credit"
   - Example row: "no-reply@alert.chase.com" | "direct deposit" | "Income" | "Chase Debit"

2. GMAIL SEARCH UPGRADE:
   - Instead of checking only one label, the script should dynamically search Gmail using a broad filter, or check a generic label like "Finance-Alerts" (which I will apply to all bank emails via Gmail filters).

3. DYNAMIC PARSING LOGIC:
   - For each email found:
     - Step A: Check the Sender Email. Match it with the [Sender Email] column in the "Config" sheet.
     - Step B: Scan the email body for the [Keyword].
     - Step C: Based on the keyword matched, classify the transaction as "Income" or "Expense" and assign the correct "Account Name".
   - Extract the Date, Amount, and Merchant using flexible regex that adapts to different bank layouts.

4. TARGET SHEET UPDATED COLUMNS:
   - Update the final ledger sheet to log these columns: `Date` | `Type (Income/Expense)` | `Account/Bank` | `Amount` | `Merchant/Description`.

Please write the full, updated Google Apps Script code and explain how the logic loops through the configuration rules.

########################
OPTION 2
########################

UPGRADE REQUIREMENT: MULTI-BANK & DYNAMIC INCOME/EXPENSE CONFIGURATION (WEBHOOK VERSION)

Please upgrade the previous real-time Google Apps Script Web App to handle multiple banks and dynamically classify Income/Expense based on a configuration tab in Google Sheets.

1. CONFIGURATION DRIVEN:
   - Create a "Config" tab in the Google Sheet with columns: [Sender Email], [Keyword], [Transaction Type (Income/Expense)], and [Account Name].
   - When the `doPost(e)` webhook is triggered by Google Pub/Sub, the script will fetch the raw email body.

2. ROUTING LOGIC:
   - The script must load the "Config" table into memory.
   - It will identify the email sender, then loop through the keywords assigned to that sender to determine if the email represents an "Income" or an "Expense", and which "Account Name" it belongs to.

3. ROBUST PARSING:
   - Provide helper functions within the script to parse formats from different banks (e.g., Chase, Venmo, Bank of America) based on the sender identity.
   - Extract Date, Amount, Type, Account, and Description.

4. LOGGING:
   - Append the cleaned data into the main ledger sheet with columns: `Date` | `Type (Income/Expense)` | `Account/Bank` | `Amount` | `Merchant/Description`.

Please provide the updated `doPost(e)` function and the complete setup architecture.
