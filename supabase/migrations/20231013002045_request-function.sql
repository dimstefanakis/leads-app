set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_monthly_chat_request_count(p_user_id text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.chat_requests
    WHERE user_id = p_user_id::UUID
      AND created_at >= date_trunc('month', current_date)
      AND created_at < date_trunc('month', current_date) + interval '1 month';
    
    RETURN v_count;
END;
$function$
;


