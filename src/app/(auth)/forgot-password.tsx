import { Link } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'

import ThemedButton from '../../../components/ThemedButton'
import ThemedLogo from '../../../components/ThemedLogo'
import ThemedText from '../../../components/ThemedText'
import ThemedTextInput from '../../../components/ThemedTextInput'
import ThemedView from '../../../components/ThemedView'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.')
      return
    }

    // Password reset requests will be sent to the backend here later.
    console.log('Password reset requested', { email: email.trim() })
  }

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ThemedLogo style={styles.logo} />

        <ThemedText title style={styles.title}>
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
          style={styles.resetButton}
        >
          <ThemedText style={styles.buttonText}>Reset Password</ThemedText>
        </ThemedButton>

        <Link href='/login' replace style={styles.backLink}>
          <ThemedText style={styles.backText}>Back to Login</ThemedText>
        </Link>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 112,
    height: 124,
    resizeMode: 'contain',
    marginBottom: 22,
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
