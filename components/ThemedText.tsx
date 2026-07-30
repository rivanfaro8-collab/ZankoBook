import { Children, isValidElement, type ReactNode } from 'react'
import { Text, type TextProps } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useAppTheme } from '../src/store/themeStore'

type ThemedTextProps = TextProps & {
  title?: boolean
}

function translateChildren(children: ReactNode, t: (key: string, options?: object) => string): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return t(child, { defaultValue: child })
    }
    if (Array.isArray(child)) return translateChildren(child, t)
    if (isValidElement(child)) return child
    return child
  })
}

export default function ThemedText({ style, title = false, children, ...props }: ThemedTextProps) {
  const theme = useAppTheme()
  const { t } = useTranslation()

  return (
    <Text style={[{ color: title ? theme.title : theme.text }, style]} {...props}>
      {translateChildren(children, t)}
    </Text>
  )
}
