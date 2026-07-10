import { Pressable, type PressableProps, StyleSheet } from 'react-native'

import { useAppTheme } from '../src/store/themeStore'

type ThemedButtonProps = PressableProps

export default function ThemedButton({ style, ...props }: ThemedButtonProps) {
  const theme = useAppTheme()

  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.button,
        { backgroundColor: theme.primary },
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    marginVertical: 10,
    padding: 18,
  },
  pressed: {
    opacity: 0.65,
  },
})
