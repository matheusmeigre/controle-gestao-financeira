---
title: "Show an empty financial dashboard"
description: "Confirms that a newly provisioned user sees valid empty states without another tenant's data."
intent: "A user with no records sees zeroed summaries and no financial entries."
criticality: critical
scenario: empty
flow: "Dashboard"
verification: "Inspect the dashboard summaries and transaction lists after authentication."
---

1. Authenticate with the credentials provided by the scenario.
2. Accept the terms and dismiss the welcome flow if they appear.
3. Open the dashboard.
4. Verify that financial summaries are zero and no transaction from another user is visible.
