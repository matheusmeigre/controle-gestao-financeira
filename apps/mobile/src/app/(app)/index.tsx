import { useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MobileApiClientError } from '@api-client'
import type { MobileBootstrapSession } from '@api-client'
import { useMobileApi } from '../../hooks/use-mobile-api'

export default function AppHomeScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const api = useMobileApi()
  const [state, setState] = useState<{ data?: MobileBootstrapSession; error?: string; loading: boolean }>({ loading: true })

  useEffect(() => {
    let active = true

    setState({ loading: true })

    api.bootstrapSession()
      .then((data) => {
        if (active) {
          setState({ data, loading: false })
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        const message = error instanceof MobileApiClientError
          ? error.problem?.detail ?? error.message
          : 'Nao foi possivel carregar a sessao mobile.'

        setState({ error: message, loading: false })
      })

    return () => {
      active = false
    }
  }, [api])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TODO 2 • Autenticacao Mobile</Text>
        <Text style={styles.title}>Sessao autenticada no dispositivo</Text>
        <Text style={styles.description}>
          {user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'Usuario autenticado'}
        </Text>

        {state.loading ? (
          <Card label="Bootstrap" value="Carregando dados autenticados da API v1..." />
        ) : state.error ? (
          <Card label="Erro de autenticacao" value={state.error} tone="danger" />
        ) : (
          <>
            <Card label="Usuario API" value={state.data?.me.id ?? '-'} />
            <Card label="Periodo atual" value={state.data?.bootstrap.currentPeriod.yearMonth ?? '-'} />
            <Card label="Resumo" value={`Despesas ${state.data?.expenses.length ?? 0} • Receitas ${state.data?.incomes.length ?? 0} • Cartoes ${state.data?.cards.length ?? 0}`} />
          </>
        )}

        <Pressable onPress={() => void signOut()} style={styles.button}>
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Card({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'danger' }) {
  return (
    <View style={[styles.card, tone === 'danger' ? styles.cardDanger : null]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flexGrow: 1,
    gap: 16,
    justifyContent: 'center',
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
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardDanger: {
    borderColor: '#7f1d1d',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#f8fafc',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0b6fe8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#eff6ff',
    fontSize: 16,
    fontWeight: '700',
  },
})
