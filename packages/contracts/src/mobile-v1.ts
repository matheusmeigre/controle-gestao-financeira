import { z } from 'zod'

export const apiVersionSchema = z.literal('v1')
export const resourceIdSchema = z.string().min(1)
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
export const yearMonthSchema = z.string().regex(/^\d{4}-\d{2}$/)
export const isoDateTimeSchema = z.string().datetime()
export const amountSchema = z.number().finite().nonnegative()

const dataResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
  })

export const problemDetailsSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().min(1).optional(),
  instance: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  errors: z.record(z.array(z.string().min(1))).optional(),
})

export const mobileMeSchema = z.object({
  id: z.string().min(1),
})

export const mobileMeResponseSchema = z.object({
  data: mobileMeSchema,
})

export const currentPeriodSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  yearMonth: yearMonthSchema,
})

export const expenseStatusSchema = z.enum(['paid', 'pending'])
export const recurringFrequencySchema = z.enum(['monthly', 'yearly'])

export const mobileExpenseSchema = z.object({
  id: resourceIdSchema,
  description: z.string().min(1),
  amount: amountSchema,
  category: z.string().min(1),
  date: localDateSchema,
  status: expenseStatusSchema.optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: recurringFrequencySchema.optional(),
  dueDate: localDateSchema.optional(),
  isActive: z.boolean().optional(),
  notes: z.string().min(1).optional(),
  cardName: z.string().min(1).optional(),
  personName: z.string().min(1).optional(),
})

export const createMobileExpenseSchema = mobileExpenseSchema.omit({ id: true })

export const updateMobileExpenseSchema = createMobileExpenseSchema.partial()

export const mobileExpenseResponseSchema = dataResponseSchema(mobileExpenseSchema)
export const mobileExpensesListResponseSchema = dataResponseSchema(z.array(mobileExpenseSchema))

export const incomeTypeSchema = z.enum(['salary', 'extra'])
export const incomeStatusSchema = z.enum(['pending', 'received'])

export const mobileIncomeSchema = z.object({
  id: resourceIdSchema,
  description: z.string().min(1),
  amount: amountSchema,
  type: incomeTypeSchema,
  category: z.string().min(1).optional(),
  date: localDateSchema,
  status: incomeStatusSchema,
  registrationDate: isoDateTimeSchema,
  receivedDate: isoDateTimeSchema.nullable(),
})

export const createMobileIncomeSchema = mobileIncomeSchema.omit({
  id: true,
  registrationDate: true,
  receivedDate: true,
})

export const updateMobileIncomeSchema = createMobileIncomeSchema.partial()

export const receiveMobileIncomeSchema = z.object({
  receivedDate: isoDateTimeSchema.optional(),
})

export const mobileIncomeResponseSchema = dataResponseSchema(mobileIncomeSchema)
export const mobileIncomesListResponseSchema = dataResponseSchema(z.array(mobileIncomeSchema))

export const cardBrandSchema = z.enum([
  'Visa',
  'Mastercard',
  'Elo',
  'American Express',
  'Hipercard',
  'Outros',
])

