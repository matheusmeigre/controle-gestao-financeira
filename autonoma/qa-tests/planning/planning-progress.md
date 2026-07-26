---
title: "Update financial planning progress"
description: "Adds progress to an active emergency plan and confirms that its amount and progress indicator persist."
intent: "Adding a valid contribution increases current planning progress without changing its target."
criticality: high
scenario: standard
flow: "Planning"
verification: "Reload the planning details and compare current and target amounts."
---

1. Authenticate and open the planning area.
2. Open "Reserva de emergencia".
3. Record the current amount and target.
4. Add a positive contribution.
5. Verify that current progress increases and the target stays unchanged.
6. Reload and verify that the updated progress persists.
