-- ============================================================
-- Migration 003: Atomic update of invoice items
-- Substitui delete + insert por operação transactional via RPC
-- ============================================================

-- RPC function to replace invoice items atomically
CREATE OR REPLACE FUNCTION replace_invoice_items(
  p_invoice_id TEXT,
  p_items JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM invoice_items WHERE invoice_id = p_invoice_id;

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
