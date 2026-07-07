import { Text, type TextProps, useColorScheme } from 'react-native'

import { Colors } from '../constants/Colors'

type ThemedTextProps = TextProps & {
  title?: boolean
}

export default function ThemedText({ style, title = false, ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light

  return <Text style={[{ color: title ? theme.title : theme.text }, style]} {...props} />
}
