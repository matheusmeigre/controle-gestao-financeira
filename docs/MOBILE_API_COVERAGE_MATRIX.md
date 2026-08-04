# Mobile API Coverage Matrix

## Coverage

| Domain | Mobile UI flow | Public endpoint | `@api-client` | Status |
|---|---|---|---|---|
| Auth | bootstrap session | `/me`, `/bootstrap` | `getMe`, `getBootstrap`, `bootstrapSession` | Covered |
| Expenses | list | `GET /expenses` | `listExpenses` | Covered |
| Expenses | detail | `GET /expenses/{id}` | `getExpense` | Covered |
| Expenses | create | `POST /expenses` | `createExpense` | Covered |
| Expenses | update | `PATCH /expenses/{id}` | `updateExpense` | Covered |
| Expenses | delete | `DELETE /expenses/{id}` | `deleteExpense` | Covered |
| Incomes | list | `GET /incomes` | `listIncomes` | Covered |
| Incomes | detail | `GET /incomes/{id}` | `getIncome` | Covered |
| Incomes | create | `POST /incomes` | `createIncome` | Covered |
| Incomes | update | `PATCH /incomes/{id}` | `updateIncome` | Covered |
| Incomes | delete | `DELETE /incomes/{id}` | `deleteIncome` | Covered |
| Incomes | receive | `POST /incomes/{id}/receive` | `receiveIncome` | Covered |
| Cards | list | `GET /cards` | `listCards` | Covered |
| Cards | detail | `GET /cards/{id}` | `getCard` | Covered |
| Cards | create | `POST /cards` | `createCard` | Covered |
| Cards | update | `PATCH /cards/{id}` | `updateCard` | Covered |
| Cards | delete | `DELETE /cards/{id}` | `deleteCard` | Covered |
| Invoices | list | `GET /invoices` | `listInvoices` | Covered |
| Invoices | detail | `GET /invoices/{id}` | `getInvoice` | Covered |
| Invoices | create | `POST /invoices` | `createInvoice` | Covered |
| Invoices | delete | `DELETE /invoices/{id}` | `deleteInvoice` | Covered |
| Invoices | pay | `POST /invoices/{id}/payments` | `payInvoice` | Covered |
| Invoice Items | add | `POST /invoices/{id}/items` | `addInvoiceItem` | Covered |
| Invoice Items | remove | `DELETE /invoices/{id}/items/{itemId}` | `removeInvoiceItem` | Covered |
| Plannings | list | `GET /plannings` | `listPlannings` | Covered |
| Plannings | detail | `GET /plannings/{id}` | `getPlanning` | Covered |
| Plannings | create | `POST /plannings` | `createPlanning` | Covered |
| Plannings | update | `PATCH /plannings/{id}` | `updatePlanning` | Covered |
| Plannings | delete | `DELETE /plannings/{id}` | `deletePlanning` | Covered |
| Plannings | contribution | `POST /plannings/{id}/contributions` | `contributeToPlanning` | Covered |
| Invoice import preview | upload preview | `POST /invoices/imports/preview` | `previewInvoiceImport` | Covered |

## Notes

- Nenhuma tela mobile atual depende diretamente de `src/server/actions`.
- Filtros de `yearMonth` para despesas/receitas e `includeInactive` para cartões fazem parte do contrato público.
- As telas de detalhe de despesas e receitas agora usam endpoints públicos por ID, eliminando dependência de cache de lista para deep links.
