import { router } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useInvoicesQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney } from '../../../lib/mobile-ui'

export default function InvoicesScreen() {
  const query = useInvoicesQuery()
  const invoices = query.data ?? []

  return (
    <MobileScreen eyebrow="Area principal" title="Faturas" description="Lista inicial de faturas para navegacao mobile." actionLabel="Nova fatura" onActionPress={() => router.push('/(app)/invoices/new')}>
      <Pressable onPress={() => router.push('/(app)/invoices/import')} style={styles.cardButton}>
        <InfoCard label="Importar fatura" value="Selecione PDF, CSV, OFX ou QFX e gere um preview antes da persistencia." />
      </Pressable>
      {invoices.map((invoice) => (
        <Pressable key={invoice.id} onPress={() => router.push(`/(app)/invoices/${invoice.id}`)} style={styles.cardButton}>
          <InfoCard label={`${invoice.month}/${invoice.year}`} value={`Total ${formatMoney(invoice.totalAmount)} • Pago ${invoice.isPaid ? 'Sim' : 'Nao'} • Itens ${invoice.items.length}`} />
        </Pressable>
      ))}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({ cardButton: { borderRadius: 16 } })
