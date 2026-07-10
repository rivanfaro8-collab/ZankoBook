import { TextInput, type TextInputProps } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'

type ThemedTextInputProps = TextInputProps

export default function ThemedTextInput({
  style,
  placeholderTextColor,
  ...props
}: ThemedTextInputProps) {
  const theme = useAppTheme()

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
