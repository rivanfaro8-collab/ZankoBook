import { type ViewProps, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppTheme } from '../src/store/themeStore'

type ThemedViewProps = ViewProps & {
  safe?: boolean
}

export default function ThemedView({ safe = false, style, ...props }: ThemedViewProps) {
  const theme = useAppTheme()
  const Component = safe ? SafeAreaView : View

  return <Component {...props} style={[{ backgroundColor: theme.background }, style]} />
}
