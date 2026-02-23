-- ============================================
-- FIX: Add ON DELETE CASCADE to all foreign keys
-- referencing the students table
-- This allows admin to delete student profiles
-- without foreign key constraint errors
-- ============================================

-- 1. PAYMENTS table
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_student_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 2. EXAM_RESULTS table
ALTER TABLE public.exam_results
  DROP CONSTRAINT IF EXISTS exam_results_student_id_fkey;
ALTER TABLE public.exam_results
  ADD CONSTRAINT exam_results_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 3. EXAM_SESSIONS table
ALTER TABLE public.exam_sessions
  DROP CONSTRAINT IF EXISTS exam_sessions_student_id_fkey;
ALTER TABLE public.exam_sessions
  ADD CONSTRAINT exam_sessions_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 4. CERTIFICATES table
ALTER TABLE public.certificates
  DROP CONSTRAINT IF EXISTS certificates_student_id_fkey;
ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 5. SCHOLARSHIPS table
ALTER TABLE public.scholarships
  DROP CONSTRAINT IF EXISTS scholarships_student_id_fkey;
ALTER TABLE public.scholarships
  ADD CONSTRAINT scholarships_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 6. WALLETS table
ALTER TABLE public.wallets
  DROP CONSTRAINT IF EXISTS wallets_student_id_fkey;
ALTER TABLE public.wallets
  ADD CONSTRAINT wallets_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 7. CENTER_REWARDS table (center_owner_student_id)
ALTER TABLE public.center_rewards
  DROP CONSTRAINT IF EXISTS center_rewards_center_owner_student_id_fkey;
ALTER TABLE public.center_rewards
  ADD CONSTRAINT center_rewards_center_owner_student_id_fkey
  FOREIGN KEY (center_owner_student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 8. CENTER_REWARDS table (new_student_id)
ALTER TABLE public.center_rewards
  DROP CONSTRAINT IF EXISTS center_rewards_new_student_id_fkey;
ALTER TABLE public.center_rewards
  ADD CONSTRAINT center_rewards_new_student_id_fkey
  FOREIGN KEY (new_student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 9. EMAIL_DELIVERIES table
ALTER TABLE public.email_deliveries
  DROP CONSTRAINT IF EXISTS email_deliveries_student_id_fkey;
ALTER TABLE public.email_deliveries
  ADD CONSTRAINT email_deliveries_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 10. CONSENT_LOGS table
ALTER TABLE public.consent_logs
  DROP CONSTRAINT IF EXISTS consent_logs_user_id_fkey;
-- consent_logs might not have a direct FK, skip if error

-- 11. NOTIFICATION_DISPATCH_LOGS table
ALTER TABLE public.notification_dispatch_logs
  DROP CONSTRAINT IF EXISTS notification_dispatch_logs_student_id_fkey;
ALTER TABLE public.notification_dispatch_logs
  ADD CONSTRAINT notification_dispatch_logs_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 12. Also fix the students -> auth.users FK to cascade
ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_id_fkey;
ALTER TABLE public.students
  ADD CONSTRAINT students_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
