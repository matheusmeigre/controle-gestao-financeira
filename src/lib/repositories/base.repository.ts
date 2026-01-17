/**
 * Base Repository Pattern
 * Abstrai a camada de persistência (localStorage)
 * Facilita migração futura para banco de dados
 */

export abstract class BaseRepository<T extends { id: string; userId: string }> {
  protected key: string

  constructor(key: string) {
    this.key = key
  }

  /**
   * Obtém o ID do usuário atual
   * Nota: Em ambiente client-side, precisa ser passado como parâmetro
   * Em ambiente server-side, pode usar auth() do Clerk
   */
  protected getStorageKey(userId: string): string {
    return `${this.key}_${userId}`
  }

  /**
   * Busca todos os registros do usuário
   */
  async findAll(userId: string): Promise<T[]> {
    if (typeof window === 'undefined') {
      throw new Error('Repository operations are only available in client-side')
    }
    
    const data = localStorage.getItem(this.getStorageKey(userId))
    const items = data ? JSON.parse(data) : []
    
    // Deserializar datas (converter strings ISO de volta para Date)
    return items.map((item: any) => this.deserializeDates(item))
  }

  /**
   * Converte strings de data de volta para objetos Date
   * Override este método em repositórios específicos se necessário
   */
  protected deserializeDates(item: any): T {
    // Lista de campos que devem ser convertidos para Date
    const dateFields = ['createdAt', 'updatedAt', 'date', 'closingDate', 'dueDate']
    
    const deserialized = { ...item }
    
    for (const field of dateFields) {
      if (deserialized[field] && typeof deserialized[field] === 'string') {
        deserialized[field] = new Date(deserialized[field])
      }
    }
    
    // Se tem items (array de itens), deserializar datas dos itens também
    if (Array.isArray(deserialized.items)) {
      deserialized.items = deserialized.items.map((subItem: any) => {
        const deserializedItem = { ...subItem }
        for (const field of dateFields) {
          if (deserializedItem[field] && typeof deserializedItem[field] === 'string') {
            deserializedItem[field] = new Date(deserializedItem[field])
          }
        }
        return deserializedItem
      })
    }
    
    return deserialized as T
  }

  /**
   * Busca um registro por ID
   */
  async findById(userId: string, id: string): Promise<T | null> {
    const items = await this.findAll(userId)
    return items.find(item => item.id === id) || null
  }

  /**
   * Salva/atualiza todos os registros
   */
  async save(userId: string, items: T[]): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Repository operations are only available in client-side')
    }
    
    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(items))
  }

  /**
   * Adiciona um novo registro
   */
  async create(userId: string, item: T): Promise<T> {
    const items = await this.findAll(userId)
    const newItem = { ...item, userId, id: item.id || this.generateId() }
    await this.save(userId, [...items, newItem])
    return newItem
  }

  /**
   * Atualiza um registro existente
   */
  async update(userId: string, id: string, updates: Partial<T>): Promise<T | null> {
    const items = await this.findAll(userId)
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return null
    
    const updatedItem = { ...items[index], ...updates }
    items[index] = updatedItem
    await this.save(userId, items)
    return updatedItem
  }

  /**
   * Remove um registro
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const items = await this.findAll(userId)
    const filtered = items.filter(item => item.id !== id)
    
    if (filtered.length === items.length) return false
    
    await this.save(userId, filtered)
    return true
  }

  /**
   * Remove todos os registros do usuário
   */
  async deleteAll(userId: string): Promise<void> {
    await this.save(userId, [])
  }

  /**
   * Gera um ID único
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
