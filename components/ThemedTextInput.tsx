import { TextInput, type TextInputProps } from 'react-native'

import { Colors } from '../constants/Colors'
import { useThemeStore } from '../src/store/themeStore'

type ThemedTextInputProps = TextInputProps

export default function ThemedTextInput({
  style,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const theme = themeMode === 'dark' ? Colors.dark : Colors.light

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? theme.text}
      style={[
        {
          backgroundColor: theme.uiBackground,
          borderColor: theme.border,
          borderWidth: 1,
          color: theme.text,
          padding: 18,
          borderRadius: 8,
        },
        style,
      ]}
    />
  )
}
