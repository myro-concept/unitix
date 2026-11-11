CREATE TABLE public.ticket_checkin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  issued_ticket_id uuid REFERENCES public.issued_tickets(id) ON DELETE SET NULL,
  scanner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result text NOT NULL CHECK (result IN ('checked_in', 'already_used', 'cancelled', 'not_found')),
  scanned_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ticket_checkin_logs_event_scanned_idx
  ON public.ticket_checkin_logs (event_id, scanned_at DESC);
CREATE INDEX ticket_checkin_logs_scanner_scanned_idx
  ON public.ticket_checkin_logs (scanner_id, scanned_at DESC);

ALTER TABLE public.ticket_checkin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event owners can view ticket check-in logs"
  ON public.ticket_checkin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_checkin_logs.event_id
        AND e.user_id = auth.uid()
    )
  );

GRANT SELECT ON public.ticket_checkin_logs TO authenticated;

CREATE OR REPLACE FUNCTION public.record_invalid_ticket_scan(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scan_log_id uuid;
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

  INSERT INTO public.ticket_checkin_logs (event_id, scanner_id, result)
  VALUES (p_event_id, auth.uid(), 'not_found')
  RETURNING id INTO v_scan_log_id;

  RETURN jsonb_build_object('result', 'not_found', 'scan_id', v_scan_log_id);
END;
$$;

REVOKE ALL ON FUNCTION public.record_invalid_ticket_scan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_invalid_ticket_scan(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_in_ticket(p_event_id uuid, p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.issued_tickets%ROWTYPE;
  v_result text;
  v_scan_log_id uuid;
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

  UPDATE public.issued_tickets it
  SET status = 'used',
      checked_in_at = now()
  WHERE it.token = p_token
    AND it.event_id = p_event_id
    AND it.status = 'valid'
  RETURNING it.* INTO v_ticket;

  IF FOUND THEN
    v_result := 'checked_in';

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
    WHERE it.token = p_token
      AND it.event_id = p_event_id;

    IF NOT FOUND THEN
      v_result := 'not_found';
    ELSE
      v_result := CASE
        WHEN v_ticket.status = 'cancelled' THEN 'cancelled'
        ELSE 'already_used'
      END;
    END IF;
  END IF;

  INSERT INTO public.ticket_checkin_logs (
    event_id,
    issued_ticket_id,
    scanner_id,
    result
  )
  VALUES (
    p_event_id,
    CASE WHEN v_ticket.id IS NULL THEN NULL ELSE v_ticket.id END,
    auth.uid(),
    v_result
  )
  RETURNING id INTO v_scan_log_id;

  RETURN jsonb_build_object(
    'result', v_result,
    'scan_id', v_scan_log_id,
    'attendee_name', v_ticket.attendee_name,
    'ticket_type_name', v_ticket.ticket_type_name,
    'checked_in_at', v_ticket.checked_in_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_in_ticket(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_in_ticket(uuid, uuid) TO authenticated;
