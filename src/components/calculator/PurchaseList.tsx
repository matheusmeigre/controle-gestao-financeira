"use client"

import { Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Purchase {
  id: string
  description: string
  amount: number
}

interface PurchaseListProps {
  purchases: Purchase[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function PurchaseList({ purchases, onRemove, onClear }: PurchaseListProps) {
  if (purchases.length === 0) return null

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Compras Registradas:</label>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={onClear}
          className="h-8 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpar Tudo
        </Button>
      </div>
      <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="flex items-center justify-between bg-background p-2 rounded border border-border"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{purchase.description}</p>
              <p className="text-xs text-muted-foreground">R$ {purchase.amount.toFixed(2)}</p>
            </div>
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => onRemove(purchase.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
