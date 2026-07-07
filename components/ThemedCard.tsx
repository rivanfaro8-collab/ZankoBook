import { type ViewProps, View, useColorScheme } from 'react-native'

import { Colors } from '../constants/Colors'

export default function ThemedCard({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light

  return (
    <View
      {...props}
      style={[{ backgroundColor: theme.uiBackground, borderRadius: 8, padding: 20 }, style]}
    />
  )
}
