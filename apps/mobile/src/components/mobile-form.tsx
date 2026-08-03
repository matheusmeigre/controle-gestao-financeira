import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export function FormField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address' | 'numeric' }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

export function SubmitButton({ label, onPress, loading = false, tone = 'primary' }: { label: string; onPress: () => void; loading?: boolean; tone?: 'primary' | 'danger' }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, tone === 'danger' ? styles.buttonDanger : null]}>
      {loading ? <ActivityIndicator color="#eff6ff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  )
}

export function FeedbackText({ message, tone = 'error' }: { message?: string | null; tone?: 'error' | 'success' }) {
  if (!message) {
    return null
  }

  return <Text style={[styles.feedback, tone === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>{message}</Text>
}

const styles = StyleSheet.create({
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    color: '#f8fafc',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0b6fe8',
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonDanger: {
    backgroundColor: '#b91c1c',
  },
  buttonText: {
    color: '#eff6ff',
    fontSize: 16,
    fontWeight: '700',
  },
  feedback: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackError: {
    color: '#fca5a5',
  },
  feedbackSuccess: {
    color: '#86efac',
  },
})
