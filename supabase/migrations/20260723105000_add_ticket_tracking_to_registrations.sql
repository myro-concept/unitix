-- Add ticket_type_id and quantity to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS ticket_type_id uuid REFERENCES public.ticket_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
-- Create trigger function to decrement ticket quantity on registration
CREATE OR REPLACE FUNCTION public.decrement_ticket_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_type_id IS NOT NULL THEN
    UPDATE public.ticket_types
    SET quantity = CASE 
      WHEN (quantity - NEW.quantity) < 0 THEN 0
      ELSE quantity - NEW.quantity
    END
    WHERE id = NEW.ticket_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS decrement_ticket_on_register ON public.registrations;
-- Create trigger that runs after registration is inserted
CREATE TRIGGER decrement_ticket_on_register
AFTER INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.decrement_ticket_quantity();
-- Update the register_for_event RPC to accept ticket_type_id
CREATE OR REPLACE FUNCTION public.register_for_event(
  p_event_id uuid,
  p_data jsonb,
  p_ticket_type_id uuid DEFAULT NULL,
  p_quantity integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM events WHERE id = p_event_id AND status = 'live'::event_status
  ) THEN
    RAISE EXCEPTION 'Event not found or not accepting registrations';
  END IF;

  IF p_ticket_type_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ticket_types 
      WHERE id = p_ticket_type_id AND event_id = p_event_id AND (quantity IS NULL OR quantity > 0)
    ) THEN
      RAISE EXCEPTION 'Ticket type not available or sold out';
    END IF;
  END IF;

  INSERT INTO registrations (event_id, data, ticket_type_id, quantity)
  VALUES (p_event_id, p_data, p_ticket_type_id, p_quantity)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
