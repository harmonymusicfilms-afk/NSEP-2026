-- =============================================================================
-- CRITICAL FIX: Infinite Recursion in admin_users RLS Policy
-- Run this in Supabase SQL Editor
-- =============================================================================

-- STEP 1: Create a SECURITY DEFINER function to check admin status
-- This function bypasses RLS, so it won't cause infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 2: Create a SECURITY DEFINER function to check super admin status  
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- STEP 3: Fix admin_users table policies (remove recursion here first)
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view their own entry" ON public.admin_users;
DROP POLICY IF EXISTS "Super Admins can view all admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can upsert their own row" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update their own entry" ON public.admin_users;

-- Simple non-recursive policies for admin_users
CREATE POLICY "Admin can view own row"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super Admin can view all rows"
  ON public.admin_users FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Admin can insert own row"
  ON public.admin_users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can update own row"
  ON public.admin_users FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- STEP 4: Fix ALL other tables' admin policies to use is_admin() function
-- =============================================================================

-- students
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update students" ON public.students
  FOR UPDATE USING (public.is_admin());

-- center_rewards
DROP POLICY IF EXISTS "Admins can view all rewards" ON public.center_rewards;
CREATE POLICY "Admins can view all rewards" ON public.center_rewards
  FOR SELECT USING (public.is_admin());

-- wallets
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin());

-- exam_sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.exam_sessions;
CREATE POLICY "Admins can view all sessions" ON public.exam_sessions
  FOR SELECT USING (public.is_admin());

-- exam_questions
DROP POLICY IF EXISTS "Admins can manage questions" ON public.exam_questions;
CREATE POLICY "Admins can manage questions" ON public.exam_questions
  FOR ALL USING (public.is_admin());

-- contact_submissions
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (public.is_admin());

-- email_templates
DROP POLICY IF EXISTS "Admins can manage email system" ON public.email_templates;
CREATE POLICY "Admins can manage email system" ON public.email_templates
  FOR ALL USING (public.is_admin());

-- email_deliveries
DROP POLICY IF EXISTS "Admins can view deliveries" ON public.email_deliveries;
CREATE POLICY "Admins can view deliveries" ON public.email_deliveries
  FOR SELECT USING (public.is_admin());

-- batch_email_jobs
DROP POLICY IF EXISTS "Admins can manage batch jobs" ON public.batch_email_jobs;
CREATE POLICY "Admins can manage batch jobs" ON public.batch_email_jobs
  FOR ALL USING (public.is_admin());

-- gallery_items
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery_items;
CREATE POLICY "Admins can manage gallery" ON public.gallery_items
  FOR ALL USING (public.is_admin());

-- certificate_settings
DROP POLICY IF EXISTS "Admins can manage certificate settings" ON public.certificate_settings;
CREATE POLICY "Admins can manage certificate settings" ON public.certificate_settings
  FOR ALL USING (public.is_admin());

-- referral_codes policies (from previous fix)
DROP POLICY IF EXISTS "Admins can insert referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Admins can update referral codes" ON public.referral_codes;
CREATE POLICY "Admins can view referral codes" ON public.referral_codes
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update referral codes" ON public.referral_codes
  FOR UPDATE USING (public.is_admin());

-- referral_logs
DROP POLICY IF EXISTS "Admins can insert referral logs" ON public.referral_logs;
CREATE POLICY "Admins can view referral logs" ON public.referral_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert referral logs" ON public.referral_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- =============================================================================
-- DONE! The infinite recursion is now fixed.
-- =============================================================================
