import { StyleSheet, Text, View } from 'react-native'
import { useConnectivity } from '../hooks/use-connectivity'

export function MobileConnectivityBanner() {
  const { isOnline } = useConnectivity()

  if (isOnline) {
    return null
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Voce esta offline. O app exibira cache local e tentara sincronizar quando a conexao voltar.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#7c2d12',
    borderBottomColor: '#9a3412',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: '#ffedd5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
})
