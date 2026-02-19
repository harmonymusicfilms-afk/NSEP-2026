-- Rename class_level to class in exam_sessions
ALTER TABLE public.exam_sessions 
RENAME COLUMN class_level TO "class";

-- Create exam_config table
CREATE TABLE IF NOT EXISTS public.exam_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    time_per_question integer DEFAULT 5,
    demo_question_count integer DEFAULT 60,
    gap_between_questions integer DEFAULT 60,
    fees jsonb DEFAULT '{"1-5": 250, "6-8": 300, "9-12": 350}'::jsonb,
    marks_per_correct integer DEFAULT 4,
    marks_per_wrong integer DEFAULT -4,
    created_at timestamptz DEFAULT now()
);

-- Insert default config if table is empty
INSERT INTO public.exam_config (time_per_question, demo_question_count, gap_between_questions, fees, marks_per_correct, marks_per_wrong)
SELECT 5, 60, 60, '{"1-5": 250, "6-8": 300, "9-12": 350}'::jsonb, 4, -4
WHERE NOT EXISTS (SELECT 1 FROM public.exam_config);

-- Enable RLS on exam_config
ALTER TABLE public.exam_config ENABLE ROW LEVEL SECURITY;

-- Helper function is_admin already exists from previous turn

-- Admin can manage config
CREATE POLICY "Admins can manage exam config" ON public.exam_config
FOR ALL USING (public.is_admin());

-- Students and everyone can view exam config
CREATE POLICY "Everyone can view exam config" ON public.exam_config
FOR SELECT USING (true);
