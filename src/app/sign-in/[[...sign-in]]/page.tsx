import { SignIn } from "@clerk/nextjs"
import { AuthShell } from '@/components/auth-shell'

export default function SignInPage() {
  return (
    <AuthShell
      title="Boas-vindas de volta"
      description="Entre na sua conta para continuar acompanhando seus objetivos e compromissos."
    >
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              cardBox: "w-full",
              card: "w-full shadow-xl",
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/"
        />
    </AuthShell>
  )
}
