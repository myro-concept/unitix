ALTER TABLE public.withdrawal_requests
  ADD COLUMN receipt_path text;

DROP FUNCTION public.mark_withdrawal_paid(uuid, text);

CREATE OR REPLACE FUNCTION public.mark_withdrawal_paid(
  p_request_id uuid,
  p_paid_reference text DEFAULT NULL,
  p_receipt_path text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  IF auth.uid() IS NULL
    OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access is required';
  END IF;

  UPDATE public.withdrawal_requests
  SET status = 'paid',
      paid_at = now(),
      paid_by = auth.uid(),
      paid_reference = NULLIF(trim(p_paid_reference), ''),
      receipt_path = NULLIF(trim(p_receipt_path), '')
  WHERE id = p_request_id
    AND status = 'pending'
  RETURNING id INTO v_request_id;

  IF v_request_id IS NULL THEN
    RAISE EXCEPTION 'Withdrawal request was not found or is already paid';
  END IF;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_withdrawal_paid(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_withdrawal_paid(uuid, text, text) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'withdrawal-receipts',
  'withdrawal-receipts',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Admins can upload withdrawal receipts" ON storage.objects;
CREATE POLICY "Admins can upload withdrawal receipts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'withdrawal-receipts'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Admins can read withdrawal receipts" ON storage.objects;
CREATE POLICY "Admins can read withdrawal receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'withdrawal-receipts'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Admins can delete withdrawal receipts" ON storage.objects;
CREATE POLICY "Admins can delete withdrawal receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'withdrawal-receipts'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );
