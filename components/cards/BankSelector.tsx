'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { BRAZILIAN_BANKS, searchBanks, formatBankDisplay } from '@/lib/banks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BankSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function BankSelector({ value, onChange, error, disabled }: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const filteredBanks = searchBanks(searchQuery)
  const selectedBank = BRAZILIAN_BANKS.find(b => formatBankDisplay(b) === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (bank: typeof BRAZILIAN_BANKS[0]) => {
    const displayValue = formatBankDisplay(bank)
    onChange(displayValue)
    setIsOpen(false)
    setSearchQuery('')
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor="bankName">
        Instituição Bancária <span className="text-red-500">*</span>
      </Label>
      
      {/* Campo oculto para garantir que o valor seja capturado */}
      <input type="hidden" id="bankName" value={value} />
      
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full justify-between ${error ? 'border-red-500' : ''}`}
          aria-label="Selecionar banco"
        >
          <span className={selectedBank ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedBank ? formatBankDisplay(selectedBank) : 'Selecione o banco...'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover shadow-lg">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar banco..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredBanks.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Nenhum banco encontrado
                </div>
              ) : (
                filteredBanks.map((bank) => {
                  const isSelected = formatBankDisplay(bank) === value
                  
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => handleSelect(bank)}
                      className={`
                        w-full flex items-center justify-between px-2 py-2 text-sm rounded-sm
                        hover:bg-accent hover:text-accent-foreground
                        ${isSelected ? 'bg-accent' : ''}
                      `}
                    >
                      <span className="flex-1 text-left">
                        <span className="font-medium">{bank.code}</span>
                        {' - '}
                        <span>{bank.name}</span>
                      </span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
