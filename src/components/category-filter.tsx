"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CategoryFilterProps {
  categories: readonly string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  label?: string
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange, label = "Filtrar por categoria" }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]" aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCategory !== "all" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCategoryChange("all")}
          aria-label="Limpar filtro de categoria"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
