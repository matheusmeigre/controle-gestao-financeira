import type { PropsWithChildren } from 'react'
import { ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/clerk-expo'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { resolveExpoPublicClerkPublishableKey } from '../lib/env'
import { tokenCache } from '../lib/auth/token-cache'

const publishableKey = resolveExpoPublicClerkPublishableKey()

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoading>
        <FullScreenState title="Carregando sessao" description="Restaurando suas credenciais com armazenamento seguro." />
      </ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
    </ClerkProvider>
  )
}

export function FullScreenState({ title, description }: { title: string; description: string }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
})
