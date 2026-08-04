import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useIncomesQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney } from '../../../lib/mobile-ui'

export default function IncomesScreen() {
  const query = useIncomesQuery()
  const incomes = query.data ?? []

  return (
    <MobileScreen eyebrow="Area principal" title="Receitas" description="Lista inicial de receitas carregadas no shell autenticado." actionLabel="Novo formulario" onActionPress={() => router.push('/(app)/incomes/new')}>
      {incomes.map((income) => (
        <Pressable key={income.id} onPress={() => router.push(`/(app)/incomes/${income.id}`)} style={styles.cardButton}>
          <InfoCard label={income.description} value={`${income.type} • ${income.date} • ${formatMoney(income.amount)}`} />
        </Pressable>
      ))}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  cardButton: {
    borderRadius: 16,
  },
})
