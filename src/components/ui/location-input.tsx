"use client"

import * as React from "react"
import { MapPin, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { nominatimService, type LocationResult } from "@/lib/services/nominatim.service"

interface LocationInputProps {
  value?: LocationResult | null
  onChange?: (location: LocationResult | null) => void
  onManualInput?: (text: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  enableAutocomplete?: boolean
  className?: string
}

/**
 * Componente de entrada de localização com suporte híbrido:
 * 
 * 1. Entrada Manual: Digite livremente qualquer localização
 * 2. Autocomplete: Busca assistida por OpenStreetMap (opcional)
 * 
 * Arquitetura:
 * - Graceful degradation (funciona sem API)
 * - Debounce automático
 * - Cache de resultados
 * - Rate limiting integrado
 */
export function LocationInput({
  value,
  onChange,
  onManualInput,
  label = "Localização",
  placeholder = "Ex: Guarapari, ES",
  required = false,
  disabled = false,
  enableAutocomplete = true,
  className,
}: LocationInputProps) {
  const [inputValue, setInputValue] = React.useState(value?.displayName || "")
  const [suggestions, setSuggestions] = React.useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [useManualEntry, setUseManualEntry] = React.useState(!enableAutocomplete)

  const debounceRef = React.useRef<NodeJS.Timeout>()
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Atualiza input quando value externo muda
  React.useEffect(() => {
    if (value?.displayName) {
      setInputValue(value.displayName)
    }
  }, [value])

  // Fecha sugestões ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Busca com debounce
  const handleInputChange = (text: string) => {
    setInputValue(text)

    // Se modo manual, apenas notifica
    if (useManualEntry) {
      onManualInput?.(text)
      return
    }

    // Limpa debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Se texto vazio, limpa
    if (!text || text.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      onChange?.(null)
      return
    }

    // Debounce de 500ms
    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await nominatimService.searchLocations(text)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error('[LocationInput] Erro na busca:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  // Seleciona uma sugestão
  const handleSelectSuggestion = (location: LocationResult) => {
    setInputValue(location.displayName)
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.(location)
  }

  // Limpa seleção
  const handleClear = () => {
    setInputValue("")
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.(null)
    onManualInput?.("")
  }

  // Alterna entre modo manual e autocomplete
  const toggleMode = () => {
    setUseManualEntry(!useManualEntry)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Formata label do resultado
  const formatLocationLabel = (location: LocationResult): { main: string; sub: string } => {
    const parts: string[] = []
    
    if (location.city) parts.push(location.city)
    if (location.state) parts.push(location.state)
    if (location.country) parts.push(location.country)

    const main = parts.slice(0, 2).join(", ") || location.displayName.split(",")[0]
    const sub = parts.length > 2 ? parts.slice(2).join(", ") : ""

    return { main, sub }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="location-input">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {enableAutocomplete && (
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {useManualEntry ? "Ativar busca assistida" : "Entrada manual"}
          </button>
        )}
      </div>

      <div ref={containerRef} className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          
          <Input
            id="location-input"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-20"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            
            {inputValue && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 w-7 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((location, index) => {
                const { main, sub } = formatLocationLabel(location)
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(location)}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{main}</p>
                        {sub && (
                          <p className="text-xs text-muted-foreground truncate">{sub}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="px-3 py-2 bg-muted/50 border-t">
              <p className="text-xs text-muted-foreground">
                Powered by OpenStreetMap
              </p>
            </div>
          </div>
        )}
      </div>

      {!useManualEntry && (
        <p className="text-xs text-muted-foreground">
          Digite pelo menos 3 caracteres para buscar. Ou use entrada manual.
        </p>
      )}

      {useManualEntry && (
        <p className="text-xs text-muted-foreground">
          Modo manual: Digite livremente a localização desejada.
        </p>
      )}
    </div>
  )
}
