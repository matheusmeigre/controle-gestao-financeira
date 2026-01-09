"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TermsOfUse } from "@/components/terms-of-use"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { Shield, AlertCircle } from "lucide-react"

interface TermsAcceptanceModalProps {
  onAccept: () => void
}

export function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Detect scroll to bottom
  useEffect(() => {
    const scrollElement = scrollContainerRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20
      
      if (isAtBottom && !hasScrolledToEnd) {
        setHasScrolledToEnd(true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [hasScrolledToEnd])

  const canAccept = hasScrolledToEnd && acceptedTerms && acceptedPrivacy


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="shrink-0 pb-4 space-y-2 border-b">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Termos de Uso e Política de Privacidade
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Leia atentamente todo o documento e role até o final para aceitar.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-scroll p-6 terms-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(203 213 225) transparent'
            }}
          >
            <div className="max-w-4xl mx-auto space-y-12">
              <TermsOfUse />
              
              <div className="border-t-2 border-primary/20 my-8" />
              
              <PrivacyPolicy />
            </div>
          </div>

          {!hasScrolledToEnd && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex items-end justify-center pb-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary animate-pulse bg-background/95 px-6 py-3 rounded-full border-2 border-primary/30 shadow-lg">
                <AlertCircle className="h-5 w-5" />
                <span>Role até o final para continuar</span>
              </div>
            </div>
          )}
        </CardContent>

        <div className="shrink-0 border-t p-6 space-y-4 bg-muted/30">
          {!hasScrolledToEnd && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                  Você precisa rolar até o final do documento para habilitar as opções de aceite.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-background border-2 transition-colors hover:border-primary/20">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={!hasScrolledToEnd}
                className="mt-1"
              />
              <label
                htmlFor="accept-terms"
                className={`text-sm leading-relaxed select-none ${!hasScrolledToEnd ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer text-foreground'}`}
              >
                Li e aceito os <span className="font-semibold">Termos de Uso</span> do Meu Controle Financeiro
              </label>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-background border-2 transition-colors hover:border-primary/20">
              <Checkbox
                id="accept-privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                disabled={!hasScrolledToEnd}
                className="mt-1"
              />
              <label
                htmlFor="accept-privacy"
                className={`text-sm leading-relaxed select-none ${!hasScrolledToEnd ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer text-foreground'}`}
              >
                Li e aceito a <span className="font-semibold">Política de Privacidade</span> e consinto com o tratamento dos meus dados conforme descrito
              </label>
            </div>
          </div>

          <Button
            onClick={onAccept}
            disabled={!canAccept}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-6 text-base transition-all"
          >
            {canAccept ? "✓ Aceitar e Continuar" : "Complete a leitura para continuar"}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Ao aceitar, você concorda com nossos termos e reconhece ter lido nossa política de privacidade
          </p>
        </div>
      </Card>
    </div>
  )
}
