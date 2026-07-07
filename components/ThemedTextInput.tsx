import { TextInput, type TextInputProps, useColorScheme } from 'react-native'

import { Colors } from '../constants/Colors'

type ThemedTextInputProps = TextInputProps

export default function ThemedTextInput({
  style,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light

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
