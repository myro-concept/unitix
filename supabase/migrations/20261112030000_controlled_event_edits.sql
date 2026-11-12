ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS refund_policy text;

CREATE TABLE public.event_edit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changes jsonb NOT NULL
);

ALTER TABLE public.event_edit_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.event_edit_history TO authenticated;

CREATE POLICY "Organizers and admins can view event edit history"
  ON public.event_edit_history
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_edit_history.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update all events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.event_refund_policy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_policy text NOT NULL CHECK (
    length(trim(requested_policy)) > 0 AND length(requested_policy) <= 4000
  ),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  review_note text
);

CREATE UNIQUE INDEX event_refund_policy_one_pending_per_event
  ON public.event_refund_policy_requests (event_id)
  WHERE status = 'pending';

ALTER TABLE public.event_refund_policy_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.event_refund_policy_requests TO authenticated;
GRANT UPDATE ON public.event_refund_policy_requests TO authenticated;

CREATE POLICY "Organizers and admins can view refund policy requests"
  ON public.event_refund_policy_requests
  FOR SELECT
  TO authenticated
  USING (
    organizer_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "Organizers can request refund policy changes"
  ON public.event_refund_policy_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organizer_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_refund_policy_requests.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can review refund policy requests"
  ON public.event_refund_policy_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.record_event_edit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changes jsonb;
  v_actor_id uuid;
  v_actor_email text;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(
      old_value.key,
      jsonb_build_object('old', old_value.value, 'new', new_value.value)
    ),
    '{}'::jsonb
  )
  INTO v_changes
  FROM jsonb_each(to_jsonb(OLD)) AS old_value(key, value)
  JOIN jsonb_each(to_jsonb(NEW)) AS new_value(key, value) USING (key)
  WHERE old_value.value IS DISTINCT FROM new_value.value
    AND old_value.key <> 'updated_at';

  IF v_changes <> '{}'::jsonb THEN
    v_actor_id := COALESCE(
      auth.uid(),
      NULLIF(current_setting('app.event_edit_actor_id', true), '')::uuid
    );
    v_actor_email := COALESCE(
      auth.jwt()->>'email',
      NULLIF(current_setting('app.event_edit_actor_email', true), '')
    );
    INSERT INTO public.event_edit_history (event_id, actor_id, actor_email, changes)
    VALUES (NEW.id, v_actor_id, v_actor_email, v_changes);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER record_event_edit_history
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.record_event_edit();

