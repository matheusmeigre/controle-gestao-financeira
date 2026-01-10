'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { createCreditCardSchema, type CreateCreditCardInput } from '@/types/card'
import { createCard } from '@/server/actions/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'] as const

interface CardFormProps {
  onSuccess?: () => void
}

export function CardForm({ onSuccess }: CardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCreditCardInput>({
    resolver: zodResolver(createCreditCardSchema),
    defaultValues: {
      closingDay: 10,
      dueDay: 15,
      isActive: true,
    },
  })
  
  const onSubmit = async (data: CreateCreditCardInput) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const result = await createCard(data)
      
      if (!result.success) {
        setError(result.error || 'Erro ao cadastrar cartão')
        return
      }
      
      reset()
      onSuccess?.()
    } catch (err) {
      setError('Erro inesperado ao cadastrar cartão')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Cartão de Crédito</CardTitle>
        <CardDescription>
          Cadastre seu cartão para gerenciar faturas. Por segurança, armazenamos apenas os últimos 4 dígitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Apelido */}
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Apelido do Cartão <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nickname"
              placeholder="Ex: Cartão Pessoal, Cartão Corporativo"
              {...register('nickname')}
              disabled={isSubmitting}
            />
            {errors.nickname && (
              <p className="text-sm text-red-500">{errors.nickname.message}</p>
            )}
          </div>
          
          {/* Instituição */}
          <div className="space-y-2">
            <Label htmlFor="bankName">
              Instituição Bancária <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankName"
              placeholder="Ex: Nubank, Inter, Itaú"
              {...register('bankName')}
              disabled={isSubmitting}
            />
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName.message}</p>
            )}
          </div>
          
          {/* Bandeira */}
          <div className="space-y-2">
            <Label htmlFor="brand">
              Bandeira <span className="text-red-500">*</span>
            </Label>
            <select
              id="brand"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('brand')}
              disabled={isSubmitting}
            >
              <option value="">Selecione...</option>
              {CARD_BRANDS.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {errors.brand && (
              <p className="text-sm text-red-500">{errors.brand.message}</p>
            )}
          </div>
          
          {/* Últimos 4 Dígitos */}
          <div className="space-y-2">
            <Label htmlFor="last4Digits">
              Últimos 4 Dígitos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last4Digits"
              placeholder="0000"
              maxLength={4}
              {...register('last4Digits')}
              disabled={isSubmitting}
            />
            {errors.last4Digits && (
              <p className="text-sm text-red-500">{errors.last4Digits.message}</p>
            )}
          </div>
          
          {/* Dias de Fechamento e Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">Dia de Fechamento</Label>
              <Input
                id="closingDay"
                type="number"
                min={1}
                max={31}
                {...register('closingDay', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.closingDay && (
                <p className="text-sm text-red-500">{errors.closingDay.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia de Vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                {...register('dueDay', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.dueDay && (
                <p className="text-sm text-red-500">{errors.dueDay.message}</p>
              )}
            </div>
          </div>
          
          {/* Limite (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="creditLimit">Limite de Crédito (Opcional)</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('creditLimit', { 
                valueAsNumber: true,
                setValueAs: (v) => v === '' ? undefined : parseFloat(v)
              })}
              disabled={isSubmitting}
            />
            {errors.creditLimit && (
              <p className="text-sm text-red-500">{errors.creditLimit.message}</p>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Cartão'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
