import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { changePassword } from '../../src/api/auth'
import { useAppTheme } from '../../src/store/themeStore'
import ThemedButton from '../ThemedButton'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

type ChangePasswordModalProps = {
  visible: boolean
  onClose: () => void
}

type PasswordFieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  visible: boolean
  onToggleVisibility: () => void
}

function PasswordField({
  label,
  value,
  onChangeText,
  visible,
  onToggleVisibility,
}: PasswordFieldProps) {
  const theme = useAppTheme()

  return (
    <View style={styles.fieldGroup}>
      <ThemedText title style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.inputWrapper}>
        <ThemedTextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize='none'
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable
          onPress={onToggleVisibility}
          accessibilityRole='button'
          accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
          hitSlop={10}
          style={styles.eyeButton}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.text}
          />
        </Pressable>
      </View>
    </View>
  )
}

export default function ChangePasswordModal({
  visible,
  onClose,
}: ChangePasswordModalProps) {
  const theme = useAppTheme()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const reset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  useEffect(() => {
    if (!visible) {
      reset()
    }
  }, [visible])

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      Alert.alert('Password changed', 'Your password was changed successfully.')
      reset()
      onClose()
    },
    onError: (error) => {
      Alert.alert(
        'Password change failed',
        error instanceof Error ? error.message : 'Unable to change password.',
      )
    },
  })

  const handleClose = () => {
    if (!mutation.isPending) {
      onClose()
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Please complete all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Confirm your new password again.')
      return
    }

    if (newPassword === currentPassword) {
      Alert.alert('Invalid password', 'The new password must be different.')
      return
    }

    mutation.mutate({ currentPassword, newPassword })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.modalCard,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <View style={styles.header}>
              <ThemedText title style={styles.title}>
                Change Password
              </ThemedText>
              <Pressable
                onPress={handleClose}
                disabled={mutation.isPending}
                accessibilityRole='button'
                accessibilityLabel='Close change password popup'
                hitSlop={10}
              >
                <Ionicons name='close' size={26} color={theme.title} />
              </Pressable>
            </View>

            <PasswordField
              label='Current password'
              value={currentPassword}
              onChangeText={setCurrentPassword}
              visible={showCurrentPassword}
              onToggleVisibility={() => setShowCurrentPassword((value) => !value)}
            />
            <PasswordField
              label='New password'
              value={newPassword}
              onChangeText={setNewPassword}
              visible={showNewPassword}
              onToggleVisibility={() => setShowNewPassword((value) => !value)}
            />
            <PasswordField
              label='Confirm new password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
            />

            <ThemedButton
              onPress={handleChangePassword}
              disabled={mutation.isPending}
              accessibilityRole='button'
              accessibilityLabel='Change password'
              style={styles.changeButton}
            >
              <ThemedText style={styles.changeButtonText}>
                {mutation.isPending ? 'Changing...' : 'Change'}
              </ThemedText>
            </ThemedButton>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
  },
  changeButton: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
})
