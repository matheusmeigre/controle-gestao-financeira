"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
          <Sun className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setTheme("light")}
        title="Tema claro"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setTheme("dark")}
        title="Tema escuro"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setTheme("system")}
        title="Seguir sistema"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )
}
