-- ===================================================================
-- FINAL FIX v4 - Run in Backend SQL Editor
-- Uses SET LOCAL row_security = off inside function to stop recursion
-- ===================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_users;
DROP POLICY IF EXISTS "Super Admins can manage admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can upsert their own row" ON public.admin_users;
DROP POLICY IF EXISTS "Admin can manage own row" ON public.admin_users;
DROP POLICY IF EXISTS "Admin can see own row" ON public.admin_users;

DROP POLICY IF EXISTS "Admins can manage referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Admins can insert referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Admins can update referral codes" ON public.referral_codes;

DROP POLICY IF EXISTS "Admins can manage referral logs" ON public.referral_logs;
DROP POLICY IF EXISTS "Admins can insert referral logs" ON public.referral_logs;

DROP POLICY IF EXISTS "Admins can manage centers" ON public.centers;
DROP POLICY IF EXISTS "Public/Students can view approved centers" ON public.centers;
DROP POLICY IF EXISTS "Public can view approved centers" ON public.centers;

-- Fix is_admin() - SET LOCAL row_security = off bypasses RLS inside function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE result BOOLEAN;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix is_super_admin() same way
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE result BOOLEAN;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- admin_users policies (use auth.uid() directly - NOT is_admin() to avoid recursion)
CREATE POLICY "Admin can see own row" ON public.admin_users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can manage own row" ON public.admin_users
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- referral_codes
CREATE POLICY "Admins can manage referral codes" ON public.referral_codes
FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- referral_logs
CREATE POLICY "Admins can manage referral logs" ON public.referral_logs
FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- centers
CREATE POLICY "Public can view approved centers" ON public.centers
FOR SELECT USING (status = 'APPROVED' OR public.is_admin());

CREATE POLICY "Admins can manage centers" ON public.centers
FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
