DROP TRIGGER IF EXISTS decrement_ticket_on_register ON public.registrations;

CREATE TRIGGER decrement_ticket_on_register
AFTER INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.decrement_ticket_quantity();

WITH registered_sales AS (
  SELECT ticket_type_id, SUM(quantity)::integer AS quantity
  FROM public.registrations
  WHERE ticket_type_id IS NOT NULL
    AND status <> 'cancelled'::public.registration_status
  GROUP BY ticket_type_id
)
UPDATE public.ticket_types AS ticket
SET quantity = GREATEST(ticket.quantity - registered_sales.quantity, 0)
FROM registered_sales
WHERE ticket.id = registered_sales.ticket_type_id
  AND ticket.quantity IS NOT NULL;
