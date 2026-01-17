"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react"

interface WelcomeModalProps {
  userName: string
  onClose: () => void
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Anima a entrada do modal
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="mx-4 max-w-lg shadow-2xl animate-in zoom-in duration-300">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Bem-vindo(a), {userName}! 🎉
          </CardTitle>
          <CardDescription className="text-base">
            Sua conta foi criada com sucesso. Agora seus dados estão completamente privados e seguros.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Dados Segregados</p>
                <p className="text-xs text-slate-600">
                  Suas finanças são isoladas. Ninguém mais pode ver ou editar seus registros.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Sincronização Automática</p>
                <p className="text-xs text-slate-600">
                  Faça login em qualquer dispositivo e seus dados estarão lá.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Comece Agora</p>
                <p className="text-xs text-slate-600">
                  Adicione sua primeira despesa, receita ou fatura de cartão nas abas abaixo.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Começar a Usar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
