import { Text, type TextProps } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'

type ThemedTextProps = TextProps & {
  title?: boolean
}

export default function ThemedText({ style, title = false, ...props }: ThemedTextProps) {
  const theme = useAppTheme()

  return <Text style={[{ color: title ? theme.title : theme.text }, style]} {...props} />
}
