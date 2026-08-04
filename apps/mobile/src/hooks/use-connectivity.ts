import NetInfo, { useNetInfo } from '@react-native-community/netinfo'

export function useConnectivity() {
  const netInfo = useNetInfo()
  const isOnline = Boolean(netInfo.isConnected && netInfo.isInternetReachable !== false)

  return {
    ...netInfo,
    isOnline,
    statusLabel: isOnline ? 'Online' : 'Offline',
  }
}

export async function getCurrentConnectivity() {
  const state = await NetInfo.fetch()

  return Boolean(state.isConnected && state.isInternetReachable !== false)
}
