import { Text, type TextProps } from 'react-native'

import { Colors } from '../constants/Colors'
import { useThemeStore } from '../src/store/themeStore'

type ThemedTextProps = TextProps & {
  title?: boolean
}

export default function ThemedText({ style, title = false, ...props }: ThemedTextProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const theme = themeMode === 'dark' ? Colors.dark : Colors.light

  return <Text style={[{ color: title ? theme.title : theme.text }, style]} {...props} />
}
