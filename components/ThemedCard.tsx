import { type ViewProps, View } from 'react-native'

import { Colors } from '../constants/Colors'
import { useThemeStore } from '../src/store/themeStore'

export default function ThemedCard({ style, ...props }: ViewProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const theme = themeMode === 'dark' ? Colors.dark : Colors.light

  return (
    <View
      {...props}
      style={[{ backgroundColor: theme.uiBackground, borderRadius: 8, padding: 20 }, style]}
    />
  )
}
