ALTER TABLE public.issued_tickets
  ADD COLUMN ticket_code text;

CREATE OR REPLACE FUNCTION public.assign_issued_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  IF NEW.ticket_code IS NOT NULL AND NEW.ticket_code <> '' THEN
    RETURN NEW;
  END IF;

  LOOP
    v_code := 'UT-' || upper(encode(extensions.gen_random_bytes(9), 'hex'));
    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.issued_tickets it
      WHERE it.ticket_code = v_code
    );
  END LOOP;

  NEW.ticket_code := v_code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_issued_ticket_code
BEFORE INSERT ON public.issued_tickets
FOR EACH ROW
EXECUTE FUNCTION public.assign_issued_ticket_code();

DO $$
DECLARE
  v_ticket_id uuid;
  v_code text;
BEGIN
  FOR v_ticket_id IN
    SELECT id
    FROM public.issued_tickets
    WHERE ticket_code IS NULL
  LOOP
    LOOP
      v_code := 'UT-' || upper(encode(extensions.gen_random_bytes(9), 'hex'));
      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM public.issued_tickets it
        WHERE it.ticket_code = v_code
      );
    END LOOP;

    UPDATE public.issued_tickets
    SET ticket_code = v_code
    WHERE id = v_ticket_id;
  END LOOP;
END;
$$;

ALTER TABLE public.issued_tickets
  ALTER COLUMN ticket_code SET NOT NULL;

CREATE UNIQUE INDEX issued_tickets_ticket_code_key
  ON public.issued_tickets (ticket_code);

CREATE OR REPLACE FUNCTION public.get_tickets_by_tokens(p_tokens uuid[])
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(cardinality(p_tokens), 0) < 1
    OR cardinality(p_tokens) > 99 THEN
    RAISE EXCEPTION 'Between 1 and 99 ticket tokens are required';
  END IF;

  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', it.id,
          'token', it.token,
          'ticket_code', it.ticket_code,
          'attendee_name', it.attendee_name,
          'ticket_type_name', it.ticket_type_name,
          'amount_paid', it.amount_paid,
          'status', it.status,
          'event_name', e.name,
          'event_date', e.event_date,
          'location', e.location_value,
          'event_image', e.background_image_url
        )
        ORDER BY it.created_at
      ),
      '[]'::jsonb
    )
    FROM public.issued_tickets it
    JOIN public.events e ON e.id = it.event_id
    WHERE it.token = ANY(p_tokens)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_in_ticket_by_code(
  p_event_id uuid,
  p_ticket_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to check in tickets';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = p_event_id
      AND e.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You do not have permission to check in tickets for this event';
  END IF;

  SELECT it.token
  INTO v_token
  FROM public.issued_tickets it
  WHERE it.event_id = p_event_id
    AND it.ticket_code = upper(trim(p_ticket_code));

  IF NOT FOUND THEN
    RETURN public.record_invalid_ticket_scan(p_event_id);
  END IF;

  RETURN public.check_in_ticket(p_event_id, v_token);
END;
$$;

REVOKE ALL ON FUNCTION public.check_in_ticket_by_code(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in_ticket_by_code(uuid, text) TO authenticated;
