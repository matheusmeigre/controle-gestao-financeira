/**
 * 📅 Invoice Dates Display Component
 * 
 * Componente para exibir as datas de fechamento e vencimento calculadas automaticamente.
 * Mostra informações de forma clara e intuitiva para o usuário.
 */

import { Calendar, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CalculatedDates } from '../utils/invoice-dates.utils'
import { InvoiceDateCalculator } from '../utils/invoice-dates.utils'

interface InvoiceDatesDisplayProps {
  dates: CalculatedDates
  competencyDisplay?: string
  className?: string
}

export function InvoiceDatesDisplay({ 
  dates, 
  competencyDisplay,
  className = '' 
}: InvoiceDatesDisplayProps) {
  const closingFormatted = InvoiceDateCalculator.formatForDisplay(dates.closingDate)
  const dueFormatted = InvoiceDateCalculator.formatForDisplay(dates.dueDate)
  
  return (
    <Card className={`border-primary/20 bg-primary/5 ${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Datas Calculadas Automaticamente</h3>
            <Badge variant="secondary" className="ml-auto">
              {competencyDisplay || 'Automático'}
            </Badge>
          </div>
          
          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Data de Fechamento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fechamento</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {closingFormatted}
              </p>
              <p className="text-xs text-muted-foreground">
                Compras até esta data entram nesta fatura
              </p>
            </div>
            
            {/* Data de Vencimento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Vencimento</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {dueFormatted}
              </p>
              <p className="text-xs text-muted-foreground">
                Data limite para pagamento
              </p>
            </div>
          </div>
          
          {/* Info adicional */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              As datas são calculadas automaticamente com base nas configurações do cartão 
              e na competência selecionada. Você pode editá-las manualmente se necessário.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
