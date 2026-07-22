-- ============================================================
-- Migration 002: Row Level Security Policies
-- Usando service_role key em Server Actions + user_id check
-- no código da aplicação. RLS serve como segunda camada.
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards   ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_bills     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plannings      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies: acesso isolado por user_id
-- Nota: a app usa service_role (bypassa RLS), mas as policies
-- ficam como defesa extra caso anon key seja usada no futuro.
-- ============================================================

-- expenses
DROP POLICY IF EXISTS "expenses_user_isolation" ON expenses;
CREATE POLICY "expenses_user_isolation" ON expenses
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- incomes
DROP POLICY IF EXISTS "incomes_user_isolation" ON incomes;
CREATE POLICY "incomes_user_isolation" ON incomes
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- credit_cards
DROP POLICY IF EXISTS "credit_cards_user_isolation" ON credit_cards;
CREATE POLICY "credit_cards_user_isolation" ON credit_cards
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- card_bills
DROP POLICY IF EXISTS "card_bills_user_isolation" ON card_bills;
CREATE POLICY "card_bills_user_isolation" ON card_bills
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- invoices
DROP POLICY IF EXISTS "invoices_user_isolation" ON invoices;
CREATE POLICY "invoices_user_isolation" ON invoices
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- invoice_items (herdado via invoice)
DROP POLICY IF EXISTS "invoice_items_user_isolation" ON invoice_items;
CREATE POLICY "invoice_items_user_isolation" ON invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );

-- plannings
DROP POLICY IF EXISTS "plannings_user_isolation" ON plannings;
CREATE POLICY "plannings_user_isolation" ON plannings
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));
