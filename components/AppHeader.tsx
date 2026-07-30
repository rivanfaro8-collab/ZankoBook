import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Pressable, StyleSheet, View } from 'react-native'

import { type AppLanguage, setAppLanguage } from '../src/i18n'
import { useAppTheme, useThemeStore } from '../src/store/themeStore'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'

const LANGUAGES: { code: AppLanguage; short: string; label: string }[] = [
  { code: 'en', short: 'En', label: 'English' },
  { code: 'ar', short: 'Ar', label: 'Arabic' },
  { code: 'ckb', short: 'Ku', label: 'Kurdish (Central)' },
]

type AppHeaderProps = {
  onMenuPress?: () => void
}

export default function AppHeader({ onMenuPress }: AppHeaderProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const { i18n, t } = useTranslation()
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0] as AppLanguage
  const selectedLanguage = LANGUAGES.find((item) => item.code === currentLanguage) ?? LANGUAGES[0]

  const themeMode = useThemeStore((state) => state.themeMode)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const theme = useAppTheme()
  const iconColor = theme.title
  const themeIconColor = themeMode === 'dark' ? '#EAF8FF' : '#F59E0B'

  const animation = useRef(new Animated.Value(themeMode === 'dark' ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(animation, {
      toValue: themeMode === 'dark' ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 120,
      mass: 0.7,
    }).start()
  }, [animation, themeMode])

  const sunOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  const moonOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const sunScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  })

  const moonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  })

  const sunRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-25deg'],
  })

  const moonRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['25deg', '0deg'],
  })

  return (
    <ThemedView safe style={styles.safeHeader}>
      <View style={styles.headerContent}>
        <View style={styles.leftActions}>
          <Pressable
            onPress={onMenuPress}
            accessibilityRole='button'
            accessibilityLabel={t('Open menu')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name='menu-outline' size={34} color={iconColor} />
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            accessibilityRole='button'
            accessibilityLabel={t('Toggle dark mode')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <View style={styles.themeIconStage}>
              <Animated.View
                style={[
                  styles.themeIcon,
                  {
                    opacity: sunOpacity,
                    transform: [{ scale: sunScale }, { rotate: sunRotate }],
                  },
                ]}
              >
                <Ionicons name='sunny' size={28} color={themeIconColor} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.themeIcon,
                  {
                    opacity: moonOpacity,
                    transform: [{ scale: moonScale }, { rotate: moonRotate }],
                  },
                ]}
              >
                <Ionicons name='moon' size={27} color={themeIconColor} />
              </Animated.View>
            </View>
          </Pressable>
        </View>

        <View style={styles.languageWrapper}>
          <Pressable
            onPress={() => setLanguageMenuOpen((isOpen) => !isOpen)}
            accessibilityRole='button'
            accessibilityLabel={t('Choose language')}
            style={({ pressed }) => [
              styles.languageButton,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText style={styles.languageText}>{selectedLanguage.short}</ThemedText>
            <Ionicons name='chevron-down-outline' size={17} color={iconColor} />
          </Pressable>

          {languageMenuOpen && (
            <View
              style={[
                styles.languageMenu,
                { backgroundColor: theme.uiBackground, borderColor: theme.border },
              ]}
            >
              {LANGUAGES.map((language) => (
                <Pressable
                  key={language.code}
                  onPress={() => {
                    void setAppLanguage(language.code)
                    setLanguageMenuOpen(false)
                  }}
                  style={({ pressed }) => [styles.languageOption, pressed && styles.pressed]}
                >
                  <ThemedText style={styles.languageOptionText}>{language.short}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  safeHeader: {
    zIndex: 10,
  },
  headerContent: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  themeIconStage: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageWrapper: {
    position: 'relative',
  },
  languageButton: {
    minWidth: 78,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  languageMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 78,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 20,
  },
  languageOption: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '700',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.62,
  },
})
