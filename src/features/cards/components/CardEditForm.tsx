'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import type { CreditCard } from '@/types/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BankSelector } from './BankSelector'
import { CreditLimitInput } from './CreditLimitInput'

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'] as const
const STORAGE_KEY = 'credit_cards'

const editCardSchema = z.object({
  nickname: z.string().min(1, 'Apelido é obrigatório').max(50),
  bankName: z.string().min(1, 'Instituição é obrigatória'),
  brand: z.enum(['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'], {
    errorMap: () => ({ message: 'Selecione uma bandeira' })
  }),
  last4Digits: z.string().regex(/^\d{4}$/, 'Deve conter exatamente 4 dígitos'),
  closingDay: z.number().int().min(1, 'Mínimo 1').max(31, 'Máximo 31'),
  dueDay: z.number().int().min(1, 'Mínimo 1').max(31, 'Máximo 31'),
  creditLimit: z.number().positive().optional(),
  isActive: z.boolean(),
})

type EditCardInput = z.infer<typeof editCardSchema>

interface CardEditFormProps {
  card: CreditCard
  onSuccess?: () => void
  onCancel?: () => void
}

export function CardEditForm({ card, onSuccess, onCancel }: CardEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<EditCardInput>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      nickname: card.nickname,
      bankName: card.bankName,
      brand: card.brand,
      last4Digits: card.last4Digits,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      creditLimit: card.creditLimit,
      isActive: card.isActive,
    },
  })

  const onSubmit = async (data: EditCardInput) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Buscar cartões do localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setError('Nenhum cartão encontrado')
        return
      }

      const allCards: CreditCard[] = JSON.parse(stored)
      
      // Atualizar o cartão
      const updatedCards = allCards.map(c => {
        if (c.id === card.id) {
          return {
            ...c,
            ...data,
            updatedAt: new Date(),
          }
        }
        return c
      })

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards))

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/cards')
        router.refresh()
      }
    } catch (err) {
      setError('Erro inesperado ao atualizar cartão')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Cartão de Crédito</CardTitle>
        <CardDescription>
          Atualize as informações do seu cartão
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
              placeholder="Ex: Cartão Pessoal"
              {...register('nickname', {
                onChange: (e) => {
                  setValue('nickname', e.target.value, { shouldValidate: true })
                }
              })}
              disabled={isSubmitting}
              aria-invalid={!!errors.nickname}
            />
            {errors.nickname && (
              <p className="text-sm text-red-500">{errors.nickname.message}</p>
            )}
          </div>

          {/* Instituição */}
          <Controller
            name="bankName"
            control={control}
            render={({ field }) => (
              <BankSelector
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.bankName?.message}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Bandeira */}
          <div className="space-y-2">
            <Label htmlFor="brand">
              Bandeira <span className="text-red-500">*</span>
            </Label>
            <select
              id="brand"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register('brand')}
              disabled={isSubmitting}
              aria-invalid={!!errors.brand}
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
              {...register('last4Digits', {
                onChange: (e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '')
                  e.target.value = cleanValue
                  setValue('last4Digits', cleanValue, { shouldValidate: true })
                }
              })}
              disabled={isSubmitting}
              aria-invalid={!!errors.last4Digits}
            />
            {errors.last4Digits && (
              <p className="text-sm text-red-500">{errors.last4Digits.message}</p>
            )}
          </div>

          {/* Dias de Fechamento e Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">
                Dia de Fechamento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closingDay"
                type="number"
                min={1}
                max={31}
                placeholder="10"
                {...register('closingDay', {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setValue('closingDay', value, { shouldValidate: true })
                    }
                  }
                })}
                disabled={isSubmitting}
                aria-invalid={!!errors.closingDay}
              />
              {errors.closingDay && (
                <p className="text-sm text-red-500">{errors.closingDay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">
                Dia de Vencimento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                placeholder="15"
                {...register('dueDay', {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setValue('dueDay', value, { shouldValidate: true })
                    }
                  }
                })}
                disabled={isSubmitting}
                aria-invalid={!!errors.dueDay}
              />
              {errors.dueDay && (
                <p className="text-sm text-red-500">{errors.dueDay.message}</p>
              )}
            </div>
          </div>

          {/* Limite */}
          <Controller
            name="creditLimit"
            control={control}
            render={({ field }) => (
              <CreditLimitInput
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.back())}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
