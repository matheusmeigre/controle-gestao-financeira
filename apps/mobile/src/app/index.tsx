import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { FullScreenState } from '../providers/app-provider'

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <FullScreenState title="Iniciando app" description="Verificando se existe uma sessao valida para este dispositivo." />
  }

  if (isSignedIn) {
    return <Redirect href="/(app)" />
  }

  return <Redirect href="/(auth)/sign-in" />
}
