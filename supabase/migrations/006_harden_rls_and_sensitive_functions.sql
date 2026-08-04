-- ============================================================
-- Migration 006: Harden RLS and sensitive RPC authorization
-- Usa JWT quando disponível e mantém compatibilidade com service_role.
-- ============================================================

CREATE OR REPLACE FUNCTION current_request_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'sub', ''),
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('app.current_user_id', true), '')
  )::TEXT;
$$;

-- Reforça RLS para instalações existentes e adiciona WITH CHECK nos writes.
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
ALTER TABLE incomes FORCE ROW LEVEL SECURITY;
ALTER TABLE credit_cards FORCE ROW LEVEL SECURITY;
ALTER TABLE card_bills FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE invoice_items FORCE ROW LEVEL SECURITY;
ALTER TABLE plannings FORCE ROW LEVEL SECURITY;

-- expenses
DROP POLICY IF EXISTS "expenses_user_isolation" ON expenses;
DROP POLICY IF EXISTS "expenses_select_own" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_own" ON expenses;
DROP POLICY IF EXISTS "expenses_update_own" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_own" ON expenses;

CREATE POLICY "expenses_select_own" ON expenses
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "expenses_insert_own" ON expenses
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "expenses_update_own" ON expenses
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "expenses_delete_own" ON expenses
  FOR DELETE USING (user_id = current_request_user_id());

-- incomes
DROP POLICY IF EXISTS "incomes_user_isolation" ON incomes;
DROP POLICY IF EXISTS "incomes_select_own" ON incomes;
DROP POLICY IF EXISTS "incomes_insert_own" ON incomes;
DROP POLICY IF EXISTS "incomes_update_own" ON incomes;
DROP POLICY IF EXISTS "incomes_delete_own" ON incomes;

CREATE POLICY "incomes_select_own" ON incomes
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "incomes_insert_own" ON incomes
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "incomes_update_own" ON incomes
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "incomes_delete_own" ON incomes
  FOR DELETE USING (user_id = current_request_user_id());

-- credit_cards
DROP POLICY IF EXISTS "credit_cards_user_isolation" ON credit_cards;
DROP POLICY IF EXISTS "credit_cards_select_own" ON credit_cards;
DROP POLICY IF EXISTS "credit_cards_insert_own" ON credit_cards;
DROP POLICY IF EXISTS "credit_cards_update_own" ON credit_cards;
DROP POLICY IF EXISTS "credit_cards_delete_own" ON credit_cards;

CREATE POLICY "credit_cards_select_own" ON credit_cards
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "credit_cards_insert_own" ON credit_cards
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "credit_cards_update_own" ON credit_cards
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "credit_cards_delete_own" ON credit_cards
  FOR DELETE USING (user_id = current_request_user_id());

-- card_bills
DROP POLICY IF EXISTS "card_bills_user_isolation" ON card_bills;
DROP POLICY IF EXISTS "card_bills_select_own" ON card_bills;
DROP POLICY IF EXISTS "card_bills_insert_own" ON card_bills;
DROP POLICY IF EXISTS "card_bills_update_own" ON card_bills;
DROP POLICY IF EXISTS "card_bills_delete_own" ON card_bills;

CREATE POLICY "card_bills_select_own" ON card_bills
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "card_bills_insert_own" ON card_bills
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "card_bills_update_own" ON card_bills
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "card_bills_delete_own" ON card_bills
  FOR DELETE USING (user_id = current_request_user_id());

-- invoices
DROP POLICY IF EXISTS "invoices_user_isolation" ON invoices;
DROP POLICY IF EXISTS "invoices_select_own" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON invoices;
DROP POLICY IF EXISTS "invoices_update_own" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_own" ON invoices;

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "invoices_insert_own" ON invoices
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "invoices_update_own" ON invoices
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "invoices_delete_own" ON invoices
  FOR DELETE USING (user_id = current_request_user_id());

-- invoice_items
DROP POLICY IF EXISTS "invoice_items_user_isolation" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_select_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_own" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_own" ON invoice_items;

CREATE POLICY "invoice_items_select_own" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = current_request_user_id()
    )
  );

CREATE POLICY "invoice_items_insert_own" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = current_request_user_id()
    )
  );

CREATE POLICY "invoice_items_update_own" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = current_request_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = current_request_user_id()
    )
  );

CREATE POLICY "invoice_items_delete_own" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = current_request_user_id()
    )
  );

-- plannings
DROP POLICY IF EXISTS "plannings_user_isolation" ON plannings;
DROP POLICY IF EXISTS "plannings_select_own" ON plannings;
DROP POLICY IF EXISTS "plannings_insert_own" ON plannings;
DROP POLICY IF EXISTS "plannings_update_own" ON plannings;
DROP POLICY IF EXISTS "plannings_delete_own" ON plannings;

CREATE POLICY "plannings_select_own" ON plannings
  FOR SELECT USING (user_id = current_request_user_id());

CREATE POLICY "plannings_insert_own" ON plannings
  FOR INSERT WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "plannings_update_own" ON plannings
  FOR UPDATE USING (user_id = current_request_user_id())
  WITH CHECK (user_id = current_request_user_id());

CREATE POLICY "plannings_delete_own" ON plannings
  FOR DELETE USING (user_id = current_request_user_id());

CREATE OR REPLACE FUNCTION increment_planning_amount(
  p_user_id TEXT,
  p_planning_id TEXT,
  p_amount NUMERIC
)
RETURNS SETOF plannings
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_request_user_id TEXT := current_request_user_id();
BEGIN
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  IF current_user <> 'service_role' AND v_request_user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'User mismatch';
  END IF;

  RETURN QUERY
  UPDATE plannings
  SET current_amount = current_amount + p_amount,
      updated_at = NOW()
  WHERE id = p_planning_id
    AND user_id = p_user_id
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION increment_planning_amount(TEXT, TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_planning_amount(TEXT, TEXT, NUMERIC) TO service_role;

CREATE OR REPLACE FUNCTION replace_invoice_items(
  p_user_id TEXT,
  p_invoice_id TEXT,
  p_items JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_request_user_id TEXT := current_request_user_id();
BEGIN
  IF current_user <> 'service_role' AND v_request_user_id IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'User mismatch';
  END IF;

  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'p_items must be a JSON array';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM invoices
    WHERE id = p_invoice_id
      AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Invoice not found or access denied';
  END IF;

  DELETE FROM invoice_items
  WHERE invoice_id = p_invoice_id;

  IF jsonb_array_length(p_items) > 0 THEN
    INSERT INTO invoice_items (id, invoice_id, date, description, amount, category, installment, notes)
    SELECT
      (item->>'id')::UUID,
      p_invoice_id,
      (item->>'date')::DATE,
      item->>'description',
      (item->>'amount')::NUMERIC(12,2),
      COALESCE(item->>'category', 'Outros'),
      item->>'installment',
      item->>'notes'
    FROM jsonb_array_elements(p_items) AS item;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION replace_invoice_items(TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION replace_invoice_items(TEXT, TEXT, JSONB) TO service_role;

DROP FUNCTION IF EXISTS replace_invoice_items(TEXT, JSONB);
