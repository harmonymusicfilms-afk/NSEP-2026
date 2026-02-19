-- Add referral_code and referred_by_student columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_student VARCHAR(20);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_referral_code ON public.students(referral_code);
CREATE INDEX IF NOT EXISTS idx_students_referred_by_student ON public.students(referred_by_student);

-- Create policy to allow students to view their own referral code
DROP POLICY IF EXISTS "Students can view own referral code" ON public.students;
CREATE POLICY "Students can view own referral code" ON public.students
FOR SELECT USING (true);

-- Create policy to allow students to update their own referral code
DROP POLICY IF EXISTS "Students can update own referral code" ON public.students;
CREATE POLICY "Students can update own referral code" ON public.students
FOR UPDATE USING (auth.uid() = id);

-- Allow students to read other students' referral codes for validation
DROP POLICY IF EXISTS "Students can view other referral codes" ON public.students;
CREATE POLICY "Students can view other referral codes" ON public.students
FOR SELECT USING (referral_code IS NOT NULL);
