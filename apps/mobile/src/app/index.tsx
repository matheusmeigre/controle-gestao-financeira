import { useMemo } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { createMobileAppApiClient, resolveMobileApiBaseUrl } from '../lib/api'
import { getMobileEnvironment } from '../lib/env'

export default function HomeScreen() {
  const environment = useMemo(() => getMobileEnvironment(), [])
  const apiBaseUrl = useMemo(() => resolveMobileApiBaseUrl(environment), [environment])
  const client = useMemo(() => createMobileAppApiClient(environment), [environment])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TODO 1 • Runtime Mobile</Text>
        <Text style={styles.title}>Expo + React Native inicializados com sucesso</Text>
        <Text style={styles.description}>
          A fundacao mobile agora sobe com Expo Router e resolve o cliente tipado da API v1 sem depender da interface web.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>API base URL</Text>
          <Text style={styles.cardValue}>{apiBaseUrl}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Cliente compartilhado</Text>
          <Text style={styles.cardValue}>{typeof client.getBootstrap === 'function' ? 'Conectado ao @api-client' : 'Indisponivel'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '500',
  },
})
