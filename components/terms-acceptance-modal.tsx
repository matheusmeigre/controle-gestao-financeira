"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TermsOfUse } from "@/components/terms-of-use"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { Shield, AlertCircle, ScrollText, FileText, X, Check } from "lucide-react"

interface TermsAcceptanceModalProps {
  onAccept: () => void
}

// Modal interno para exibir documentos
function DocumentModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  onReadComplete 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onReadComplete: () => void
}) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setHasScrolledToEnd(false)
      return
    }

    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20
      
      if (isAtBottom && !hasScrolledToEnd) {
        setHasScrolledToEnd(true)
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [isOpen, hasScrolledToEnd])

  const handleConfirm = () => {
    if (hasScrolledToEnd) {
      onReadComplete()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 flex flex-col shadow-2xl relative">
        <CardHeader className="shrink-0 pb-4 space-y-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Role até o final do documento para poder confirmar a leitura.
          </p>
        </CardHeader>

        <CardContent className="overflow-hidden p-0 relative" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <div 
            ref={scrollRef}
            className="h-full overflow-y-scroll p-6 terms-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(203 213 225) transparent'
            }}
          >
            {children}
          </div>

          {!hasScrolledToEnd && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none flex items-end justify-center pb-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary animate-pulse bg-background px-6 py-3 rounded-full border-2 border-primary/30 shadow-lg">
                <AlertCircle className="h-5 w-5" />
                <span>Role até o final para continuar</span>
              </div>
            </div>
          )}
        </CardContent>

        <div className="shrink-0 border-t p-4 bg-muted/30 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasScrolledToEnd}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {hasScrolledToEnd ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmar Leitura
              </>
            ) : (
              "Role até o final"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const canAccept = hasReadTerms && hasReadPrivacy && acceptedTerms && acceptedPrivacy


  return (
    <>
      <DocumentModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Termos de Uso"
        onReadComplete={() => setHasReadTerms(true)}
      >
        <TermsOfUse />
      </DocumentModal>

      <DocumentModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Política de Privacidade"
        onReadComplete={() => setHasReadPrivacy(true)}
      >
        <PrivacyPolicy />
      </DocumentModal>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        <Card className="w-full max-w-3xl my-8 flex flex-col shadow-2xl relative">
          <CardHeader className="shrink-0 pb-4 space-y-2 border-b">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Termos de Uso e Política de Privacidade
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Clique nos botões abaixo para ler cada documento. É necessário ler ambos completamente.
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Obrigatórios
                </h3>
                <p className="text-sm text-muted-foreground">
                  Para continuar utilizando o aplicativo, você deve ler e aceitar os seguintes documentos:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className={`p-4 border-2 transition-all ${hasReadTerms ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'}`}>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <ScrollText className={`h-8 w-8 ${hasReadTerms ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <div>
                        <h4 className="font-semibold">Termos de Uso</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Condições de uso do aplicativo
                        </p>
                      </div>
                      {hasReadTerms ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <Check className="h-4 w-4" />
                          Leitura confirmada
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowTermsModal(true)}
                          className="w-full"
                          variant="outline"
                        >
                          <ScrollText className="h-4 w-4 mr-2" />
                          Ler Documento
                        </Button>
                      )}
                    </div>
                  </Card>

                  <Card className={`p-4 border-2 transition-all ${hasReadPrivacy ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'}`}>
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Shield className={`h-8 w-8 ${hasReadPrivacy ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <div>
                        <h4 className="font-semibold">Política de Privacidade</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Como tratamos seus dados
                        </p>
                      </div>
                      {hasReadPrivacy ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <Check className="h-4 w-4" />
                          Leitura confirmada
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowPrivacyModal(true)}
                          className="w-full"
                          variant="outline"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Ler Documento
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {(!hasReadTerms || !hasReadPrivacy) && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                      Você precisa ler ambos os documentos completamente antes de aceitar.
                    </p>
                    <ul className="text-xs text-amber-600 dark:text-amber-500 mt-2 space-y-1">
                      <li className="flex items-center gap-2">
                        {hasReadTerms ? "✓" : "○"} Termos de Uso {!hasReadTerms && "(clique para ler)"}
                      </li>
                      <li className="flex items-center gap-2">
                        {hasReadPrivacy ? "✓" : "○"} Política de Privacidade {!hasReadPrivacy && "(clique para ler)"}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {hasReadTerms && hasReadPrivacy && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Confirmação de Aceite</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-background border-2 transition-colors hover:border-primary/20">
                      <Checkbox
                        id="accept-terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <label
                        htmlFor="accept-terms"
                        className="text-sm leading-relaxed cursor-pointer select-none"
                      >
                        Li e aceito os <span className="font-semibold">Termos de Uso</span> do Meu Controle Financeiro
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-background border-2 transition-colors hover:border-primary/20">
                      <Checkbox
                        id="accept-privacy"
                        checked={acceptedPrivacy}
                        onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                        className="mt-1"
                      />
                      <label
                        htmlFor="accept-privacy"
                        className="text-sm leading-relaxed cursor-pointer select-none"
                      >
                        Li e aceito a <span className="font-semibold">Política de Privacidade</span> e consinto com o tratamento dos meus dados conforme descrito
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <div className="shrink-0 border-t p-6 space-y-4 bg-muted/30">
            <Button
              onClick={onAccept}
              disabled={!canAccept}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-6 text-base transition-all"
            >
              {canAccept ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Aceitar e Continuar
                </>
              ) : (
                "Leia os documentos para continuar"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao aceitar, você concorda com nossos termos e reconhece ter lido nossa política de privacidade
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
