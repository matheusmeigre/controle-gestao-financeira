# Entity Audit

| Factory | Backing service | Scope | Teardown |
| --- | --- | --- | --- |
| User | Clerk | Root user | Delete all scoped data, then delete Clerk user |
| Expense | Supabase `expenses` | `userId` | Delete scoped row |
| Income | Supabase `incomes` | `userId` | Delete scoped row |
| CreditCard | Supabase `credit_cards` | `userId` | Delete scoped row |
| CardBill | Supabase `card_bills` | `userId` | Delete scoped row |
| Invoice | Supabase `invoices` | `userId` | Delete scoped row and cascade items |
| InvoiceItem | Supabase `invoice_items` | Parent invoice | Delete parent-scoped row |
| Planning | Supabase `plannings` | `userId` | Delete scoped row |

Every persisted domain currently used by the dashboard has a factory. Foreign keys are represented with `_alias` and `_ref`; the SDK resolves them before invoking a factory. Before normal teardown, all rows belonging to the temporary user are deleted so records created by browser actions cannot leak.
