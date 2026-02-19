-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Students Policies
CREATE POLICY "Students can insert their own profile" ON public.students
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can view their own profile" ON public.students
FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Students can update their own profile" ON public.students
FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 2. Admin Users Policies
CREATE POLICY "Admins can view admin profiles" ON public.admin_users
FOR SELECT USING (public.is_admin());

CREATE POLICY "Super Admins can manage admins" ON public.admin_users
FOR ALL USING (public.is_super_admin());

-- 3. Centers Policies
CREATE POLICY "Public/Students can view approved centers" ON public.centers
FOR SELECT USING (status = 'APPROVED' OR public.is_admin());

CREATE POLICY "Admins can manage centers" ON public.centers
FOR ALL USING (public.is_admin());

-- 4. Payments Policies
CREATE POLICY "Students can create payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

-- 5. Exam Questions Policies
CREATE POLICY "Students can view questions during exam" ON public.exam_questions
FOR SELECT TO authenticated USING (true); -- Ideally restrict to active session, but keep simple for now

CREATE POLICY "Admins can manage questions" ON public.exam_questions
FOR ALL USING (public.is_admin());

-- 6. Exam Sessions Policies
CREATE POLICY "Students can start exam session" ON public.exam_sessions
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view update their session" ON public.exam_sessions
FOR ALL USING (auth.uid() = student_id OR public.is_admin());

-- 7. Exam Answers/Results Policies
CREATE POLICY "Students can submit answers" ON public.exam_answers
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exam_sessions 
    WHERE id = session_id AND student_id = auth.uid()
  )
);

CREATE POLICY "Students can view their results" ON public.exam_results
FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

-- 8. Certificates Policies
CREATE POLICY "Certificates are viewable by owner and admins" ON public.certificates
FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

-- 9. Admin Logs Policies
CREATE POLICY "Admins can view logs" ON public.admin_logs
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert logs" ON public.admin_logs
FOR INSERT WITH CHECK (public.is_admin());

-- 10. Referral Codes
CREATE POLICY "Authenticated users can view referral codes" ON public.referral_codes
FOR SELECT TO authenticated USING (true);
