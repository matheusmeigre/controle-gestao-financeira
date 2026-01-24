'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlanningCategory } from '../types'
import { 
  Plane, 
  ShoppingBag, 
  Heart, 
  GraduationCap, 
  Home, 
  Zap,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategorySelectorProps {
  selectedCategory: PlanningCategory | null
  onSelectCategory: (category: PlanningCategory) => void
}

interface CategoryOption {
  value: PlanningCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  examples: string[]
  color: string
  difficulty: 'easy' | 'medium' | 'complex'
}

const categories: CategoryOption[] = [
  {
    value: 'travel',
    label: 'Viagem',
    icon: Plane,
    description: 'Planeje suas férias com antecedência',
    examples: ['Destino, datas, número de pessoas', 'Passagens, hospedagem, passeios'],
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'medium',
  },
  {
    value: 'purchase',
    label: 'Compra Grande',
    icon: ShoppingBag,
    description: 'Quer comprar algo caro? Planeje!',
    examples: ['Eletrônico, móvel, veículo', 'À vista ou parcelado'],
    color: 'from-purple-500 to-pink-500',
    difficulty: 'medium',
  },
  {
    value: 'emergency_reserve',
    label: 'Reserva de Emergência',
    icon: Zap,
    description: 'Construa sua rede de segurança',
    examples: ['3-6 meses de despesas', 'Proteção financeira'],
    color: 'from-orange-500 to-red-500',
    difficulty: 'complex',
  },
  {
    value: 'education',
    label: 'Educação',
    icon: GraduationCap,
    description: 'Invista no seu futuro',
    examples: ['Curso, graduação, pós', 'Idiomas, certificações'],
    color: 'from-green-500 to-emerald-500',
    difficulty: 'easy',
  },
  {
    value: 'health',
    label: 'Saúde',
    icon: Heart,
    description: 'Cuide de você e da família',
    examples: ['Tratamento, cirurgia', 'Plano de saúde'],
    color: 'from-red-500 to-rose-500',
    difficulty: 'easy',
  },
  {
    value: 'housing',
    label: 'Moradia',
    icon: Home,
    description: 'Casa própria ou reforma',
    examples: ['Entrada do imóvel', 'Reforma, decoração'],
    color: 'from-amber-500 to-yellow-500',
    difficulty: 'complex',
  },
  {
    value: 'exorbitant_expense',
    label: 'Despesa Exorbitante',
    icon: TrendingUp,
    description: 'Para gastos muito além do normal',
    examples: ['Casamento, festa', 'Evento especial'],
    color: 'from-violet-500 to-purple-500',
    difficulty: 'complex',
  },
]

export function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const getDifficultyLabel = (difficulty: CategoryOption['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'Simples'
      case 'medium':
        return 'Moderado'
      case 'complex':
        return 'Complexo'
    }
  }

  const getDifficultyDescription = (difficulty: CategoryOption['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'Poucos campos, rápido de criar'
      case 'medium':
        return 'Campos moderados, algumas opções'
      case 'complex':
        return 'Muitos campos, análise detalhada'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tipo de Planejamento</h3>
        <p className="text-sm text-muted-foreground">
          Selecione a categoria que melhor representa seu objetivo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.value
          
          return (
            <Card
              key={category.value}
              className={cn(
                'relative overflow-hidden cursor-pointer transition-all hover:shadow-lg',
                isSelected
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:scale-102'
              )}
              onClick={() => onSelectCategory(category.value)}
            >
              {/* Gradient Header */}
              <div className={`h-24 bg-gradient-to-br ${category.color} p-4 flex items-center justify-center relative`}>
                <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white dark:bg-gray-900 text-primary border-2 border-primary font-semibold">
                      Selecionado
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{category.label}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getDifficultyLabel(category.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Exemplos:</p>
                  <ul className="space-y-1">
                    {category.examples.map((example, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Difficulty Info */}
                <p className="text-xs text-muted-foreground italic pt-2 border-t">
                  {getDifficultyDescription(category.difficulty)}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedCategory && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium">
            {categories.find(c => c.value === selectedCategory)?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Preencha os detalhes abaixo
          </p>
        </div>
      )}
    </div>
  )
}
