import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, type Href } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'

import { login } from '@/api/auth'
import { saveToken } from '@/lib/authStorage'
import { useUserStore } from '@/store/userStore'

import ThemedButton from '../../../components/ThemedButton'
import ThemedLogo from '../../../components/ThemedLogo'
import ThemedText from '../../../components/ThemedText'
import ThemedTextInput from '../../../components/ThemedTextInput'
import ThemedView from '../../../components/ThemedView'

export default function Login() {
  const router = useRouter()

  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: async ({ token, user }) => {
      await saveToken(token)

      setToken(token)
      setUser(user)

      if (user.role === 'lecturer') {
        router.replace('/(lecturer)/home' as Href)
        return
      }

      router.replace('/(student)/home' as Href)
    },

    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.'

      Alert.alert('Login failed', message)
    },
  })

  const handleLogin = () => {
    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.')
      return
    }

    if (loginMutation.isPending) {
      return
    }

    loginMutation.mutate({
      email: cleanEmail,
      password,
    })
  }

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ThemedLogo style={styles.logo} />

        <ThemedText title style={styles.title}>
          Welcome to ZankoBook
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Sign in to continue your learning journey.
        </ThemedText>

        <ThemedTextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='email-address'
          autoComplete='email'
          textContentType='emailAddress'
          returnKeyType='next'
          style={styles.input}
        />

        <ThemedTextInput
          value={password}
          onChangeText={setPassword}
          placeholder='Password'
          secureTextEntry
          autoCapitalize='none'
          autoCorrect={false}
          autoComplete='password'
          textContentType='password'
          returnKeyType='done'
          onSubmitEditing={handleLogin}
          style={styles.input}
        />

        <Link
          href={'/forgot-password' as Href}
          style={styles.forgotPasswordLink}
        >
          <ThemedText style={styles.forgotPasswordText}>
            Forgot password?
          </ThemedText>
        </Link>

        <ThemedButton
          onPress={handleLogin}
          accessibilityRole='button'
          accessibilityLabel='Log in'
          style={styles.loginButton}
        >
          <ThemedText style={styles.buttonText}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </ThemedText>
        </ThemedButton>
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
    width: 132,
    height: 146,
    resizeMode: 'contain',
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    width: '80%',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '80%',
    marginBottom: 14,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    width: '80%',
    marginTop: 1,
    marginBottom: 12,
    marginRight: 40,
  },
  forgotPasswordText: {
    textAlign: 'right',
    fontWeight: '600',
  },
  loginButton: {
    width: '80%',
    alignItems: 'center',
    marginTop: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
