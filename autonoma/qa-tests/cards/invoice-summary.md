---
title: "Display a provisioned invoice summary"
description: "Validates that the invoice list shows the current provisioned card invoice and its total."
intent: "The invoices area displays the expected card and open invoice amount."
criticality: high
scenario: standard
flow: "Cards and invoices"
verification: "Inspect the invoices list for the current card and open amount."
---

1. Authenticate and open the invoices area.
2. Locate the current invoice for "Cartao principal".
3. Verify that the open total is BRL 389.80.
4. Verify that the invoice is associated with the expected card and current period.
