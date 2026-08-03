import { useSignIn } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'

export default function SignInScreen() {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!isLoaded) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await signIn.create({ identifier, password })

      if (result.status !== 'complete') {
        setError('A autenticacao exige uma etapa adicional que ainda nao foi habilitada neste fluxo mobile.')
        return
      }

      await setActive({ session: result.createdSessionId })
      router.replace('/(app)')
    } catch (caughtError: unknown) {
      const firstError = typeof caughtError === 'object' && caughtError && 'errors' in caughtError
        ? (caughtError as { errors?: { longMessage?: string; message?: string }[] }).errors?.[0]
        : undefined

      setError(firstError?.longMessage ?? firstError?.message ?? 'Nao foi possivel autenticar com as credenciais informadas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Login seguro</Text>
        <Text style={styles.title}>Entre na sua conta</Text>
        <Text style={styles.description}>A sessao sera restaurada automaticamente com armazenamento seguro no dispositivo.</Text>

        <View style={styles.form}>
          <Field label="E-mail" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable disabled={submitting || !isLoaded} onPress={() => void handleSubmit()} style={[styles.button, submitting ? styles.buttonDisabled : null]}>
            {submitting ? <ActivityIndicator color="#eff6ff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; keyboardType?: 'default' | 'email-address' }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        autoCapitalize={props.autoCapitalize}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
        value={props.value}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
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
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 14,
    marginTop: 8,
  },
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
  error: {
    color: '#fca5a5',
    fontSize: 14,
    lineHeight: 20,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#eff6ff',
    fontSize: 16,
    fontWeight: '700',
  },
})
