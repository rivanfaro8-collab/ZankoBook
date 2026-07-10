import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppTheme } from '../src/store/themeStore'

type SimpleBackHeaderProps = {
  title?: string
}

export default function SimpleBackHeader({ title }: SimpleBackHeaderProps) {
  const theme = useAppTheme()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <View style={styles.row}>
        <View style={styles.titleSpace}>
          {title ? null : null}
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole='button'
          accessibilityLabel='Go back'
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.uiBackground, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name='arrow-back-outline' size={24} color={theme.title} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {},
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  titleSpace: {
    flex: 1,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.62,
  },
})
