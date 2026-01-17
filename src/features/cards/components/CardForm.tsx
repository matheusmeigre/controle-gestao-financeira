'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { createCreditCardSchema, type CreateCreditCardInput, type CreditCard } from '@/types/card'
import { createCard } from '@/server/actions/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BankSelector } from './BankSelector'
import { CreditLimitInput } from './CreditLimitInput'

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'] as const
const STORAGE_KEY = 'credit_cards'

interface CardFormProps {
  onSuccess?: () => void
}

export function CardForm({ onSuccess }: CardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useUser()
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCreditCardInput>({
    resolver: zodResolver(createCreditCardSchema),
    mode: 'onSubmit',
    defaultValues: {
      nickname: '',
      bankName: '',
      brand: undefined,
      last4Digits: '',
      closingDay: 10,
      dueDay: 15,
      creditLimit: undefined,
      isActive: true,
    },
  })
  
  const onSubmit = async (data: CreateCreditCardInput) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      console.log('Form Data Submitted:', data)
      
      if (!user?.id) {
        setError('Usuário não autenticado')
        return
      }
      
      // Buscar cartões existentes do localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      const allCards: CreditCard[] = stored ? JSON.parse(stored) : []
      
      // Verificar duplicatas
      const duplicate = allCards.find(
        card => card.userId === user.id &&
        card.last4Digits === data.last4Digits &&
        card.isActive
      )
      
      if (duplicate) {
        setError('Cartão já cadastrado com estes últimos 4 dígitos')
        return
      }
      
      // Criar cartão via server action (validação)
      const result = await createCard(data)
      
      if (!result.success || !result.data) {
        setError(result.error || 'Erro ao cadastrar cartão')
        return
      }
      
      // Salvar no localStorage
      const newCard = result.data
      allCards.push(newCard)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCards))
      
      console.log('Card saved successfully:', newCard)
      
      reset()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/cards')
        router.refresh()
      }
    } catch (err) {
      setError('Erro inesperado ao cadastrar cartão')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const onError = (errors: unknown) => {
    console.log('Form Validation Errors:', errors)
    console.log('Current Form Values:', watch())
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
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          {/* Apelido */}
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Apelido do Cartão <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nickname"
              placeholder="Ex: Cartão Pessoal, Cartão Corporativo"
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
                  // Remove caracteres não numéricos
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
          
          {/* Limite (Opcional) */}
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
