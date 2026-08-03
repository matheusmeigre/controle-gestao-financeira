import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'
import { FullScreenState } from '../../providers/app-provider'

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <FullScreenState title="Validando acesso" description="Confirmando se sua sessao ainda e valida." />
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
