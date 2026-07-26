"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface WelcomeModalProps {
  userName: string
  onClose: () => void
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7" aria-hidden="true" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Bem-vindo(a), {userName}!
          </DialogTitle>
          <DialogDescription className="text-base">
            Sua conta foi criada com sucesso. Agora seus dados estão completamente privados e seguros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
               <Shield className="mt-0.5 size-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-medium text-sm">Dados Segregados</p>
                <p className="text-xs text-muted-foreground">
                  Suas finanças são isoladas. Ninguém mais pode ver ou editar seus registros.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
               <TrendingUp className="mt-0.5 size-5 flex-shrink-0 text-success" />
              <div>
                <p className="font-medium text-sm">Sincronização Automática</p>
                <p className="text-xs text-muted-foreground">
                  Faça login em qualquer dispositivo e seus dados estarão lá.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
               <Zap className="mt-0.5 size-5 flex-shrink-0 text-warning" />
              <div>
                <p className="font-medium text-sm">Comece Agora</p>
                <p className="text-xs text-muted-foreground">
                  Adicione sua primeira despesa, receita ou fatura de cartão nas abas abaixo.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full"
          >
            Começar a Usar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
