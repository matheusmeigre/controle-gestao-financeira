import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { usePlanningsQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney } from '../../../lib/mobile-ui'

export default function PlanningsScreen() {
  const query = usePlanningsQuery()
  const plannings = query.data ?? []

  return (
    <MobileScreen eyebrow="Area principal" title="Planejamentos" description="Area de planejamentos com resumo inicial e navegacao para detalhe e formulario." actionLabel="Novo planejamento" onActionPress={() => router.push('/(app)/plannings/new')}>
      {plannings.map((planning) => (
        <Pressable key={planning.id} onPress={() => router.push(`/(app)/plannings/${planning.id}`)} style={styles.cardButton}>
          <InfoCard label={planning.name} value={`${planning.status} • ${planning.riskLevel} • ${formatMoney(planning.currentAmount)} de ${formatMoney(planning.targetAmount)}`} />
        </Pressable>
      ))}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({ cardButton: { borderRadius: 16 } })
