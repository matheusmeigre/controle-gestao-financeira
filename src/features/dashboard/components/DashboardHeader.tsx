/**
 * DashboardHeader Component
 * 
 * Header do dashboard com título e descrição
 */

import React from 'react'

export function DashboardHeader() {
  return (
    <div className="text-center mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
        Controle de Gastos
      </h1>
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-balance px-2 sm:px-4">
        Registre seus gastos mensais e faturas de cartão de forma rápida e simples
      </p>
    </div>
  )
}
