'use client'

/**
 * Progress Component
 * 
 * Barra de progresso para exibir porcentagem de gastos
 */

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, ...props }, ref) => {
  const normalizedValue = Math.min(100, Math.max(0, value ?? 0))

  return (
    <ProgressPrimitive.Root
    ref={ref}
    value={normalizedValue}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 bg-primary transition-all',
        indicatorClassName
      )}
       style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
    />
  </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
