import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { ThemeProvider } from "@/components/theme-provider"
import { BalanceVisibilityProvider } from "@/components/balance/balance-visibility"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Minha Gestão Financeira",
    template: "%s | Minha Gestão Financeira",
  },
  description: "Aplicativo pessoal para controle de gastos mensais e gestão de faturas de cartão",
  applicationName: "Minha Gestão Financeira",
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon-1024x1024.png",
  },
  openGraph: {
    title: "Minha Gestão Financeira",
    description: "Aplicativo pessoal para controle de gastos mensais e gestão de faturas de cartão",
    images: [
      {
        url: "/minhagestaofinanceira-icon.png",
        width: 1254,
        height: 1254,
        alt: "Minha Gestão Financeira",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in" localization={ptBR} appearance={{
      variables: { colorPrimary: '#0b6fe8', borderRadius: '0.75rem' },
      elements: {
        formButtonPrimary: 'bg-primary hover:bg-primary/90',
        card: 'shadow-xl rounded-2xl border border-border'
      }
    }}>
      <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BalanceVisibilityProvider>
              <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>{children}</Suspense>
              <Toaster />
              <Analytics />
            </BalanceVisibilityProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
