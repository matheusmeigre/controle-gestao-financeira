import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

export function MobileErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Algo falhou durante a inicializacao</Text>
        <Text style={styles.description}>{error.message}</Text>
        <Pressable onPress={retry} style={styles.button}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
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
    gap: 16,
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
  button: {
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
