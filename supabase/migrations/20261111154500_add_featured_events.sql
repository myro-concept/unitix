CREATE TABLE public.featured_events (
  slot SMALLINT PRIMARY KEY CHECK (slot BETWEEN 1 AND 5),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.featured_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.featured_events TO authenticated;

ALTER TABLE public.featured_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view featured event slots"
  ON public.featured_events
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can feature live events"
  ON public.featured_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND EXISTS (
      SELECT 1
      FROM public.events
      WHERE events.id = featured_events.event_id
        AND events.status = 'live'::public.event_status
    )
  );

CREATE POLICY "Admins can update featured live events"
  ON public.featured_events
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    AND EXISTS (
      SELECT 1
      FROM public.events
      WHERE events.id = featured_events.event_id
        AND events.status = 'live'::public.event_status
    )
  );

CREATE POLICY "Admins can remove featured events"
  ON public.featured_events
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