export const mobileCardSchema = z.object({
  id: resourceIdSchema,
  nickname: z.string().min(1),
  bankName: z.string().min(1),
  brand: cardBrandSchema,
  last4Digits: z.string().regex(/^\d{4}$/),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  creditLimit: amountSchema.optional(),
  isActive: z.boolean(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
})

export const createMobileCardSchema = mobileCardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateMobileCardSchema = createMobileCardSchema.partial()

export const mobileCardResponseSchema = dataResponseSchema(mobileCardSchema)
export const mobileCardsListResponseSchema = dataResponseSchema(z.array(mobileCardSchema))

export const mobileInvoiceItemSchema = z.object({
  id: resourceIdSchema,
  date: localDateSchema,
  description: z.string().min(1),
  amount: amountSchema,
  category: z.string().min(1),
  installment: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
  createdAt: isoDateTimeSchema.optional(),
})

export const createMobileInvoiceItemSchema = mobileInvoiceItemSchema.omit({
  id: true,
  createdAt: true,
})

export const mobileInvoiceSchema = z.object({
  id: resourceIdSchema,
  cardId: resourceIdSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  closingDate: localDateSchema,
  dueDate: localDateSchema,
  totalAmount: amountSchema,
  paidAmount: amountSchema,
  isPaid: z.boolean(),
  items: z.array(mobileInvoiceItemSchema),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional(),
})

export const createMobileInvoiceSchema = z.object({
  cardId: resourceIdSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  closingDate: localDateSchema,
  dueDate: localDateSchema,
  items: z.array(createMobileInvoiceItemSchema).default([]),
})

export const addMobileInvoiceItemSchema = z.object({
  item: createMobileInvoiceItemSchema,
})

export const updateMobileInvoicePaymentSchema = z.object({
  paidAmount: amountSchema,
})

export const mobileInvoiceItemResponseSchema = dataResponseSchema(mobileInvoiceItemSchema)

export const mobileInvoiceImportMetadataSchema = z.object({
  bankName: z.string().min(1).optional(),
  cardLast4: z.string().min(1).optional(),
  totalAmount: amountSchema.optional(),
  statementPeriod: z.string().min(1).optional(),
  confidence: z.number().finite().min(0).max(1).optional(),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  fileType: z.string().min(1).optional(),
  processedAt: isoDateTimeSchema,
  itemCount: z.number().int().nonnegative(),
  cardId: resourceIdSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  hasExtractedDates: z.boolean().optional(),
})

export const mobileInvoiceImportPreviewSchema = z.object({
  items: z.array(mobileInvoiceItemSchema),
  metadata: mobileInvoiceImportMetadataSchema,
  warnings: z.array(z.string().min(1)).optional(),
})

export const mobileInvoiceImportPreviewResponseSchema = dataResponseSchema(mobileInvoiceImportPreviewSchema)

export const mobileInvoiceResponseSchema = dataResponseSchema(mobileInvoiceSchema)
export const mobileInvoicesListResponseSchema = dataResponseSchema(z.array(mobileInvoiceSchema))

export const planningStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'delayed', 'at_risk'])
export const planningRiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])

export const mobilePlanningSchema = z.object({
  id: resourceIdSchema,
  name: z.string().min(1),
  category: z.string().min(1),
  targetAmount: amountSchema,
  currentAmount: amountSchema,
  startDate: localDateSchema,
  targetDate: localDateSchema.optional(),
  status: planningStatusSchema,
  notes: z.string().min(1).optional(),
  linkedExpenseIds: z.array(resourceIdSchema),
  categoryData: z.unknown().optional(),
  creationContext: z.unknown().optional(),
  simulation: z.unknown().optional(),
  alerts: z.array(z.unknown()).optional(),
  riskLevel: planningRiskLevelSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
})

export const createMobilePlanningSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  targetAmount: amountSchema,
  currentAmount: amountSchema.default(0),
  startDate: localDateSchema,
  targetDate: localDateSchema.optional(),
  status: planningStatusSchema.default('planned'),
  notes: z.string().min(1).optional(),
  linkedExpenseIds: z.array(resourceIdSchema).default([]),
  categoryData: z.unknown().optional(),
  creationContext: z.unknown().optional(),
  simulation: z.unknown().optional(),
  alerts: z.array(z.unknown()).default([]),
  riskLevel: planningRiskLevelSchema.default('low'),
})

export const updateMobilePlanningSchema = createMobilePlanningSchema.partial()

export const createMobilePlanningContributionSchema = z.object({
  amount: amountSchema.refine((value) => value > 0, 'Amount must be greater than zero'),
})

export const mobilePlanningResponseSchema = dataResponseSchema(mobilePlanningSchema)
export const mobilePlanningsListResponseSchema = dataResponseSchema(z.array(mobilePlanningSchema))

export const mobileBootstrapSummarySchema = z.object({
  expensesCount: z.number().int().min(0),
  incomesCount: z.number().int().min(0),
  invoicesCount: z.number().int().min(0),
  cardsCount: z.number().int().min(0),
  planningsCount: z.number().int().min(0),
})

export const mobileBootstrapCapabilitiesSchema = z.object({
  me: z.literal('/api/v1/me'),
  bootstrap: z.literal('/api/v1/bootstrap'),
})

