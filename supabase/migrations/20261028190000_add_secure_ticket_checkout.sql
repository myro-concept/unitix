ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_reference text;

CREATE UNIQUE INDEX IF NOT EXISTS registrations_payment_reference_key
  ON public.registrations (payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.issued_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE SET NULL,
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  attendee_phone text NOT NULL DEFAULT '',
  ticket_type_name text NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'valid'
    CHECK (status IN ('valid', 'used', 'cancelled')),
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS issued_tickets_event_id_idx
  ON public.issued_tickets (event_id);
CREATE INDEX IF NOT EXISTS issued_tickets_registration_id_idx
  ON public.issued_tickets (registration_id);

ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event owners can view issued tickets" ON public.issued_tickets;
CREATE POLICY "Event owners can view issued tickets"
  ON public.issued_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = issued_tickets.event_id
        AND e.user_id = auth.uid()
    )
  );

GRANT SELECT ON public.issued_tickets TO authenticated;

CREATE OR REPLACE FUNCTION public.decrement_ticket_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity integer;
BEGIN
  IF NEW.ticket_type_id IS NOT NULL THEN
    UPDATE public.ticket_types
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.ticket_type_id
      AND quantity IS NOT NULL
      AND quantity >= NEW.quantity;

    IF NOT FOUND THEN
      SELECT quantity
      INTO v_quantity
      FROM public.ticket_types
      WHERE id = NEW.ticket_type_id;

      IF v_quantity IS NOT NULL THEN
        RAISE EXCEPTION 'Not enough tickets available';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_ticket_checkout(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_ticket_name text,
  p_verified_unit_price numeric,
  p_quantity integer,
  p_registration_data jsonb,
  p_attendees jsonb,
  p_payment_reference text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.events%ROWTYPE;
  v_ticket public.ticket_types%ROWTYPE;
  v_registration_id uuid;
  v_existing_event_id uuid;
  v_existing_quantity integer;
  v_existing_ticket_type_id uuid;
  v_existing_contact_email text;
  v_existing_attendees jsonb;
  v_ticket_name text;
  v_unit_price numeric;
  v_current_count bigint;
  v_attendee jsonb;
  v_attendee_name text;
  v_result jsonb;
BEGIN
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 99 THEN
    RAISE EXCEPTION 'Ticket quantity must be between 1 and 99';
  END IF;

  IF jsonb_typeof(p_attendees) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Attendee details must be provided for every ticket';
  END IF;

  IF jsonb_array_length(p_attendees) <> p_quantity THEN
    RAISE EXCEPTION 'Attendee details must be provided for every ticket';
  END IF;

  IF p_registration_data IS NULL
    OR octet_length(p_registration_data::text) > 65536 THEN
    RAISE EXCEPTION 'Registration data is missing or too large';
  END IF;

  IF p_payment_reference IS NOT NULL THEN
    SELECT id, event_id, quantity, ticket_type_id, data->>'Contact Email', data->'Attendees'
    INTO v_registration_id, v_existing_event_id, v_existing_quantity,
      v_existing_ticket_type_id, v_existing_contact_email, v_existing_attendees
    FROM public.registrations
    WHERE payment_reference = p_payment_reference;

    IF v_registration_id IS NOT NULL THEN
      IF v_existing_event_id <> p_event_id
        OR v_existing_quantity <> p_quantity
        OR v_existing_ticket_type_id IS DISTINCT FROM p_ticket_type_id
        OR lower(COALESCE(v_existing_contact_email, ''))
          <> lower(COALESCE(p_registration_data->>'Contact Email', ''))
        OR v_existing_attendees IS DISTINCT FROM p_registration_data->'Attendees' THEN
        RAISE EXCEPTION 'Payment reference has already been used';
      END IF;

      SELECT jsonb_build_object(
        'registration_id', v_registration_id,
        'tickets', COALESCE(
          jsonb_agg(jsonb_build_object('token', it.token, 'id', it.id)),
          '[]'::jsonb
        )
      )
      INTO v_result
      FROM public.issued_tickets it
      WHERE it.registration_id = v_registration_id;

      RETURN v_result;
    END IF;
  END IF;

  SELECT *
  INTO v_event
  FROM public.events
  WHERE id = p_event_id
    AND status = 'live'::public.event_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or not accepting registrations';
  END IF;

  IF p_payment_reference IS NOT NULL THEN
    SELECT id, event_id, quantity, ticket_type_id, data->>'Contact Email', data->'Attendees'
    INTO v_registration_id, v_existing_event_id, v_existing_quantity,
      v_existing_ticket_type_id, v_existing_contact_email, v_existing_attendees
    FROM public.registrations
    WHERE payment_reference = p_payment_reference;

    IF v_registration_id IS NOT NULL THEN
      IF v_existing_event_id <> p_event_id
        OR v_existing_quantity <> p_quantity
        OR v_existing_ticket_type_id IS DISTINCT FROM p_ticket_type_id
        OR lower(COALESCE(v_existing_contact_email, ''))
          <> lower(COALESCE(p_registration_data->>'Contact Email', ''))
        OR v_existing_attendees IS DISTINCT FROM p_registration_data->'Attendees' THEN
        RAISE EXCEPTION 'Payment reference has already been used';
      END IF;

      SELECT jsonb_build_object(
        'registration_id', v_registration_id,
        'tickets', COALESCE(
          jsonb_agg(jsonb_build_object('token', it.token, 'id', it.id)),
          '[]'::jsonb
        )
      )
      INTO v_result
      FROM public.issued_tickets it
      WHERE it.registration_id = v_registration_id;

      RETURN v_result;
    END IF;
  END IF;

  IF v_event.registration_deadline IS NOT NULL
    AND now() > v_event.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  IF p_ticket_type_id IS NOT NULL THEN
    SELECT *
    INTO v_ticket
    FROM public.ticket_types
    WHERE id = p_ticket_type_id
      AND event_id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ticket type not found for this event';
    END IF;

    IF v_ticket.quantity IS NOT NULL AND v_ticket.quantity < p_quantity THEN
      RAISE EXCEPTION 'Not enough tickets available';
    END IF;

    v_ticket_name := v_ticket.name;
    v_unit_price := v_ticket.price;
  ELSE
    v_ticket_name := NULLIF(trim(p_ticket_name), '');
    v_unit_price := COALESCE(v_event.ticket_price, 0);

    IF v_ticket_name IS NULL THEN
      RAISE EXCEPTION 'Ticket name is required';
    END IF;
  END IF;

  IF p_verified_unit_price IS NULL OR v_unit_price <> p_verified_unit_price THEN
    RAISE EXCEPTION 'Ticket price changed during checkout; please try again';
  END IF;

  SELECT COALESCE(sum(quantity), 0)
  INTO v_current_count
  FROM public.registrations
  WHERE event_id = p_event_id
    AND status <> 'cancelled'::public.registration_status;

  IF v_event.capacity IS NOT NULL
    AND v_current_count + p_quantity > v_event.capacity THEN
    RAISE EXCEPTION 'Event does not have enough capacity';
  END IF;

  IF v_event.registration_limit IS NOT NULL
    AND v_current_count + p_quantity > v_event.registration_limit THEN
    RAISE EXCEPTION 'Registration limit would be exceeded';
  END IF;

  INSERT INTO public.registrations (
    event_id,
    data,
    ticket_type_id,
    quantity,
    payment_reference
  )
  VALUES (
    p_event_id,
    p_registration_data,
    p_ticket_type_id,
    p_quantity,
    p_payment_reference
  )
  RETURNING id INTO v_registration_id;

  FOR v_attendee IN SELECT value FROM jsonb_array_elements(p_attendees)
  LOOP
    IF NULLIF(trim(v_attendee->>'first_name'), '') IS NULL
      OR NULLIF(trim(v_attendee->>'last_name'), '') IS NULL
      OR NULLIF(trim(v_attendee->>'email'), '') IS NULL
      OR position('@' IN trim(v_attendee->>'email')) < 2 THEN
      RAISE EXCEPTION 'Every ticket must have an attendee name and valid email';
    END IF;

    v_attendee_name := trim(v_attendee->>'first_name')
      || ' ' || trim(v_attendee->>'last_name');

    INSERT INTO public.issued_tickets (
      registration_id,
      event_id,
      ticket_type_id,
      attendee_name,
      attendee_email,
      attendee_phone,
      ticket_type_name,
      amount_paid
    )
    VALUES (
      v_registration_id,
      p_event_id,
      p_ticket_type_id,
      v_attendee_name,
      trim(v_attendee->>'email'),
      COALESCE(trim(v_attendee->>'phone'), ''),
      v_ticket_name,
      v_unit_price
    );
  END LOOP;

  SELECT jsonb_build_object(
    'registration_id', v_registration_id,
    'tickets', COALESCE(
      jsonb_agg(jsonb_build_object('token', it.token, 'id', it.id)),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM public.issued_tickets it
  WHERE it.registration_id = v_registration_id;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_ticket_checkout(
  uuid, uuid, text, numeric, integer, jsonb, jsonb, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_ticket_checkout(
  uuid, uuid, text, numeric, integer, jsonb, jsonb, text
) TO service_role;

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

REVOKE ALL ON FUNCTION public.get_tickets_by_tokens(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tickets_by_tokens(uuid[]) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_in_ticket(p_event_id uuid, p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.issued_tickets%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to check in tickets';
  END IF;

  UPDATE public.issued_tickets it
  SET status = 'used',
      checked_in_at = now()
  WHERE it.token = p_token
    AND it.event_id = p_event_id
    AND it.status = 'valid'
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = it.event_id
        AND e.user_id = auth.uid()
    )
  RETURNING it.* INTO v_ticket;

  IF FOUND THEN
    UPDATE public.registrations r
    SET status = 'checked_in'::public.registration_status
    WHERE r.id = v_ticket.registration_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.issued_tickets other
        WHERE other.registration_id = r.id
          AND other.status <> 'used'
      );
  ELSE
    SELECT it.*
    INTO v_ticket
    FROM public.issued_tickets it
    JOIN public.events e ON e.id = it.event_id
    WHERE it.token = p_token
      AND it.event_id = p_event_id
      AND e.user_id = auth.uid();

    IF NOT FOUND THEN
      RETURN jsonb_build_object('result', 'not_found');
    END IF;

    RETURN jsonb_build_object(
      'result', CASE WHEN v_ticket.status = 'cancelled' THEN 'cancelled' ELSE 'already_used' END,
      'attendee_name', v_ticket.attendee_name,
      'ticket_type_name', v_ticket.ticket_type_name,
      'checked_in_at', v_ticket.checked_in_at
    );
  END IF;

  RETURN jsonb_build_object(
    'result', 'checked_in',
    'attendee_name', v_ticket.attendee_name,
    'ticket_type_name', v_ticket.ticket_type_name,
    'checked_in_at', v_ticket.checked_in_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_in_ticket(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(uuid, uuid) TO authenticated;