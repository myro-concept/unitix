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
          'attendee_email', it.attendee_email,
          'attendee_phone', it.attendee_phone,
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
