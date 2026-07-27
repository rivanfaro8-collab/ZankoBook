import { useEventListener } from 'expo'
import { useVideoPlayer, VideoView, type VideoViewProps } from 'expo-video'

import { type ThemeName } from '../constants/Colors'
import { useThemeStore } from '../src/store/themeStore'

const LightLogoVideo = require('../assets/img/Light.mp4')

const DarkLogoVideos: Record<ThemeName, number> = {
  teal: require('../assets/img/teal.mp4'),
  green: require('../assets/img/green.mp4'),
  orange: require('../assets/img/orange.mp4'),
  pink: require('../assets/img/pink.mp4'),
  midnight: require('../assets/img/midnight.mp4'),
  blue: require('../assets/img/blue.mp4'),
}

type ThemedLogoProps = Omit<VideoViewProps, 'player'>

type LogoVideoProps = ThemedLogoProps & {
  source: number
}

function LogoVideo({ source, style, ...props }: LogoVideoProps) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false
    videoPlayer.muted = true
    videoPlayer.play()
  })

  useEventListener(player, 'playToEnd', () => {
    player.pause()
    player.currentTime = Math.max(0, player.duration - 0.01)
  })

  return (
    <VideoView
      player={player}
      style={[
        style,

        // Change the logo size and position here.
        {
          position: 'absolute',
          width: 340,
          height: 340,

          // Position without pushing other elements.
          top: -0,
          alignSelf: 'center',
          zIndex: 10,
        },
      ]}
      contentFit='contain'
      nativeControls={false}
      pointerEvents='none'
      {...props}
    />
  )
}

export default function ThemedLogo(props: ThemedLogoProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const themeName = useThemeStore((state) => state.themeName)

  const source =
    themeMode === 'light' ? LightLogoVideo : DarkLogoVideos[themeName]
  const videoKey = themeMode === 'light' ? 'light' : themeName

  return <LogoVideo key={videoKey} source={source} {...props} />
}
