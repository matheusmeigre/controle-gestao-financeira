# Autonoma Scenarios

## empty

An authenticated user with no financial records. Use this scenario for onboarding, empty states and first-record journeys.

## standard

An authenticated user with current-month income, paid and pending expenses, a recurring subscription, a credit card, an open invoice, a legacy shared bill and an active financial plan. Use this scenario for normal CRUD and dashboard journeys.

## large

An authenticated user with varied income, twelve categorized expenses, two cards and three plans. Use this scenario for filters, reports, sorting and denser list rendering.

All records are scoped to the Clerk user created for the run. Dates omitted by the recipes are filled with the current date by the factories, and every run is torn down in reverse dependency order.
