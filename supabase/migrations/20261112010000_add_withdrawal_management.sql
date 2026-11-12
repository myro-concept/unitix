CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organizer_name text NOT NULL,
  organizer_company text,
  organizer_email text NOT NULL,
  organizer_phone text,
  bank_name text,
  account_name text,
  account_number text,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  paid_by uuid REFERENCES auth.users(id),
  paid_reference text,
  CONSTRAINT withdrawal_paid_fields_match_status CHECK (
    (status = 'pending' AND paid_at IS NULL AND paid_by IS NULL)
    OR (status = 'paid' AND paid_at IS NOT NULL AND paid_by IS NOT NULL)
  )
);

CREATE UNIQUE INDEX withdrawal_requests_submission_key
  ON public.withdrawal_requests (organizer_id, submission_id);
CREATE INDEX withdrawal_requests_organizer_requested_idx
  ON public.withdrawal_requests (organizer_id, requested_at DESC);
CREATE INDEX withdrawal_requests_status_requested_idx
  ON public.withdrawal_requests (status, requested_at DESC);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.withdrawal_requests TO authenticated;

CREATE POLICY "Organizers and admins can view withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    organizer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_amount numeric,
  p_submission_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_user_metadata jsonb;
  v_full_name text;
  v_company text;
  v_gross_sales numeric;
  v_reserved_amount numeric;
  v_available_amount numeric;
  v_requested_amount numeric;
  v_request_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'A valid withdrawal amount is required';
  END IF;
  v_requested_amount := round(p_amount, 2);

  IF p_submission_id IS NULL THEN
    RAISE EXCEPTION 'A withdrawal request identifier is required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  SELECT id INTO v_request_id
  FROM public.withdrawal_requests
  WHERE organizer_id = v_user_id
    AND submission_id = p_submission_id;

  IF v_request_id IS NOT NULL THEN
    RETURN v_request_id;
  END IF;

  SELECT email, raw_user_meta_data
  INTO v_user_email, v_user_metadata
  FROM auth.users
  WHERE id = v_user_id;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Account email is unavailable';
  END IF;

  SELECT full_name, company
  INTO v_full_name, v_company
  FROM public.profiles
  WHERE id = v_user_id;

  SELECT COALESCE(sum(t.amount_paid), 0)
  INTO v_gross_sales
  FROM public.issued_tickets t
  JOIN public.events e ON e.id = t.event_id
  JOIN public.registrations r ON r.id = t.registration_id
  WHERE e.user_id = v_user_id
    AND t.status <> 'cancelled'
    AND r.status <> 'cancelled';

  SELECT COALESCE(sum(amount), 0)
  INTO v_reserved_amount
  FROM public.withdrawal_requests
  WHERE organizer_id = v_user_id
    AND status IN ('pending', 'paid');

  v_available_amount := GREATEST(
    0,
    v_gross_sales - round(v_gross_sales * 0.04) - v_reserved_amount
  );

  IF v_requested_amount > v_available_amount THEN
    RAISE EXCEPTION 'Withdrawal amount exceeds the available balance of %', v_available_amount;
  END IF;

  INSERT INTO public.withdrawal_requests (
    submission_id,
    organizer_id,
    organizer_name,
    organizer_company,
    organizer_email,
    organizer_phone,
    bank_name,
    account_name,
    account_number,
    amount
  )
  VALUES (
    p_submission_id,
    v_user_id,
    COALESCE(
      NULLIF(trim(v_full_name), ''),
      NULLIF(trim(v_user_metadata->>'full_name'), ''),
      NULLIF(trim(concat_ws(' ', v_user_metadata->>'first_name', v_user_metadata->>'last_name')), ''),
      v_user_email
    ),
    NULLIF(trim(v_company), ''),
    v_user_email,
    NULLIF(trim(v_user_metadata->>'phone'), ''),
    NULLIF(trim(v_user_metadata->>'bank_name'), ''),
    NULLIF(trim(v_user_metadata->>'account_name'), ''),
    NULLIF(trim(v_user_metadata->>'account_number'), ''),
    v_requested_amount
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_withdrawal_request(numeric, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_withdrawal_request(numeric, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_withdrawal_paid(
  p_request_id uuid,
  p_paid_reference text DEFAULT NULL
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
      paid_reference = NULLIF(trim(p_paid_reference), '')
  WHERE id = p_request_id
    AND status = 'pending'
  RETURNING id INTO v_request_id;

  IF v_request_id IS NULL THEN
    RAISE EXCEPTION 'Withdrawal request was not found or is already paid';
  END IF;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_withdrawal_paid(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_withdrawal_paid(uuid, text) TO authenticated;
