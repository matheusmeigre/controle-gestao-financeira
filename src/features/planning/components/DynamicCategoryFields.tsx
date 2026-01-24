'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { 
  PlanningCategory,
  TravelPlanningData,
  PurchasePlanningData,
  EmergencyReservePlanningData,
  ExorbitantExpensePlanningData
} from '../types'

interface DynamicCategoryFieldsProps {
  category: PlanningCategory
  data: any
  onChange: (data: any) => void
}

export function DynamicCategoryFields({ category, data, onChange }: DynamicCategoryFieldsProps) {
  const updateField = <K extends keyof typeof data>(field: K, value: (typeof data)[K]) => {
    onChange({ ...data, [field]: value })
  }

  switch (category) {
    case 'travel':
      return <TravelFields data={data as TravelPlanningData} onChange={onChange} />
    case 'purchase':
      return <PurchaseFields data={data as PurchasePlanningData} onChange={onChange} />
    case 'emergency_reserve':
      return <EmergencyReserveFields data={data as EmergencyReservePlanningData} onChange={onChange} />
    case 'exorbitant_expense':
      return <ExorbitantExpenseFields data={data as ExorbitantExpensePlanningData} onChange={onChange} />
    default:
      return null
  }
}

function TravelFields({ 
  data, 
  onChange 
}: { 
  data: TravelPlanningData
  onChange: (data: TravelPlanningData) => void 
}) {
  const updateField = <K extends keyof TravelPlanningData>(field: K, value: TravelPlanningData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Detalhes da Viagem</h4>
        <p className="text-sm text-muted-foreground">
          Planeje sua viagem com antecedência
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destino *</Label>
          <Input
            id="destination"
            placeholder="Ex: Paris, França"
            value={data.destination || ''}
            onChange={(e) => updateField('destination', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfPeople">Número de Pessoas *</Label>
          <Input
            id="numberOfPeople"
            type="number"
            min="1"
            placeholder="Quantas pessoas vão?"
            value={data.numberOfPeople || ''}
            onChange={(e) => updateField('numberOfPeople', parseInt(e.target.value) || 1)}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de Ida *</Label>
          <DatePicker
            id="departureDate"
            value={data.departureDate || ''}
            onChange={(date) => updateField('departureDate', date)}
            placeholder="Selecione a data de ida"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="returnDate">Data de Volta</Label>
          <DatePicker
            id="returnDate"
            value={data.returnDate || ''}
            onChange={(date) => updateField('returnDate', date)}
            placeholder="Selecione a data de volta"
            minDate={data.departureDate || undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Custos Estimados (Opcional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <CurrencyInput
              placeholder="0,00"
              value={data.estimatedCosts?.flights || 0}
              onChange={(value) => updateField('estimatedCosts', {
                ...data.estimatedCosts,
                flights: value
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">Passagens</p>
          </div>
          <div>
            <CurrencyInput
              placeholder="0,00"
              value={data.estimatedCosts?.accommodation || 0}
              onChange={(value) => updateField('estimatedCosts', {
                ...data.estimatedCosts,
                accommodation: value
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">Hospedagem</p>
          </div>
          <div>
            <CurrencyInput
              placeholder="0,00"
              value={data.estimatedCosts?.food || 0}
              onChange={(value) => updateField('estimatedCosts', {
                ...data.estimatedCosts,
                food: value
              })}
            />
            <p className="text-xs text-muted-foreground mt-1">Alimentação</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Adicione detalhes sobre a viagem, roteiro, etc."
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
        />
      </div>
    </Card>
  )
}

function PurchaseFields({ 
  data, 
  onChange 
}: { 
  data: PurchasePlanningData
  onChange: (data: PurchasePlanningData) => void 
}) {
  const updateField = <K extends keyof PurchasePlanningData>(field: K, value: PurchasePlanningData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Detalhes da Compra</h4>
        <p className="text-sm text-muted-foreground">
          Planeje sua compra com inteligência
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="itemDescription">O que você quer comprar? *</Label>
          <Input
            id="itemDescription"
            placeholder="Ex: iPhone 15 Pro Max"
            value={data.itemDescription || ''}
            onChange={(e) => updateField('itemDescription', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store">Loja/Fornecedor</Label>
          <Input
            id="store"
            placeholder="Onde pretende comprar?"
            value={data.store || ''}
            onChange={(e) => updateField('store', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
          <Select
            value={data.paymentMethod}
            onValueChange={(value) => updateField('paymentMethod', value as 'cash' | 'installments' | 'mixed')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="cash">À Vista</SelectItem>
            <SelectItem value="installments">Parcelado</SelectItem>
            <SelectItem value="mixed">Misto (Entrada + Parcelas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(data.paymentMethod === 'installments' || data.paymentMethod === 'mixed') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="2"
                max="48"
                placeholder="Ex: 12"
                value={typeof data.installments === 'number' ? data.installments : ''}
                onChange={(e) => updateField('installments', parseInt(e.target.value) || 2)}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Taxa de Juros (% ao mês)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 2.5"
                value={data.interestRate || ''}
                onChange={(e) => updateField('interestRate', parseFloat(e.target.value) || 0)}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-muted-foreground">
                Deixe 0 se for sem juros
              </p>
            </div>

            {data.paymentMethod === 'mixed' && (
              <div className="space-y-2">
                <Label htmlFor="downPayment">Valor da Entrada</Label>
                <CurrencyInput
                  id="downPayment"
                  placeholder="0,00"
                  value={data.downPayment || 0}
                  onChange={(value) => updateField('downPayment', value)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgência *</Label>
        <Select
          value={data.urgency}
          onValueChange={(value) => updateField('urgency', value as 'immediate' | 'short_term' | 'medium_term' | 'long_term')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Imediata - Preciso logo</SelectItem>
            <SelectItem value="short_term">Curto prazo - Em breve</SelectItem>
            <SelectItem value="medium_term">Médio prazo - Posso esperar</SelectItem>
            <SelectItem value="long_term">Longo prazo - Sem pressa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Detalhes sobre o produto, especificações, etc."
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
        />
      </div>
    </Card>
  )
}

function EmergencyReserveFields({ 
  data, 
  onChange 
}: { 
  data: EmergencyReservePlanningData
  onChange: (data: EmergencyReservePlanningData) => void 
}) {
  const updateField = <K extends keyof EmergencyReservePlanningData>(field: K, value: EmergencyReservePlanningData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Reserva de Emergência</h4>
        <p className="text-sm text-muted-foreground">
          Construa sua proteção financeira
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
          O que é Reserva de Emergência?
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          É um valor guardado para cobrir imprevistos (desemprego, doença, consertos urgentes).
          Especialistas recomendam ter entre 3 e 6 meses de despesas guardadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthsOfExpenses">Quantos meses de despesas? *</Label>
          <Select
            value={data.monthsOfExpenses?.toString()}
            onValueChange={(value) => updateField('monthsOfExpenses', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses (Mínimo recomendado)</SelectItem>
              <SelectItem value="4">4 meses</SelectItem>
              <SelectItem value="5">5 meses</SelectItem>
              <SelectItem value="6">6 meses (Ideal)</SelectItem>
              <SelectItem value="9">9 meses (Conservador)</SelectItem>
              <SelectItem value="12">12 meses (Muito conservador)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyExpenses">Suas despesas mensais</Label>
          <CurrencyInput
            id="monthlyExpenses"
            placeholder="Calculado automaticamente"
            value={data.monthlyExpenses || 0}
            onChange={(value) => updateField('monthlyExpenses', value)}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Calculado com base nos seus gastos registrados
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="recommendedAmount">Valor Recomendado</Label>
          <CurrencyInput
            id="recommendedAmount"
            placeholder="Será calculado automaticamente"
            value={data.recommendedAmount || 0}
            onChange={(value) => updateField('recommendedAmount', value)}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            {data.monthsOfExpenses || 3} meses × {((data.monthlyExpenses || 0) / 1).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {((data.monthsOfExpenses || 3) * (data.monthlyExpenses || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentType">Onde guardar? *</Label>
        <Select
          value={data.investmentType}
          onValueChange={(value) => updateField('investmentType', value as 'savings' | 'cdb' | 'treasury')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="savings">Poupança (Liquidez imediata)</SelectItem>
            <SelectItem value="cdb">CDB Liquidez Diária (Rende mais)</SelectItem>
            <SelectItem value="treasury">Tesouro Selic (Seguro e rentável)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Reserva de emergência deve ter liquidez diária (sacar quando precisar)
        </p>
      </div>
    </Card>
  )
}

function ExorbitantExpenseFields({ 
  data, 
  onChange 
}: { 
  data: ExorbitantExpensePlanningData
  onChange: (data: ExorbitantExpensePlanningData) => void 
}) {
  const updateField = <K extends keyof ExorbitantExpensePlanningData>(field: K, value: ExorbitantExpensePlanningData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Despesa Exorbitante</h4>
        <p className="text-sm text-muted-foreground">
          Para gastos muito além do seu padrão normal
        </p>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <p className="text-sm text-orange-900 dark:text-orange-100 font-medium mb-2">
          Atenção: Despesa de Alto Impacto
        </p>
        <p className="text-xs text-orange-700 dark:text-orange-300">
          Este tipo de planejamento é para despesas que representam um grande comprometimento da sua renda.
          Seja muito criterioso ao justificar e avaliar se é realmente necessário.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição da Despesa *</Label>
          <Input
            id="description"
            placeholder="Ex: Casamento, Festa de 15 anos"
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="justification">Por que esta despesa é necessária? *</Label>
          <Textarea
            id="justification"
            placeholder="Explique a importância desta despesa e por que não pode ser adiada ou reduzida"
            value={data.justification || ''}
            onChange={(e) => updateField('justification', e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Seja sincero. Isso ajudará você a decidir conscientemente.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskAwareness">Consciência dos Riscos *</Label>
          <Select
            value={data.riskAwareness}
            onValueChange={(value) => updateField('riskAwareness', value as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="low">Tenho margem de segurança</SelectItem>
            <SelectItem value="medium">Vai apertar, mas é viável</SelectItem>
            <SelectItem value="high">É arriscado, mas vou fazer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backupPlan">Plano B (Se algo der errado) *</Label>
          <Textarea
            id="backupPlan"
            placeholder="O que você fará se não conseguir juntar o valor a tempo ou se surgirem imprevistos?"
            value={data.backupPlan || ''}
            onChange={(e) => updateField('backupPlan', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alternatives">Alternativas Consideradas</Label>
          <Textarea
            id="alternatives"
            placeholder="Quais outras opções você já considerou? Por que optou por esta?"
            value={data.alternatives || ''}
            onChange={(e) => updateField('alternatives', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </Card>
  )
}
