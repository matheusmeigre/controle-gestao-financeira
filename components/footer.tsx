"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TermsOfUse } from "@/components/terms-of-use"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { ScrollText, Shield, X } from "lucide-react"

export function Footer() {
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")

  return (
    <>
      <footer className="mt-12 py-6 border-t bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © 2026 <span className="font-semibold">Meu Controle Financeiro</span>. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Desenvolvido por Matheus Meigre
              </p>
            </div>
            
            <Button
              variant="link"
              onClick={() => setShowTermsModal(true)}
              className="text-sm text-primary hover:underline flex items-center gap-1.5"
            >
              <Shield className="h-4 w-4" />
              Termos de Uso e Privacidade
            </Button>
          </div>
        </div>
      </footer>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <Card className="flex flex-col shadow-2xl max-h-[90vh]">
              <CardHeader className="border-b flex-shrink-0 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Termos de Uso e Privacidade
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTermsModal(false)}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consulte nossos termos de uso e política de privacidade.
                </p>
              </CardHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(v) => setActiveTab(v as "terms" | "privacy")} 
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-none border-b shrink-0 mx-4 mt-4">
                    <TabsTrigger value="terms" className="flex items-center gap-2 text-xs sm:text-sm">
                      <ScrollText className="h-4 w-4" />
                      <span>Termos de Uso</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs sm:text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Política de Privacidade</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    <TabsContent 
                      value="terms" 
                      className="h-full m-0 p-6 focus-visible:outline-none"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgb(203 213 225) transparent'
                      }}
                    >
                      <TermsOfUse />
                    </TabsContent>

                    <TabsContent 
                      value="privacy" 
                      className="h-full m-0 p-6 focus-visible:outline-none"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgb(203 213 225) transparent'
                      }}
                    >
                      <PrivacyPolicy />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              <div className="border-t p-4 flex-shrink-0 bg-muted/20">
                <Button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Fechar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
