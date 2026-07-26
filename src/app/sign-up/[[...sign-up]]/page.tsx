import { SignUp } from "@clerk/nextjs"
import { AuthShell } from '@/components/auth-shell'

export default function SignUpPage() {
  return (
    <AuthShell
      title="Crie sua conta"
      description="Comece com uma visão clara das suas finanças e construa seus próximos objetivos."
    >
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              cardBox: "w-full",
              card: "w-full shadow-xl",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
        />
    </AuthShell>
  )
}
