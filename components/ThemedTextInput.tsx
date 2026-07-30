import { forwardRef } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../src/store/themeStore'

type ThemedTextInputProps = TextInputProps

const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  function ThemedTextInput(
    { style, placeholderTextColor, placeholder, ...props },
    ref,
  ) {
    const theme = useAppTheme()
    const { t } = useTranslation()

    return (
      <TextInput
        ref={ref}
        {...props}
        placeholder={placeholder ? t(placeholder, { defaultValue: placeholder }) : undefined}
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
