import { useAuth, useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useMobileBootstrap } from '../../providers/mobile-bootstrap-provider'

export default function AppHomeScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { state, retry } = useMobileBootstrap()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TODO 3 • Shell e Navegacao</Text>
        <Text style={styles.title}>Dashboard mobile</Text>
        <Text style={styles.description}>
          {user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'Usuario autenticado'}
        </Text>

        {state.loading ? (
          <Card label="Bootstrap" value="Carregando areas principais do app..." />
        ) : state.error ? (
          <>
            <Card label="Falha no bootstrap" value={state.error} tone="danger" />
            <Pressable onPress={() => void retry()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Card label="Usuario API" value={state.data?.me.id ?? '-'} />
            <Card label="Periodo atual" value={state.data?.bootstrap.currentPeriod.yearMonth ?? '-'} />
            <Card label="Resumo" value={`Despesas ${state.data?.expenses.length ?? 0} • Receitas ${state.data?.incomes.length ?? 0} • Cartoes ${state.data?.cards.length ?? 0}`} />
            <QuickActions />
          </>
        )}

        <Pressable onPress={() => void signOut()} style={styles.button}>
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function QuickActions() {
  return (
    <View style={styles.quickActions}>
      <QuickAction label="Despesas" onPress={() => router.push('/(app)/expenses')} />
      <QuickAction label="Receitas" onPress={() => router.push('/(app)/incomes')} />
      <QuickAction label="Cartoes" onPress={() => router.push('/(app)/cards')} />
      <QuickAction label="Faturas" onPress={() => router.push('/(app)/invoices')} />
      <QuickAction label="Planos" onPress={() => router.push('/(app)/plannings')} />
    </View>
  )
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
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
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#334155',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActionText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
})
