-- =============================================================================
-- CRITICAL FIX: Infinite Recursion in admin_users RLS Policy (V2)
-- Run this in Backend SQL Editor
-- =============================================================================

-- 1. Create robust helper functions with SECURITY DEFINER
-- This allows them to bypass RLS when querying the tables they are defined on.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Clean up existing recursive policies on admin_users
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_users;
DROP POLICY IF EXISTS "Super Admins can manage admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view their own entry" ON public.admin_users;
DROP POLICY IF EXISTS "Super Admins can view all admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admin can view own row" ON public.admin_users;
DROP POLICY IF EXISTS "Super Admin can view all rows" ON public.admin_users;

-- 3. Create NON-RECURSIVE policies for admin_users table
-- Policy for SELECT: Admins can see themselves
CREATE POLICY "Admins can view own profile" 
  ON public.admin_users FOR SELECT 
  USING (auth.uid() = id);

-- Policy for SELECT: Super admins can see everyone
-- We use the SECURITY DEFINER function here which bypasses RLS
CREATE POLICY "Super admins can view all profiles" 
  ON public.admin_users FOR SELECT 
  USING (public.check_is_super_admin());

-- Policy for ALL (Insert/Update/Delete): Only Super Admins
CREATE POLICY "Super admins can manage all profiles" 
  ON public.admin_users FOR ALL 
  USING (public.check_is_super_admin());

-- 4. Update other tables to use the new helper functions
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can view all students V2" ON public.students
  FOR SELECT USING (public.check_is_admin());
CREATE POLICY "Admins can update students V2" ON public.students
  FOR UPDATE USING (public.check_is_admin());

DROP POLICY IF EXISTS "Public/Students can view approved centers" ON public.centers;
DROP POLICY IF EXISTS "Admins can manage centers" ON public.centers;
CREATE POLICY "Anyone can view approved centers" ON public.centers
  FOR SELECT USING (status = 'APPROVED' OR public.check_is_admin());
CREATE POLICY "Admins can manage centers V2" ON public.centers
  FOR ALL USING (public.check_is_admin());

-- 5. Ensure centers table has the right columns for the new requirements
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS user_photo_url text;

-- Done! This should resolve the infinite recursion error.
