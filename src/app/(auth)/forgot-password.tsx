import { useMutation } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import { forgotPassword } from '@/api/auth'

import ThemedButton from '../../../components/ThemedButton'
import ThemedLogo from '../../../components/ThemedLogo'
import ThemedText from '../../../components/ThemedText'
import ThemedTextInput from '../../../components/ThemedTextInput'
import ThemedView from '../../../components/ThemedView'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const resetMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (message) => {
      Alert.alert('Request sent', message)
    },
    onError: (error) => {
      Alert.alert(
        'Unable to reset password',
        error instanceof Error
          ? error.message
          : 'Unable to send the password reset request. Please try again.',
      )
    },
  })

  const handleResetPassword = () => {
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      Alert.alert('Email required', 'Please enter your email address.')
      return
    }

    if (resetMutation.isPending) {
      return
    }

    resetMutation.mutate(cleanEmail)
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.logoBlock} pointerEvents='none'>
        <ThemedLogo style={styles.logo} />
      </View>

      <View style={styles.formBlock}>
        <ThemedText title style={styles.title}>
          {'\n'}
          {'\n'}
          {'\n'}
          {'\n'}
          Reset your password
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Enter your email address and we will send you a password reset link.
        </ThemedText>

        <ThemedTextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email address'
          keyboardType='email-address'
          autoCapitalize='none'
          autoCorrect={false}
          autoComplete='email'
          textContentType='emailAddress'
          returnKeyType='done'
          onSubmitEditing={handleResetPassword}
          style={styles.input}
        />

        <ThemedButton
          onPress={handleResetPassword}
          accessibilityRole='button'
          accessibilityLabel='Reset password'
          disabled={resetMutation.isPending}
          style={styles.resetButton}
        >
          <ThemedText style={styles.buttonText}>
            {resetMutation.isPending ? 'Sending...' : 'Reset Password'}
          </ThemedText>
        </ThemedButton>

        <Link href='/login' replace style={styles.backLink}>
          <ThemedText style={styles.backText}>Back to Login</ThemedText>
        </Link>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  logoBlock: {
    height: 205,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  logo: {
    width: 112,
    height: 124,
    resizeMode: 'contain',
  },
  formBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    width: '80%',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    marginBottom: 10,
  },
  resetButton: {
    width: '80%',
    alignItems: 'center',
    marginTop: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 14,
  },
  backText: {
    fontWeight: '600',
  },
})
