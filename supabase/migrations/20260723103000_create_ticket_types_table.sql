-- Create ticket_types table used by event publishing and checkout.
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view ticket types for live events" ON public.ticket_types;
DROP POLICY IF EXISTS "Users can manage ticket types via event ownership" ON public.ticket_types;
DROP POLICY IF EXISTS "Users can insert ticket types via event ownership" ON public.ticket_types;
DROP POLICY IF EXISTS "Users can update ticket types via event ownership" ON public.ticket_types;
DROP POLICY IF EXISTS "Users can delete ticket types via event ownership" ON public.ticket_types;

CREATE POLICY "Public can view ticket types for live events"
  ON public.ticket_types
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_types.event_id
        AND e.status = 'live'::public.event_status
    )
  );

CREATE POLICY "Users can insert ticket types via event ownership"
  ON public.ticket_types
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_types.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ticket types via event ownership"
  ON public.ticket_types
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_types.event_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_types.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ticket types via event ownership"
  ON public.ticket_types
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = ticket_types.event_id
        AND e.user_id = auth.uid()
    )
  );
