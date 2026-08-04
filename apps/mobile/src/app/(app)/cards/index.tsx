import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useCardsQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney } from '../../../lib/mobile-ui'

export default function CardsScreen() {
  const query = useCardsQuery(true)
  const cards = query.data ?? []

  return (
    <MobileScreen eyebrow="Area principal" title="Cartoes" description="Area inicial de cartoes com navegacao para detalhe e formulario." actionLabel="Novo cartao" onActionPress={() => router.push('/(app)/cards/new')}>
      {cards.map((card) => (
        <Pressable key={card.id} onPress={() => router.push(`/(app)/cards/${card.id}`)} style={styles.cardButton}>
          <InfoCard label={card.nickname} value={`${card.bankName} • ${card.brand} • Final ${card.last4Digits}${card.creditLimit ? ` • ${formatMoney(card.creditLimit)}` : ''}`} />
        </Pressable>
      ))}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({ cardButton: { borderRadius: 16 } })
