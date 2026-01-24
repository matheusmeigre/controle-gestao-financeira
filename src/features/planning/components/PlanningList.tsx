'use client'

import { useState, useCallback, useMemo } from 'react'
import { PlanningCard } from './PlanningCard'
import { PlanningService } from '../services/planning.service'
import { usePlannings } from '../hooks/use-plannings'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PLANNING_CATEGORIES, PLANNING_STATUS } from '../types'
import type { PlanningFilters } from '../types'
import { Search, Filter, Loader2 } from 'lucide-react'

const planningService = new PlanningService()

interface PlanningListProps {
  onPlanningClick?: (planningId: string) => void
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  })

  return debouncedValue
}

export function PlanningList({ onPlanningClick }: PlanningListProps) {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [filters, setFilters] = useState<PlanningFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  
  // Aplica debounced search nos filtros
  const activeFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch || undefined
  }), [filters, debouncedSearch])
  
  const { plannings, loading, error } = usePlannings(activeFilters)

  const handleSearchChange = useCallback((search: string) => {
    setSearchInput(search)
  }, [])

  const handleStatusFilter = useCallback((status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as any),
    }))
  }, [])

  const handleCategoryFilter = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : (category as any),
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchInput('')
  }, [])

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some((value) => value !== undefined && value !== '') || searchInput !== '',
    [filters, searchInput]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de busca e filtros */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planejamentos..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={PLANNING_STATUS.PLANNED}>Planejado</SelectItem>
                  <SelectItem value={PLANNING_STATUS.IN_PROGRESS}>Em Progresso</SelectItem>
                  <SelectItem value={PLANNING_STATUS.COMPLETED}>Completo</SelectItem>
                  <SelectItem value={PLANNING_STATUS.CANCELLED}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.values(PLANNING_CATEGORIES).map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de planejamentos */}
      {plannings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? 'Nenhum planejamento encontrado com os filtros aplicados.'
              : 'Nenhum planejamento cadastrado. Crie seu primeiro planejamento!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannings.map((planning) => {
              const indicators = planningService.calculateIndicators(planning)
              return (
                <PlanningCard
                  key={planning.id}
                  planning={planning}
                  indicators={indicators}
                  onClick={() => onPlanningClick?.(planning.id)}
                />
              )
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {plannings.length} planejamento{plannings.length !== 1 ? 's' : ''} encontrado
            {plannings.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  )
}
