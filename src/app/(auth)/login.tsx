import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, type Href } from 'expo-router'
import { useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { login } from '@/api/auth'
import { saveToken } from '@/lib/authStorage'
import { useAppTheme } from '@/store/themeStore'
import { useUserStore } from '@/store/userStore'

import ThemedButton from '../../../components/ThemedButton'
import ThemedLogo from '../../../components/ThemedLogo'
import ThemedText from '../../../components/ThemedText'
import ThemedTextInput from '../../../components/ThemedTextInput'
import ThemedView from '../../../components/ThemedView'

export default function Login() {
  const router = useRouter()
  const theme = useAppTheme()
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: ({ token, user }) => {
      setToken(token)
      setUser(user)

      void saveToken(token).catch(() => {
        Alert.alert(
          'Session warning',
          'You are logged in, but the session could not be saved on this device.',
        )
      })

      const role = user.roles[0]?.name

      if (role === 'lecturer') {
        router.replace('/(lecturer)/Dashboard' as Href)
        return
      }

      if (role === 'student') {
        router.replace('/(student)/Dashboard' as Href)
        return
      }

      Alert.alert(
        'Login failed',
        'This account does not have a supported ZankoBook role.',
      )
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandingBlock}></View>
          <ThemedLogo style={styles.logo} />

          <View style={styles.formContent}>
            <Pressable
              onPress={() => emailInputRef.current?.focus()}
              style={styles.inputContainer}
            >
              <ThemedTextInput
                ref={emailInputRef}
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
                autoComplete='email'
                textContentType='emailAddress'
                returnKeyType='next'
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                style={styles.input}
              />
            </Pressable>

            <View style={styles.passwordContainer}>
              <ThemedTextInput
                ref={passwordInputRef}
                value={password}
                onChangeText={setPassword}
                placeholder='Password'
                secureTextEntry={isPasswordHidden}
                autoCapitalize='none'
                autoCorrect={false}
                autoComplete='password'
                textContentType='password'
                returnKeyType='done'
                onSubmitEditing={handleLogin}
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setIsPasswordHidden((hidden) => !hidden)}
                accessibilityRole='button'
                accessibilityLabel={
                  isPasswordHidden ? 'Show password' : 'Hide password'
                }
                hitSlop={10}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={isPasswordHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={23}
                  color={theme.text}
                />
              </Pressable>
            </View>

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
              disabled={loginMutation.isPending}
              style={styles.loginButton}
            >
              <ThemedText style={styles.buttonText}>
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </ThemedText>
            </ThemedButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  brandingBlock: {
    minHeight: 270,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 52,
    paddingBottom: 26,
    paddingHorizontal: 20,
  },
  logo: {
    width: 132,
    height: 145,
    resizeMode: 'contain',
  },
  formContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 14,
    zIndex: 2,
    elevation: 2,
  },
  input: {
    width: '100%',
  },
  passwordContainer: {
    width: '80%',
    position: 'relative',
    marginBottom: 14,
  },
  passwordInput: {
    width: '100%',
    paddingRight: 54,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    width: '80%',
    marginTop: 1,
    marginRight: '10%',
    marginBottom: 12,
  },
  forgotPasswordText: {
    textAlign: 'right',
    fontWeight: '600',
  },
  loginButton: {
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
