# Controle Gestao Financeira

## Application

This is a Portuguese-language personal finance application built with Next.js App Router. Clerk handles authentication and Supabase stores tenant-scoped financial data.

## Authentication

- Start at `/sign-in` and use the email and password returned by the Environment Factory.
- The Clerk instance used by Autonoma must have email/password sign-in enabled.
- A new browser may show terms and welcome dialogs. Accept them before validating dashboard content.

## Main Routes

- `/`: dashboard and transaction views.
- `/cards`: credit card management.
- `/invoices`: invoice management.
- `/planning`: financial planning.

## Environment Factory

- Endpoint: `POST /api/autonoma`.
- The endpoint is available only when `AUTONOMA_ENABLED=true` or inside an Autonoma PreviewKit environment.
- Scope field: `userId`.
- Requests are authenticated by `x-signature` HMAC.
- User records are real temporary Clerk users.
- Financial records are real temporary Supabase rows.
- Teardown removes both fixture records and records created through the UI by the temporary user.

## Testing Notes

- Currency is Brazilian real (BRL).
- Most dashboard data is filtered to the current month.
- Do not depend on IDs or exact generated email addresses.
- Verify persisted behavior after a page reload when a test changes data.
