import { forwardRef } from 'react'
import { TextInput, type TextInputProps } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'

type ThemedTextInputProps = TextInputProps

const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  function ThemedTextInput(
    { style, placeholderTextColor, ...props },
    ref,
  ) {
    const theme = useAppTheme()

    return (
      <TextInput
        ref={ref}
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
  },
)

export default ThemedTextInput
