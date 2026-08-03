import type { PropsWithChildren } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

export function MobileScreen({ eyebrow, title, description, children, actionLabel, onActionPress }: PropsWithChildren<{ eyebrow: string; title: string; description?: string; actionLabel?: string; onActionPress?: () => void }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        <View style={styles.section}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  )
}

export function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
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
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0b6fe8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#eff6ff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    gap: 12,
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
    color: '#f8fafc',
    fontSize: 16,
    lineHeight: 24,
  },
})
