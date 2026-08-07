import '@expo/metro-runtime'
import { ExpoRoot } from 'expo-router'

const mobileAppContext = require.context('./apps/mobile/src/app')

export default function App() {
  return <ExpoRoot context={mobileAppContext} />
}
