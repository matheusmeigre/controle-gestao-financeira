"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function UserHeader() {
  const { user } = useUser()

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0]}
              </p>
              <p className="text-xs text-slate-500">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard: "shadow-xl",
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
