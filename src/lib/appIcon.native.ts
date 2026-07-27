import { setAppIcon } from '@howincodes/expo-dynamic-app-icon'

import { type ThemeName } from '../../constants/Colors'

export function syncAppIcon(themeName: ThemeName) {
  void setAppIcon(themeName).catch((error: unknown) => {
    console.warn('Unable to update the application icon.', error)
  })
}
