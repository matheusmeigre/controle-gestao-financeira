---
title: "Create and persist an expense"
description: "Creates a current-month expense and verifies that dashboard totals and persisted transactions update."
intent: "Saving a valid expense adds it once and changes the current-month expense total."
criticality: critical
scenario: standard
flow: "Expenses"
verification: "Reload the transaction view and inspect the expense row and dashboard total."
---

1. Authenticate and complete any first-run dialogs.
2. Open the transaction view and start a new expense.
3. Enter a unique description, a positive amount and a category.
4. Save the expense and verify that it appears exactly once.
5. Reload the page and verify that the row and updated total persist.
