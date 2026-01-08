"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TermsOfUse } from "@/components/terms-of-use"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { ScrollText, Shield } from "lucide-react"

interface TermsAcceptanceModalProps {
  onAccept: () => void
}

export function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const [hasScrolledTermsToEnd, setHasScrolledTermsToEnd] = useState(false)
  const [hasScrolledPrivacyToEnd, setHasScrolledPrivacyToEnd] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")
  const termsScrollRef = useRef<HTMLDivElement>(null)
  const privacyScrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    // Save original body overflow
    const originalOverflow = document.body.style.overflow
    
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    
    // Restore on unmount
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Detect scroll to bottom for Terms
  useEffect(() => {
    const scrollElement = termsScrollRef.current
    
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
      
      if (isAtBottom && !hasScrolledTermsToEnd) {
        setHasScrolledTermsToEnd(true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    // Check initial state
    handleScroll()

    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [hasScrolledTermsToEnd])

  // Detect scroll to bottom for Privacy
  useEffect(() => {
    const scrollElement = privacyScrollRef.current
    
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
      
      if (isAtBottom && !hasScrolledPrivacyToEnd) {
        setHasScrolledPrivacyToEnd(true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    // Check initial state
    handleScroll()

    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [hasScrolledPrivacyToEnd])

  const currentTabScrolled = activeTab === "terms" ? hasScrolledTermsToEnd : hasScrolledPrivacyToEnd
  const canAccept = hasScrolledTermsToEnd && hasScrolledPrivacyToEnd && acceptedTerms && acceptedPrivacy

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b flex-shrink-0 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Termos de Uso e Privacidade
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Antes de continuar, leia completamente ambos os documentos e role até o final de cada um.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "terms" | "privacy")} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none px-4 pt-2 pb-0 bg-transparent h-auto border-b">
              <TabsTrigger 
                value="terms" 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm pb-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
              >
                <ScrollText className="h-4 w-4" />
                <span>Termos de Uso</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center justify-center gap-2 text-xs sm:text-sm pb-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Política de Privacidade</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="terms" className="h-full m-0 p-0 data-[state=active]:block">
                <div 
                  ref={termsScrollRef} 
                  className="h-full overflow-y-scroll pr-2 terms-scroll"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(203 213 225) transparent'
                  }}
                >
                  <TermsOfUse />
                </div>
                {!hasScrolledTermsToEnd && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none flex items-end justify-center pb-4">
                    <p className="text-xs sm:text-sm font-medium text-primary animate-pulse bg-background/90 px-4 py-2 rounded-full border border-primary/20">
                      ↓ Role até o final para continuar ↓
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="privacy" className="h-full m-0 p-0 data-[state=active]:block">
                <div 
                  ref={privacyScrollRef} 
                  className="h-full overflow-y-scroll pr-2 terms-scroll"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(203 213 225) transparent'
                  }}
                >
                  <PrivacyPolicy />
                </div>
                {!hasScrolledPrivacyToEnd && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none flex items-end justify-center pb-4">
                    <p className="text-xs sm:text-sm font-medium text-primary animate-pulse bg-background/90 px-4 py-2 rounded-full border border-primary/20">
                      ↓ Role até o final para continuar ↓
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="border-t p-4 sm:p-6 space-y-4 flex-shrink-0 bg-muted/30">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-background border">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={!hasScrolledTermsToEnd}
                className="mt-0.5"
              />
              <label
                htmlFor="accept-terms"
                className={`text-sm leading-relaxed ${!hasScrolledTermsToEnd ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer text-foreground'}`}
              >
                Li e aceito os <span className="font-semibold">Termos de Uso</span> do Meu Controle Financeiro
                {hasScrolledTermsToEnd && <span className="text-green-600 ml-2">✓</span>}
              </label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-background border">
              <Checkbox
                id="accept-privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                disabled={!hasScrolledPrivacyToEnd}
                className="mt-0.5"
              />
              <label
                htmlFor="accept-privacy"
                className={`text-sm leading-relaxed ${!hasScrolledPrivacyToEnd ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer text-foreground'}`}
              >
                Li e aceito a <span className="font-semibold">Política de Privacidade</span> e consinto com o tratamento dos meus dados conforme descrito
                {hasScrolledPrivacyToEnd && <span className="text-green-600 ml-2">✓</span>}
              </label>
            </div>
          </div>

          {(!hasScrolledTermsToEnd || !hasScrolledPrivacyToEnd) && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900">
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                ⚠️ Você precisa rolar até o final de <span className="font-bold">ambos</span> os documentos:
              </p>
              <ul className="text-xs text-amber-600 dark:text-amber-500 mt-2 ml-4 space-y-1">
                <li className="flex items-center gap-2">
                  {hasScrolledTermsToEnd ? "✓" : "○"} Termos de Uso {!hasScrolledTermsToEnd && "(role até o final)"}
                </li>
                <li className="flex items-center gap-2">
                  {hasScrolledPrivacyToEnd ? "✓" : "○"} Política de Privacidade {!hasScrolledPrivacyToEnd && "(role até o final)"}
                </li>
              </ul>
            </div>
          )}

          <Button
            onClick={onAccept}
            disabled={!canAccept}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-6 text-base transition-all"
          >
            {canAccept ? "Aceitar e Continuar" : "Leia e role ambos os documentos até o final"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao aceitar, você concorda com nossos termos e reconhece ter lido nossa política de privacidade
          </p>
        </div>
      </Card>
    </div>
  )
}
