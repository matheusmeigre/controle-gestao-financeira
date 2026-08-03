import type { PropsWithChildren } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export function MobileScreen({
  eyebrow,
  title,
  description,
  children,
  actionLabel,
  onActionPress,
  refreshing = false,
  onRefresh,
}: PropsWithChildren<{
  eyebrow: string
  title: string
  description?: string
  actionLabel?: string
  onActionPress?: () => void
  refreshing?: boolean
  onRefresh?: () => void
}>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60a5fa" /> : undefined}
        >
          <Text accessibilityRole="text" style={styles.eyebrow}>{eyebrow}</Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {actionLabel && onActionPress ? (
            <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onActionPress} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </Pressable>
          ) : null}
          <View style={styles.section}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export function InfoCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'danger' | 'success' | 'muted' }) {
  return (
    <View accessibilityRole="summary" style={[styles.card, tone === 'danger' ? styles.cardDanger : null, tone === 'success' ? styles.cardSuccess : null, tone === 'muted' ? styles.cardMuted : null]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
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
    minHeight: 48,
    justifyContent: 'center',
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
  cardDanger: {
    borderColor: '#7f1d1d',
  },
  cardSuccess: {
    borderColor: '#166534',
  },
  cardMuted: {
    opacity: 0.85,
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
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
})
