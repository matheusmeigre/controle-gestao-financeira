---
title: "Mark pending income as received"
description: "Changes a pending income to received and confirms that the status and balance survive a reload."
intent: "Receiving pending income updates its status and available balance exactly once."
criticality: high
scenario: standard
flow: "Income"
verification: "Inspect the income status and balance before and after reloading the dashboard."
---

1. Authenticate and open the current-month transaction view.
2. Locate the pending income named "Projeto freelance".
3. Mark it as received.
4. Verify the received state and corresponding balance change.
5. Reload and verify that both changes persist.