CREATE OR REPLACE FUNCTION public.record_ticket_type_edit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_changes jsonb := '{}'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_event_id := NEW.event_id;
    v_changes := jsonb_build_object(
      'ticket_type', jsonb_build_object(
        'old', NULL,
        'new', jsonb_build_object('name', NEW.name, 'price', NEW.price, 'quantity', NEW.quantity)
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    v_changes := jsonb_build_object(
      'ticket_type', jsonb_build_object(
        'old', jsonb_build_object('name', OLD.name, 'price', OLD.price, 'quantity', OLD.quantity),
        'new', NULL
      )
    );
  ELSE
    v_event_id := NEW.event_id;
    IF NEW.name IS DISTINCT FROM OLD.name THEN
      v_changes := v_changes || jsonb_build_object(
        'ticket_name', jsonb_build_object('old', OLD.name, 'new', NEW.name)
      );
    END IF;
    IF NEW.price IS DISTINCT FROM OLD.price THEN
      v_changes := v_changes || jsonb_build_object(
        'ticket_price', jsonb_build_object('old', OLD.price, 'new', NEW.price)
      );
    END IF;
    IF NEW.quantity IS DISTINCT FROM OLD.quantity THEN
      v_changes := v_changes || jsonb_build_object(
        'ticket_quantity', jsonb_build_object('old', OLD.quantity, 'new', NEW.quantity)
      );
    END IF;
    IF v_changes <> '{}'::jsonb THEN
      v_changes := v_changes || jsonb_build_object(
        'ticket_type_name', jsonb_build_object('old', OLD.name, 'new', NEW.name)
      );
    END IF;
  END IF;

  IF v_changes <> '{}'::jsonb THEN
    INSERT INTO public.event_edit_history (event_id, actor_id, actor_email, changes)
    VALUES (v_event_id, auth.uid(), auth.jwt()->>'email', v_changes);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER record_ticket_type_edit_history
  AFTER INSERT OR UPDATE OR DELETE ON public.ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.record_ticket_type_edit();

ALTER TABLE public.ticket_types
  ADD CONSTRAINT ticket_types_quantity_nonnegative
  CHECK (quantity IS NULL OR quantity >= 0) NOT VALID;
ALTER TABLE public.ticket_types
  ADD CONSTRAINT ticket_types_price_nonnegative
  CHECK (price >= 0) NOT VALID;

CREATE OR REPLACE FUNCTION public.enforce_event_edit_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := public.has_role(auth.uid(), 'admin'::public.app_role);
  v_sold_count bigint;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT v_is_admin THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Event ownership cannot be changed';
    END IF;

    IF OLD.status = 'live'::public.event_status
      AND NEW.status = 'draft'::public.event_status THEN
      RAISE EXCEPTION 'Only an admin can cancel or unpublish a live event';
    END IF;

    IF NEW.refund_policy IS DISTINCT FROM OLD.refund_policy THEN
      RAISE EXCEPTION 'Refund policy changes require admin approval';
    END IF;

    IF (
      NEW.event_date IS DISTINCT FROM OLD.event_date
      OR NEW.event_end_date IS DISTINCT FROM OLD.event_end_date
    )
    AND current_setting('app.event_schedule_change', true) IS DISTINCT FROM 'approved'
    AND EXISTS (
      SELECT 1 FROM public.issued_tickets t
      WHERE t.event_id = OLD.id AND t.status <> 'cancelled'
    ) THEN
      RAISE EXCEPTION 'Use the schedule-change flow so ticket holders are notified';
    END IF;
  END IF;

  SELECT COALESCE(sum(r.quantity), 0)
  INTO v_sold_count
  FROM public.registrations r
  WHERE r.event_id = OLD.id
    AND r.status <> 'cancelled'::public.registration_status;

  IF NEW.capacity IS DISTINCT FROM OLD.capacity
    AND NEW.capacity IS NOT NULL
    AND NEW.capacity < v_sold_count THEN
    RAISE EXCEPTION 'Event capacity cannot be lower than tickets already sold (%)', v_sold_count;
  END IF;

  IF NEW.registration_limit IS DISTINCT FROM OLD.registration_limit
    AND NEW.registration_limit IS NOT NULL
    AND NEW.registration_limit < v_sold_count THEN
    RAISE EXCEPTION 'Registration limit cannot be lower than tickets already sold (%)', v_sold_count;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_event_edit_rules
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_event_edit_rules();

CREATE OR REPLACE FUNCTION public.enforce_event_insert_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
    AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
    AND NEW.refund_policy IS NOT NULL THEN
    RAISE EXCEPTION 'Refund policies require admin approval';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_event_insert_rules
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_event_insert_rules();

CREATE OR REPLACE FUNCTION public.update_event_schedule(
  p_event_id uuid,
  p_event_date timestamptz,
  p_event_end_date timestamptz,
  p_actor_id uuid,
  p_actor_email text
)
RETURNS public.events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.events%ROWTYPE;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service access is required';
  END IF;

  PERFORM set_config('app.event_schedule_change', 'approved', true);
  PERFORM set_config('app.event_edit_actor_id', p_actor_id::text, true);
  PERFORM set_config('app.event_edit_actor_email', COALESCE(p_actor_email, ''), true);

  UPDATE public.events
  SET event_date = p_event_date,
      event_end_date = p_event_end_date
  WHERE id = p_event_id
    AND user_id = p_actor_id
  RETURNING * INTO v_event;

  IF v_event.id IS NULL THEN
    RAISE EXCEPTION 'Event not found or access denied';
  END IF;

  RETURN v_event;
END;
$$;

REVOKE ALL ON FUNCTION public.update_event_schedule(uuid, timestamptz, timestamptz, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_event_schedule(uuid, timestamptz, timestamptz, uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.review_event_refund_policy_request(
  p_request_id uuid,
  p_decision text,
  p_review_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.event_refund_policy_requests%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL
    OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access is required';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;

  UPDATE public.event_refund_policy_requests
  SET status = p_decision,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      review_note = NULLIF(trim(p_review_note), '')
  WHERE id = p_request_id
    AND status = 'pending'
  RETURNING * INTO v_request;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Request was not found or has already been reviewed';
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE public.events
    SET refund_policy = v_request.requested_policy
    WHERE id = v_request.event_id;
  END IF;

  RETURN v_request.id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_event_refund_policy_request(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_event_refund_policy_request(uuid, text, text) TO authenticated;

DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
CREATE POLICY "Admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
