import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

export const mobileQueryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'controle-gestao-financeira:mobile-query-cache',
})

export const mobilePersistMaxAge = 1000 * 60 * 60 * 24
