import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'
import { FullScreenState } from '../../providers/app-provider'

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <FullScreenState title="Preparando login" description="Aguarde enquanto o fluxo de autenticacao e inicializado." />
  }

  if (isSignedIn) {
    return <Redirect href="/(app)" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
