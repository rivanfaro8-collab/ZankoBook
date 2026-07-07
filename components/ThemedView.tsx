import { type ViewProps, View, useColorScheme } from 'react-native'

import { Colors } from '../constants/Colors'

export default function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light

  return <View {...props} style={[{ backgroundColor: theme.background }, style]} />
}
