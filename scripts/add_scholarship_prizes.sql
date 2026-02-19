-- Add scholarship_prizes column to public.exam_config table
ALTER TABLE public.exam_config 
ADD COLUMN IF NOT EXISTS scholarship_prizes jsonb DEFAULT '{"1": 10000, "2": 7500, "3": 5000, "4": 3000, "5": 2000, "6": 1500, "7": 1000, "8": 750, "9": 500, "10": 250}'::jsonb;

-- Ensure RLS allows admin to update
-- (The existing policy for manage should cover this if it exists, 
-- but we can re-verify or re-apply if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'exam_config' AND policyname = 'Admins can manage exam config'
    ) THEN
        CREATE POLICY "Admins can manage exam config" ON public.exam_config
        FOR ALL USING (public.is_admin());
    END IF;
END $$;
