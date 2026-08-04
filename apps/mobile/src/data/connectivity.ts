import { onlineManager } from '@tanstack/react-query'
import NetInfo from '@react-native-community/netinfo'

let unsubscribeFromNetInfo: (() => void) | null = null

export function registerMobileOnlineManager() {
  if (unsubscribeFromNetInfo) {
    return unsubscribeFromNetInfo
  }

  onlineManager.setEventListener((setOnline) => {
    unsubscribeFromNetInfo = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false))
    })

    return () => {
      unsubscribeFromNetInfo?.()
      unsubscribeFromNetInfo = null
    }
  })

  return unsubscribeFromNetInfo
}
