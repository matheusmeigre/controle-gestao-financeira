"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TermsOfUse } from "@/components/terms-of-use"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { ScrollText, Shield, CheckCircle2 } from "lucide-react"

interface TermsAcceptanceModalProps {
  onAccept: () => void
}

export function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll detection when tab changes
  useEffect(() => {
    setHasScrolledToEnd(false)
  }, [activeTab])

  // Detect scroll to bottom
  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
      
      if (isAtBottom && !hasScrolledToEnd) {
        setHasScrolledToEnd(true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    // Check initial state (for short content)
    handleScroll()

    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [activeTab, hasScrolledToEnd])

  const canAccept = hasScrolledToEnd && acceptedTerms && acceptedPrivacy

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Termos de Uso e Privacidade
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Antes de continuar, leia e aceite nossos termos e política de privacidade.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "terms" | "privacy")} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b px-4 pt-4">
              <TabsTrigger value="terms" className="flex items-center gap-2 text-xs sm:text-sm">
                <ScrollText className="h-4 w-4" />
                <span>Termos de Uso</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs sm:text-sm">
                <Shield className="h-4 w-4" />
                <span>Política de Privacidade</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="terms" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div ref={scrollRef} className="flex-1 overflow-hidden">
                  <TermsOfUse />
                </div>
                {!hasScrolledToEnd && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-4">
                    <p className="text-xs font-medium text-primary animate-pulse">
                      ↓ Role até o final para continuar ↓
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="privacy" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div ref={scrollRef} className="flex-1 overflow-hidden">
                  <PrivacyPolicy />
                </div>
                {!hasScrolledToEnd && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-4">
                    <p className="text-xs font-medium text-primary animate-pulse">
                      ↓ Role até o final para continuar ↓
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="border-t p-4 sm:p-6 space-y-4 flex-shrink-0">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={!hasScrolledToEnd}
                className="mt-0.5"
              />
              <label
                htmlFor="accept-terms"
                className={`text-sm leading-relaxed ${!hasScrolledToEnd ? 'text-muted-foreground' : 'cursor-pointer'}`}
              >
                Li e aceito os <span className="font-semibold">Termos de Uso</span> do Meu Controle Financeiro
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                disabled={!hasScrolledToEnd}
                className="mt-0.5"
              />
              <label
                htmlFor="accept-privacy"
                className={`text-sm leading-relaxed ${!hasScrolledToEnd ? 'text-muted-foreground' : 'cursor-pointer'}`}
              >
                Li e aceito a <span className="font-semibold">Política de Privacidade</span> e consinto com o tratamento dos meus dados conforme descrito
              </label>
            </div>
          </div>

          {!hasScrolledToEnd && (
            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900">
              ⚠️ Role até o final do documento ativo para habilitar os checkboxes de aceite.
            </p>
          )}

          <Button
            onClick={onAccept}
            disabled={!canAccept}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {canAccept ? "Aceitar e Continuar" : "Leia os documentos para continuar"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao aceitar, você concorda com nossos termos e reconhece ter lido nossa política de privacidade
          </p>
        </div>
      </Card>
    </div>
  )
}
