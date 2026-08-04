export const MY_PERSON_NAME = 'Eu'

export interface SplitInvoiceItemLike {
  amount: number
  notes?: string
}

export interface SplitInvoiceLike {
  totalAmount: number
  items: ReadonlyArray<SplitInvoiceItemLike>
}

export function getPersonFromNotes(notes?: string): string {
  if (!notes) return MY_PERSON_NAME

  const match = notes.match(/^Pessoa: (.+)/m)
  return match?.[1]?.trim() || MY_PERSON_NAME
}

export function hasPersonSplit(invoice: SplitInvoiceLike): boolean {
  if (!invoice.items || invoice.items.length === 0) return false

  const persons = new Set(invoice.items.map((item) => getPersonFromNotes(item.notes)))
  return persons.size > 1
}

export function getPersonDivisions(invoice: SplitInvoiceLike): Record<string, number> {
  const divisions: Record<string, number> = {}

  for (const item of invoice.items) {
    const person = getPersonFromNotes(item.notes)
    divisions[person] = (divisions[person] ?? 0) + item.amount
  }

  return divisions
}

export function getMyPortion(
  invoice: SplitInvoiceLike,
  myPersonName: string = MY_PERSON_NAME
): number {
  if (!hasPersonSplit(invoice)) return invoice.totalAmount

  return invoice.items
    .filter((item) => getPersonFromNotes(item.notes) === myPersonName)
    .reduce((sum, item) => sum + item.amount, 0)
}
