-- ============================================================
-- Migration 001: Initial Schema
-- controle-gestao-financeira
-- ============================================================

-- 1. EXPENSES (cobre despesas gerais + assinaturas)
CREATE TABLE IF NOT EXISTS expenses (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  category        TEXT NOT NULL DEFAULT 'Outros',
  date            TEXT NOT NULL,   -- ISO date string YYYY-MM-DD
  status          TEXT CHECK (status IN ('paid', 'pending')) DEFAULT 'pending',
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('monthly', 'yearly')),
  due_date        TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  card_name       TEXT,
  person_name     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date    ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(user_id, category);

-- 2. INCOMES
CREATE TABLE IF NOT EXISTS incomes (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id           TEXT NOT NULL,
  description       TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  type              TEXT CHECK (type IN ('salary', 'extra')) NOT NULL DEFAULT 'extra',
  category          TEXT,
  date              TEXT NOT NULL,
  status            TEXT CHECK (status IN ('pending', 'received')) NOT NULL DEFAULT 'pending',
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_date     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date    ON incomes(date);

-- 3. CREDIT_CARDS
CREATE TABLE IF NOT EXISTS credit_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  nickname      TEXT NOT NULL,
  bank_name     TEXT NOT NULL,
  brand         TEXT NOT NULL CHECK (brand IN ('Visa','Mastercard','Elo','American Express','Hipercard','Outros')),
  last4_digits  CHAR(4) NOT NULL CHECK (last4_digits ~ '^\d{4}$'),
  closing_day   SMALLINT NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day       SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  credit_limit  NUMERIC(12,2),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);

-- 4. CARD_BILLS (sistema legado — sem FK para credit_cards)
CREATE TABLE IF NOT EXISTS card_bills (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT NOT NULL,
  card_name     TEXT NOT NULL,
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  date          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  divisions     JSONB NOT NULL DEFAULT '[]',
  items         JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_bills_user_id ON card_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_card_bills_date    ON card_bills(date);

-- 5. INVOICES (fatura vinculada a credit_cards)
CREATE TABLE IF NOT EXISTS invoices (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT NOT NULL,
  card_id       UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  month         SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          SMALLINT NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  closing_date  DATE NOT NULL,
  due_date      DATE NOT NULL,
  total_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, card_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_card_id ON invoices(card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_period  ON invoices(user_id, year, month);

-- 6. INVOICE_ITEMS (itens extraídos do array embutido)
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Outros',
  installment TEXT,
  notes       TEXT,   -- armazena "Pessoa: Eu\n..." para divisão por pessoa
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 7. PLANNINGS
CREATE TABLE IF NOT EXISTS plannings (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id             TEXT NOT NULL,
  name                TEXT NOT NULL,
  category            TEXT NOT NULL,
  target_amount       NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  start_date          TEXT NOT NULL,
  target_date         TEXT,
  status              TEXT NOT NULL DEFAULT 'planned'
                        CHECK (status IN ('planned','in_progress','completed','cancelled','delayed','at_risk')),
  notes               TEXT,
  linked_expense_ids  TEXT[] NOT NULL DEFAULT '{}',
  category_data       JSONB,
  creation_context    JSONB,
  simulation          JSONB,
  alerts              JSONB NOT NULL DEFAULT '[]',
  risk_level          TEXT NOT NULL DEFAULT 'low'
                        CHECK (risk_level IN ('low','medium','high','critical')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plannings_user_id ON plannings(user_id);
CREATE INDEX IF NOT EXISTS idx_plannings_status  ON plannings(user_id, status);

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_plannings_updated_at
  BEFORE UPDATE ON plannings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
