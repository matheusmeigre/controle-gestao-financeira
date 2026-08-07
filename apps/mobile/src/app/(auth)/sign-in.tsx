import { useSignIn, useSSO } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

type SignInStep = 'identifier' | 'password' | 'verify'

export default function SignInScreen() {
  const { isLoaded, setActive, signIn } = useSignIn()
  const { startSSOFlow } = useSSO()
  const [step, setStep] = useState<SignInStep>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function resetError() {
    setError(null)
  }

  function goBackToIdentifier() {
    resetError()
    setPassword('')
    setCode('')
    setStep('identifier')
  }

  async function handleContinue() {
    if (!isLoaded || !identifier.trim()) {
      return
    }

    setSubmitting(true)
    resetError()

    try {
      const result = await signIn.create({ identifier: identifier.trim() })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(app)')
        return
      }

      if (result.status === 'needs_first_factor') {
        const factors = result.supportedFirstFactors ?? []

        if (factors.some((factor) => factor.strategy === 'password')) {
          setStep('password')
          return
        }

        const emailAddressId = findEmailCodeAddressId(factors)
        if (emailAddressId) {
          await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId })
          setStep('verify')
          return
        }
      }

      setError('Nao foi possivel autenticar com as credenciais informadas.')
    } catch (caughtError) {
      setError(extractClerkMessage(caughtError, 'Verifique o e-mail informado e tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit() {
    if (!isLoaded || !password) {
      return
    }

    setSubmitting(true)
    resetError()

    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'password', password })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(app)')
        return
      }

      setError('Nao foi possivel concluir o login. Tente novamente.')
    } catch (caughtError) {
      setError(extractClerkMessage(caughtError, 'E-mail ou senha incorretos. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUseEmailCode() {
    if (!isLoaded) {
      return
    }

    setSubmitting(true)
    resetError()

    try {
    const emailAddressId = findEmailCodeAddressId(signIn.supportedFirstFactors ?? [])
    if (!emailAddressId) {
      setError('Não foi possível configurar a verificação por código.')
      return
    }

    await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId })
    setStep('verify')
    } catch (caughtError) {
      setError(extractClerkMessage(caughtError, 'Nao foi possivel enviar o codigo de verificacao.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifySubmit() {
    if (!isLoaded || !code) {
      return
    }

    setSubmitting(true)
    resetError()

    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(app)')
        return
      }

      setError('Codigo invalido ou expirado. Verifique e tente novamente.')
    } catch (caughtError) {
      setError(extractClerkMessage(caughtError, 'Codigo invalido ou expirado. Verifique e tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    if (!isLoaded) {
      return
    }

    setSubmitting(true)
    resetError()

    try {
      const { createdSessionId, setActive: setActiveFromFlow } = await startSSOFlow({ strategy: 'oauth_google' })

      if (createdSessionId) {
        await setActiveFromFlow?.({ session: createdSessionId })
        router.replace('/(app)')
        return
      }

      setError('Nao foi possivel concluir o login com o Google. Tente novamente.')
    } catch (caughtError) {
      setError(extractClerkMessage(caughtError, 'Nao foi possivel concluir o login com o Google.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BrandMark />

          {step === 'identifier' ? (
            <IdentifierStep
              identifier={identifier}
              onChangeIdentifier={setIdentifier}
              error={error}
              submitting={submitting}
              onSubmit={() => void handleContinue()}
              onGoogle={() => void handleGoogleSignIn()}
            />
          ) : null}

          {step === 'password' ? (
            <PasswordStep
              identifier={identifier}
              password={password}
              onChangePassword={setPassword}
              error={error}
              submitting={submitting}
              onSubmit={() => void handlePasswordSubmit()}
              onUseEmailCode={() => void handleUseEmailCode()}
              onBack={() => goBackToIdentifier()}
            />
          ) : null}

          {step === 'verify' ? (
            <VerifyStep
              identifier={identifier}
              code={code}
              onChangeCode={setCode}
              error={error}
              submitting={submitting}
              onSubmit={() => void handleVerifySubmit()}
              onResend={() => void handleUseEmailCode()}
              onBack={() => goBackToIdentifier()}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function BrandMark() {
  return (
    <View style={styles.brandBlock}>
      <View accessibilityRole="image" style={styles.brandBadge}>
        <Text style={styles.brandBadgeText}>MG</Text>
      </View>
      <View style={styles.brandTextBlock}>
        <Text style={styles.brandEyebrow}>Minha Gestão Financeira</Text>
        <Text accessibilityRole="header" style={styles.title}>Boas-vindas de volta</Text>
      </View>
      <Text style={styles.description}>Entre na sua conta para continuar acompanhando seus objetivos e compromissos.</Text>
    </View>
  )
}

function IdentifierStep({ identifier, onChangeIdentifier, error, submitting, onSubmit, onGoogle }: {
  identifier: string
  onChangeIdentifier: (value: string) => void
  error: string | null
  submitting: boolean
  onSubmit: () => void
  onGoogle: () => void
}) {
  return (
    <View style={styles.form}>
      <Pressable accessibilityRole="button" accessibilityLabel="Continuar com o Google" disabled={submitting} onPress={onGoogle} style={styles.googleButton}>
        <View style={styles.googleGlyph}>
          <Text style={styles.googleGlyphText}>G</Text>
        </View>
        <Text style={styles.googleButtonText}>Continuar com o Google</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <Field label="E-mail" value={identifier} onChangeText={onChangeIdentifier} autoCapitalize="none" keyboardType="email-address" placeholder="voce@exemplo.com" />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Continuar" disabled={submitting} onPress={onSubmit} style={[styles.button, submitting ? styles.buttonDisabled : null]}>
        {submitting ? <ActivityIndicator color="#eff6ff" /> : <Text style={styles.buttonText}>Continuar</Text>}
      </Pressable>
    </View>
  )
}

function PasswordStep({ identifier, password, onChangePassword, error, submitting, onSubmit, onUseEmailCode, onBack }: {
  identifier: string
  password: string
  onChangePassword: (value: string) => void
  error: string | null
  submitting: boolean
  onSubmit: () => void
  onUseEmailCode: () => void
  onBack: () => void
}) {
  return (
    <View style={styles.form}>
      <Text style={styles.stepHint}>Conta <Text style={styles.stepHintHighlight}>{identifier}</Text></Text>

      <Field label="Senha" value={password} onChangeText={onChangePassword} secureTextEntry />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Entrar" disabled={submitting} onPress={onSubmit} style={[styles.button, submitting ? styles.buttonDisabled : null]}>
        {submitting ? <ActivityIndicator color="#eff6ff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="Usar codigo de verificacao por e-mail" disabled={submitting} onPress={onUseEmailCode} style={styles.linkButton}>
        <Text style={styles.linkText}>Usar código de verificação por e-mail</Text>
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" disabled={submitting} onPress={onBack} style={styles.linkButton}>
        <Text style={styles.mutedLinkText}>Voltar</Text>
      </Pressable>
    </View>
  )
}

function VerifyStep({ identifier, code, onChangeCode, error, submitting, onSubmit, onResend, onBack }: {
  identifier: string
  code: string
  onChangeCode: (value: string) => void
  error: string | null
  submitting: boolean
  onSubmit: () => void
  onResend: () => void
  onBack: () => void
}) {
  return (
    <View style={styles.form}>
      <Text style={styles.stepHint}>Enviamos um código de verificação para <Text style={styles.stepHintHighlight}>{identifier}</Text>.</Text>

      <Field label="Código" value={code} onChangeText={onChangeCode} keyboardType="number-pad" placeholder="000000" />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Verificar código" disabled={submitting} onPress={onSubmit} style={[styles.button, submitting ? styles.buttonDisabled : null]}>
        {submitting ? <ActivityIndicator color="#eff6ff" /> : <Text style={styles.buttonText}>Verificar</Text>}
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="Reenviar codigo" disabled={submitting} onPress={onResend} style={styles.linkButton}>
        <Text style={styles.linkText}>Reenviar código</Text>
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" disabled={submitting} onPress={onBack} style={styles.linkButton}>
        <Text style={styles.mutedLinkText}>Voltar</Text>
      </Pressable>
    </View>
  )
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; keyboardType?: 'default' | 'email-address' | 'number-pad'; placeholder?: string }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        autoCapitalize={props.autoCapitalize}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={props.secureTextEntry}
        style={styles.input}
        value={props.value}
      />
    </View>
  )
}

function findEmailCodeAddressId(factors: { strategy: string; emailAddressId?: string }[]): string | undefined {
  return factors.find((factor) => factor.strategy === 'email_code')?.emailAddressId
}

function extractClerkMessage(caughtError: unknown, fallback: string) {
  const firstError = typeof caughtError === 'object' && caughtError && 'errors' in caughtError
    ? (caughtError as { errors?: { longMessage?: string; message?: string }[] }).errors?.[0]
    : undefined

  return firstError?.longMessage ?? firstError?.message ?? fallback
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
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  brandBlock: {
    gap: 12,
  },
  brandBadge: {
    alignItems: 'center',
    backgroundColor: '#0b6fe8',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brandBadgeText: {
    color: '#eff6ff',
    fontSize: 16,
    fontWeight: '700',
  },
  brandTextBlock: {
    gap: 4,
  },
  brandEyebrow: {
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
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  googleGlyph: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  googleGlyphText: {
    color: '#0b6fe8',
    fontSize: 14,
    fontWeight: '700',
  },
  googleButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dividerLine: {
    backgroundColor: '#1e293b',
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 52,
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
  stepHint: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  stepHintHighlight: {
    color: '#93c5fd',
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  linkText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  mutedLinkText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})
