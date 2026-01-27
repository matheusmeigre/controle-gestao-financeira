'use client'

import { useEffect, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatFn?: (value: number) => string
  className?: string
}

export function AnimatedNumber({ 
  value, 
  duration = 800, 
  formatFn,
  className = ''
}: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>(0)

  useEffect(() => {
    if (!nodeRef.current) return

    const node = nodeRef.current
    const startValue = startValueRef.current
    const endValue = value
    const diff = endValue - startValue

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + diff * easeOutCubic
      
      if (node) {
        node.textContent = formatFn ? formatFn(currentValue) : currentValue.toFixed(0)
      }
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        startValueRef.current = endValue
        startTimeRef.current = undefined
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration, formatFn])

  return <span ref={nodeRef} className={className}>{formatFn ? formatFn(value) : value}</span>
}
