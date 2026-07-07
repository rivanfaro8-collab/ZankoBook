import { Image, type ImageProps, useColorScheme } from 'react-native'

import DarkLogo from '../assets/img/logo_dark.png'
import LightLogo from '../assets/img/logo_light.png'

type ThemedLogoProps = Omit<ImageProps, 'source'>

export default function ThemedLogo({ style, ...props }: ThemedLogoProps) {
  const colorScheme = useColorScheme()
  const logo = colorScheme === 'dark' ? DarkLogo : LightLogo

  return <Image source={logo} style={style} {...props} />
}
