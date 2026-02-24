-- ===================================================================
-- COMPLETE ADMIN FIX - Run in Backend SQL Editor
-- This script fixing the 500 Errors (RLS Recursion) and 404 Errors (Missing RPCs)
-- ===================================================================

-- 1. DROP RECURSIVE FUNCTION AND POLICIES
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- 2. CREATE NON-RECURSIVE ADMIN CHECK FUNCTIONS
-- SECURITY DEFINER makes these functions run with bypass-RLS permissions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY POLICIES TO ALL TABLES (Ensuring Admins have full access)

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments" ON public.payments
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Students can view own payments" ON public.payments;
CREATE POLICY "Students can view own payments" ON public.payments
FOR SELECT USING (auth.uid() = student_id);

-- Students
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
CREATE POLICY "Admins can view all students" ON public.students
FOR ALL USING (public.is_admin());

-- Centers
DROP POLICY IF EXISTS "Admins can manage centers" ON public.centers;
CREATE POLICY "Admins can manage centers" ON public.centers
FOR ALL USING (public.is_admin());

-- Exam Sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.exam_sessions;
CREATE POLICY "Admins can view all sessions" ON public.exam_sessions
FOR SELECT USING (public.is_admin());

-- Referral Logs
DROP POLICY IF EXISTS "Admins can manage referral logs" ON public.referral_logs;
CREATE POLICY "Admins can manage referral logs" ON public.referral_logs
FOR ALL USING (public.is_admin());

-- 4. FIX MISSING RPC FUNCTIONS (404 ERRORS)

-- Dashboard Stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
    v_stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'totalStudents', (SELECT COUNT(*) FROM public.students),
        'activeStudents', (SELECT COUNT(*) FROM public.students WHERE status = 'ACTIVE'),
        'totalPayments', (SELECT COUNT(*) FROM public.payments),
        'successfulPayments', (SELECT COUNT(*) FROM public.payments WHERE status = 'SUCCESS'),
        'totalRevenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'SUCCESS'),
        'examsCompleted', (SELECT COUNT(*) FROM public.exam_sessions WHERE status = 'COMPLETED'),
        'certificatesIssued', (SELECT COUNT(*) FROM public.certificates),
        'pendingScholarships', (SELECT COUNT(*) FROM public.scholarships WHERE approval_status = 'PENDING'),
        'totalCenterRewards', (SELECT COALESCE(SUM(reward_amount), 0) FROM public.center_rewards WHERE status = 'CREDITED')
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Class Wise Stats
CREATE OR REPLACE FUNCTION public.get_class_wise_stats()
RETURNS SETOF jsonb AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'class', class_level,
        'studentCount', count(*),
        'examsTaken', (SELECT COUNT(*) FROM public.exam_results WHERE class_level = s.class_level),
        'avgScore', (SELECT COALESCE(AVG(total_score), 0) FROM public.exam_results WHERE class_level = s.class_level),
        'topScore', (SELECT COALESCE(MAX(total_score), 0) FROM public.exam_results WHERE class_level = s.class_level)
    )
    FROM public.students s
    GROUP BY class_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENSURE APP-USER (Center Registration) WORKS
DROP POLICY IF EXISTS "Public can register center" ON public.centers;
CREATE POLICY "Public can register center" ON public.centers
FOR INSERT WITH CHECK (true);
