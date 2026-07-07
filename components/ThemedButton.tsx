import { Pressable, type PressableProps, StyleSheet } from 'react-native'

import { Colors } from '../constants/Colors'

type ThemedButtonProps = PressableProps

export default function ThemedButton({ style, ...props }: ThemedButtonProps) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.button,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginVertical: 10,
    padding: 18,
  },
  pressed: {
    opacity: 0.65,
  },
})
