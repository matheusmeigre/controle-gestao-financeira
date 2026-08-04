import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Tabs, type ErrorBoundaryProps } from 'expo-router'
import { FullScreenState } from '../../providers/app-provider'
import { MobileBootstrapProvider } from '../../providers/mobile-bootstrap-provider'
import { MobileErrorFallback } from '../../components/mobile-error-fallback'
import { MobileConnectivityBanner } from '../../components/mobile-connectivity-banner'

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <FullScreenState title="Validando acesso" description="Confirmando se sua sessao ainda e valida." />
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return (
    <MobileBootstrapProvider>
      <MobileConnectivityBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#020617',
            borderTopColor: '#1e293b',
          },
          tabBarActiveTintColor: '#60a5fa',
          tabBarInactiveTintColor: '#64748b',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
        <Tabs.Screen name="expenses" options={{ title: 'Despesas' }} />
        <Tabs.Screen name="incomes" options={{ title: 'Receitas' }} />
        <Tabs.Screen name="cards" options={{ title: 'Cartoes' }} />
        <Tabs.Screen name="invoices" options={{ title: 'Faturas' }} />
        <Tabs.Screen name="plannings" options={{ title: 'Planos' }} />
      </Tabs>
    </MobileBootstrapProvider>
  )
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <MobileErrorFallback error={props.error} retry={props.retry} />
}