export const mobileBootstrapSchema = z.object({
  apiVersion: apiVersionSchema,
  serverTime: isoDateTimeSchema,
  currentPeriod: currentPeriodSchema,
  summary: mobileBootstrapSummarySchema,
  capabilities: mobileBootstrapCapabilitiesSchema,
})

export const mobileBootstrapResponseSchema = dataResponseSchema(mobileBootstrapSchema)

export type ProblemDetails = z.infer<typeof problemDetailsSchema>
export type MobileMe = z.infer<typeof mobileMeSchema>
export type MobileMeResponse = z.infer<typeof mobileMeResponseSchema>
export type CurrentPeriod = z.infer<typeof currentPeriodSchema>
export type MobileExpense = z.infer<typeof mobileExpenseSchema>
export type CreateMobileExpense = z.infer<typeof createMobileExpenseSchema>
export type UpdateMobileExpense = z.infer<typeof updateMobileExpenseSchema>
export type MobileExpenseResponse = z.infer<typeof mobileExpenseResponseSchema>
export type MobileExpensesListResponse = z.infer<typeof mobileExpensesListResponseSchema>
export type MobileIncome = z.infer<typeof mobileIncomeSchema>
export type CreateMobileIncome = z.infer<typeof createMobileIncomeSchema>
export type UpdateMobileIncome = z.infer<typeof updateMobileIncomeSchema>
export type ReceiveMobileIncome = z.infer<typeof receiveMobileIncomeSchema>
export type MobileIncomeResponse = z.infer<typeof mobileIncomeResponseSchema>
export type MobileIncomesListResponse = z.infer<typeof mobileIncomesListResponseSchema>
export type MobileCard = z.infer<typeof mobileCardSchema>
export type CreateMobileCard = z.infer<typeof createMobileCardSchema>
export type UpdateMobileCard = z.infer<typeof updateMobileCardSchema>
export type MobileCardResponse = z.infer<typeof mobileCardResponseSchema>
export type MobileCardsListResponse = z.infer<typeof mobileCardsListResponseSchema>
export type MobileInvoiceItem = z.infer<typeof mobileInvoiceItemSchema>
export type CreateMobileInvoiceItem = z.infer<typeof createMobileInvoiceItemSchema>
export type AddMobileInvoiceItem = z.infer<typeof addMobileInvoiceItemSchema>
export type MobileInvoice = z.infer<typeof mobileInvoiceSchema>
export type CreateMobileInvoice = z.infer<typeof createMobileInvoiceSchema>
export type UpdateMobileInvoicePayment = z.infer<typeof updateMobileInvoicePaymentSchema>
export type MobileInvoiceItemResponse = z.infer<typeof mobileInvoiceItemResponseSchema>
export type MobileInvoiceImportMetadata = z.infer<typeof mobileInvoiceImportMetadataSchema>
export type MobileInvoiceImportPreview = z.infer<typeof mobileInvoiceImportPreviewSchema>
export type MobileInvoiceImportPreviewResponse = z.infer<typeof mobileInvoiceImportPreviewResponseSchema>
export type MobileInvoiceResponse = z.infer<typeof mobileInvoiceResponseSchema>
export type MobileInvoicesListResponse = z.infer<typeof mobileInvoicesListResponseSchema>
export type MobilePlanning = z.infer<typeof mobilePlanningSchema>
export type CreateMobilePlanning = z.infer<typeof createMobilePlanningSchema>
export type UpdateMobilePlanning = z.infer<typeof updateMobilePlanningSchema>
export type CreateMobilePlanningContribution = z.infer<
  typeof createMobilePlanningContributionSchema
>
export type MobilePlanningResponse = z.infer<typeof mobilePlanningResponseSchema>
export type MobilePlanningsListResponse = z.infer<typeof mobilePlanningsListResponseSchema>
export type MobileBootstrapSummary = z.infer<typeof mobileBootstrapSummarySchema>
export type MobileBootstrap = z.infer<typeof mobileBootstrapSchema>
export type MobileBootstrapResponse = z.infer<typeof mobileBootstrapResponseSchema>
