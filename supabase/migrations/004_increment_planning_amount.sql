CREATE OR REPLACE FUNCTION increment_planning_amount(
  p_user_id TEXT,
  p_planning_id TEXT,
  p_amount NUMERIC
)
RETURNS SETOF plannings
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE plannings
  SET current_amount = current_amount + p_amount,
      updated_at = NOW()
  WHERE id = p_planning_id
    AND user_id = p_user_id
    AND p_amount > 0
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION increment_planning_amount(TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_planning_amount(TEXT, TEXT, NUMERIC) TO service_role;
