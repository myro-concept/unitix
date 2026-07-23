-- Make form_fields writes explicit and owner-based for the event row.
DROP POLICY IF EXISTS "Public can view form fields for live events" ON public.form_fields;
DROP POLICY IF EXISTS "Users can manage form fields via event ownership" ON public.form_fields;
DROP POLICY IF EXISTS "Users can insert form fields via event ownership" ON public.form_fields;
DROP POLICY IF EXISTS "Users can update form fields via event ownership" ON public.form_fields;
DROP POLICY IF EXISTS "Users can delete form fields via event ownership" ON public.form_fields;

CREATE POLICY "Public can view form fields for live events"
  ON public.form_fields
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = form_fields.event_id
        AND e.status = 'live'::public.event_status
    )
  );

CREATE POLICY "Users can insert form fields via event ownership"
  ON public.form_fields
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = form_fields.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update form fields via event ownership"
  ON public.form_fields
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = form_fields.event_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = form_fields.event_id
        AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete form fields via event ownership"
  ON public.form_fields
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = form_fields.event_id
        AND e.user_id = auth.uid()
    )
  );
