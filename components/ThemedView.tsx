import { type ViewProps, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Colors } from '../constants/Colors'
import { useThemeStore } from '../src/store/themeStore'

type ThemedViewProps = ViewProps & {
  safe?: boolean
}

export default function ThemedView({ safe = false, style, ...props }: ThemedViewProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const theme = themeMode === 'dark' ? Colors.dark : Colors.light
  const Component = safe ? SafeAreaView : View

  return <Component {...props} style={[{ backgroundColor: theme.background }, style]} />
}
