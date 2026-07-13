import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { router } from 'expo-router'
import {
  Alert,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors, type ThemeName } from '../constants/Colors'
import { logout } from '../src/api/auth'
import { removeSavedToken } from '../src/lib/authStorage'
import { queryClient } from '../src/lib/queryClient'
import { useAppTheme, useThemeStore } from '../src/store/themeStore'
import { useUserStore } from '../src/store/userStore'
import ThemedText from './ThemedText'

type AppDrawerProps = {
  role: 'student' | 'lecturer'
  onClose: () => void
}

const UNIVERSITY_NAME = 'Zanko University of Applied Sciences and Technology'
const USER_NAME = 'Rivan Faruq'

export default function AppDrawer({ role, onClose }: AppDrawerProps) {
  const theme = useAppTheme()
  const themeName = useThemeStore((state) => state.themeName)
  const setThemeName = useThemeStore((state) => state.setThemeName)
  const themeMode = useThemeStore((state) => state.themeMode)
  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const clearLocalSession = async () => {
    await removeSavedToken()
    setToken(null)
    setUser(null)
    queryClient.clear()
  }

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Close the native drawer first. Replacing the navigation tree while the
      // drawer is still mounted can make Android Fabric attach the same view
      // twice and crash with: "The specified child already has a parent."
      onClose()

      InteractionManager.runAfterInteractions(() => {
        void (async () => {
          await clearLocalSession()
          router.replace('/(auth)/login' as never)
        })()
      })
    },
    onError: (error) => {
      setIsLoggingOut(false)
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to log out. Please try again.'

      Alert.alert('Logout failed', message)
    },
  })

  const handleLogout = () => {
    if (isLoggingOut || logoutMutation.isPending) {
      return
    }

    setIsLoggingOut(true)
    logoutMutation.mutate()
  }

  const initials = USER_NAME.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const goTo = (screen: 'downloaded' | 'guide') => {
    onClose()
    router.push(`/(${role})/${screen}` as never)
  }

  return (
    <SafeAreaView style={[styles.drawer, { backgroundColor: theme.background }]}> 
      <View style={[styles.universityBlock, { borderBottomColor: theme.border }]}> 
        <ThemedText title style={styles.universityName} numberOfLines={2} ellipsizeMode='tail'>
          {UNIVERSITY_NAME}
        </ThemedText>
      </View>

      <View style={[styles.userBlock, { borderBottomColor: theme.border }]}> 
        <View style={[styles.avatar, { backgroundColor: theme.uiBackground, borderColor: theme.primary }]}> 
          <ThemedText title style={styles.avatarText} numberOfLines={1}>
            {initials}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText title style={styles.userName} numberOfLines={1} ellipsizeMode='tail'>
            {USER_NAME}
          </ThemedText>
          <ThemedText style={styles.userRole} numberOfLines={1}>
            {role === 'student' ? 'Student' : 'Lecturer'}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DrawerLink icon='download-outline' label='Downloaded' onPress={() => goTo('downloaded')} />
        <DrawerLink icon='help-circle-outline' label='Help / Guide' onPress={() => goTo('guide')} />

        <View style={styles.themeSection}>
          <View style={styles.themeTitleRow}>
            <Ionicons name='color-palette-outline' size={22} color={theme.title} />
            <ThemedText title style={styles.themeTitle}>
              Themes
            </ThemedText>
          </View>

          <View style={styles.themeDots}>
            {(Object.keys(Colors.themes) as ThemeName[]).map((name) => {
              const selected = themeName === name
              const swatch = Colors.themes[name].swatch

              return (
                <Pressable
                  key={name}
                  onPress={() => setThemeName(name)}
                  accessibilityRole='button'
                  accessibilityLabel={`Use ${name} theme`}
                  style={({ pressed }) => [
                    styles.themeDotOuter,
                    selected && { borderColor: theme.title, borderWidth: 2 },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.themeDotInner, { backgroundColor: swatch }]} />
                  {selected && (
                    <View style={styles.checkIcon}>
                      <Ionicons
                        name='checkmark'
                        size={13}
                        color={themeMode === 'dark' ? '#FFFFFF' : '#111827'}
                      />
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityRole='button'
          accessibilityLabel='Log out'
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: theme.danger },
            (pressed || isLoggingOut) && styles.pressed,
          ]}
        >
          <Ionicons name='log-out-outline' size={22} color='#FFFFFF' />
          <ThemedText style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function DrawerLink({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const theme = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        { backgroundColor: theme.uiBackground, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={23} color={theme.title} />
      <ThemedText title style={styles.linkText} numberOfLines={1}>
        {label}
      </ThemedText>
      <Ionicons name='chevron-forward-outline' size={19} color={theme.text} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
  },
  universityBlock: {
    minHeight: 82,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  universityName: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  userBlock: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
  },
  userRole: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 18,
    gap: 14,
  },
  link: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  themeSection: {
    marginTop: 10,
    gap: 14,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  themeTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  themeDots: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 13,
  },
  themeDotOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
  themeDotInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  checkIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 12,
  },
  logoutButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.68,
  },
})
