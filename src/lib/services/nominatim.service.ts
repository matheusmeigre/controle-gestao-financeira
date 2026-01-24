/**
 * Serviço de Geolocalização usando Nominatim (OpenStreetMap)
 * 
 * Características:
 * - API gratuita e sem limites rígidos
 * - Não requer chave de API
 * - Cache local para reduzir requisições
 * - Fallback para entrada manual
 * - Rate limiting de 1 req/segundo
 */

export interface LocationResult {
  displayName: string
  city?: string
  state?: string
  country?: string
  lat?: number
  lon?: number
  type?: string // city, country, attraction, etc
}

interface NominatimResponse {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
  type?: string
  class?: string
}

// Cache simples em memória (válido durante a sessão)
const searchCache = new Map<string, LocationResult[]>()
const CACHE_DURATION = 1000 * 60 * 10 // 10 minutos
const cacheTimestamps = new Map<string, number>()

// Rate limiting
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 segundo entre requisições

class NominatimService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org'
  private readonly userAgent = 'FinancialPlanningApp/1.0'

  /**
   * Busca localizações baseado em query
   * Implementa debounce, cache e rate limiting
   */
  async searchLocations(query: string): Promise<LocationResult[]> {
    if (!query || query.length < 3) return []

    // Verificar cache
    const cached = this.getCached(query)
    if (cached) return cached

    // Rate limiting
    await this.waitForRateLimit()

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        'accept-language': 'pt-BR,pt',
      })

      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        console.warn('[Nominatim] Erro na busca:', response.status)
        return []
      }

      const data: NominatimResponse[] = await response.json()
      const results = data.map(this.parseResponse)

      // Salvar em cache
      this.saveToCache(query, results)

      return results
    } catch (error) {
      console.error('[Nominatim] Erro:', error)
      return []
    }
  }

  /**
   * Busca reversa: coordenadas → endereço
   */
  async reverseGeocode(lat: number, lon: number): Promise<LocationResult | null> {
    await this.waitForRateLimit()

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'pt-BR,pt',
      })

      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) return null

      const data: NominatimResponse = await response.json()
      return this.parseResponse(data)
    } catch (error) {
      console.error('[Nominatim] Erro na busca reversa:', error)
      return null
    }
  }

  /**
   * Parse da resposta da API para nosso formato
   */
  private parseResponse(item: NominatimResponse): LocationResult {
    const city = item.address?.city || item.address?.town || item.address?.village
    const state = item.address?.state
    const country = item.address?.country

    return {
      displayName: item.display_name,
      city,
      state,
      country,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type || item.class,
    }
  }

  /**
   * Implementa rate limiting de 1 req/segundo
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    lastRequestTime = Date.now()
  }

  /**
   * Busca no cache
   */
  private getCached(query: string): LocationResult[] | null {
    const cached = searchCache.get(query)
    const timestamp = cacheTimestamps.get(query)

    if (!cached || !timestamp) return null

    const age = Date.now() - timestamp
    if (age > CACHE_DURATION) {
      searchCache.delete(query)
      cacheTimestamps.delete(query)
      return null
    }

    return cached
  }

  /**
   * Salva no cache
   */
  private saveToCache(query: string, results: LocationResult[]): void {
    searchCache.set(query, results)
    cacheTimestamps.set(query, Date.now())
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    searchCache.clear()
    cacheTimestamps.clear()
  }
}

export const nominatimService = new NominatimService()
