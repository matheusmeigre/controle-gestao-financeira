"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Carregando tema">
        <Monitor aria-hidden="true" />
      </Button>
    )
  }

  const themes = ["system", "light", "dark"] as const
  const nextTheme = themes[(themes.indexOf(theme as (typeof themes)[number]) + 1) % themes.length]
  const labels = {
    system: "Tema do sistema",
    light: "Tema claro",
    dark: "Tema escuro",
  }
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={`${labels[theme as keyof typeof labels]}. Alternar tema`}
      title={`${labels[theme as keyof typeof labels]}. Clique para alternar.`}
    >
      <Icon aria-hidden="true" />
    </Button>
  )
}
