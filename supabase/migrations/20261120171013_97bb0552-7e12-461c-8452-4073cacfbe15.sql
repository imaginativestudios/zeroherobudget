CREATE OR REPLACE FUNCTION public.prevent_profile_subscription_field_changes()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;
  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_amount IS DISTINCT FROM OLD.subscription_amount
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
    RAISE EXCEPTION 'Subscription and billing fields cannot be modified by users';
  END IF;
  IF NEW.beta_access IS DISTINCT FROM OLD.beta_access
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Beta access cannot be modified by users';
  END IF;
  RETURN NEW;
END;
$function$;