/**
 * DashboardHeader Component
 * 
 * Header do dashboard com título e descrição
 */

import React from 'react'

export function DashboardHeader() {
  return (
    <div className="mb-5 sm:mb-7">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Visão mensal</p>
      <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Resumo financeiro
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        Acompanhe o que já aconteceu e antecipe os compromissos do restante do mês.
      </p>
    </div>
  )
}
