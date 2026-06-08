/**
 * Supabase Database Types
 * Tipagem das tabelas do banco de dados
 */

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          date: string
          status: 'paid' | 'pending' | null
          is_recurring: boolean | null
          recurring_frequency: 'monthly' | 'yearly' | null
          due_date: string | null
          is_active: boolean | null
          notes: string | null
          card_name: string | null
          person_name: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          type: 'salary' | 'extra'
          category: string | null
          date: string
          status: 'pending' | 'received'
          registration_date: string
          received_date: string | null
        }
        Insert: Omit<Database['public']['Tables']['incomes']['Row'], 'id' | 'registration_date'> & {
          id?: string
          registration_date?: string
        }
        Update: Partial<Database['public']['Tables']['incomes']['Insert']>
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          nickname: string
          bank_name: string
          brand: 'Visa' | 'Mastercard' | 'Elo' | 'American Express' | 'Hipercard' | 'Outros'
          last4_digits: string
          closing_day: number
          due_day: number
          credit_limit: number | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['credit_cards']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['credit_cards']['Insert']>
      }
      card_bills: {
        Row: {
          id: string
          user_id: string
          card_name: string
          total_amount: number
          date: string
          description: string
          divisions: unknown
          items: unknown
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['card_bills']['Row'], 'id' | 'created_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['card_bills']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          card_id: string
          month: number
          year: number
          closing_date: string
          due_date: string
          total_amount: number
          paid_amount: number
          is_paid: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          date: string
          description: string
          amount: number
          category: string
          installment: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>
      }
      plannings: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          target_amount: number
          current_amount: number
          start_date: string
          target_date: string | null
          status: string
          notes: string | null
          linked_expense_ids: string[]
          category_data: unknown | null
          creation_context: unknown | null
          simulation: unknown | null
          alerts: unknown
          risk_level: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['plannings']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['plannings']['Insert']>
      }
    }
  }
}
