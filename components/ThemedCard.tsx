import { type ViewProps, View } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'

export default function ThemedCard({ style, ...props }: ViewProps) {
  const theme = useAppTheme()

  return (
    <View
      {...props}
      style={[{ backgroundColor: theme.uiBackground, borderRadius: 8, padding: 20 }, style]}
    />
  )
}
