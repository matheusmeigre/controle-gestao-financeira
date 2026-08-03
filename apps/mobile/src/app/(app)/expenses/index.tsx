import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useExpensesQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney } from '../../../lib/mobile-ui'

export default function ExpensesScreen() {
  const query = useExpensesQuery()
  const expenses = query.data ?? []

  return (
    <MobileScreen eyebrow="Area principal" title="Despesas" description="Lista inicial de despesas sincronizadas no bootstrap." actionLabel="Novo formulario" onActionPress={() => router.push('/(app)/expenses/new')}>
      {expenses.map((expense) => (
        <Pressable key={expense.id} onPress={() => router.push(`/(app)/expenses/${expense.id}`)} style={styles.cardButton}>
          <InfoCard label={expense.description} value={`${expense.category} • ${expense.date} • ${formatMoney(expense.amount)}`} />
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
