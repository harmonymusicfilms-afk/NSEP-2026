-- Add user_id to centers to enable login
ALTER TABLE public.centers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_centers_user_id ON public.centers(user_id);

-- Update RLS policies for centers
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

-- Policy: Centers can view their own data
DROP POLICY IF EXISTS "Centers can view their own profile" ON public.centers;
CREATE POLICY "Centers can view their own profile" ON public.centers
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Centers can update their own data
DROP POLICY IF EXISTS "Centers can update their own profile" ON public.centers;
CREATE POLICY "Centers can update their own profile" ON public.centers
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Centers can see their referred students
-- Note: This is already possible if we allow centers to read the students table with a filter
-- Adding a policy to students table for centers
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Centers can view their referred students" ON public.students;
CREATE POLICY "Centers can view their referred students" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.centers
            WHERE centers.user_id = auth.uid()
            AND centers.center_code = students.referred_by_center_code
        )
    );
