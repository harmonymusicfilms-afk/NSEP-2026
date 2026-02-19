-- Update exam_questions table with AI-related fields
ALTER TABLE public.exam_questions 
ADD COLUMN IF NOT EXISTS explanation text,
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS syllabus_topic text;

-- Add indexes for better performance on large question banks
CREATE INDEX IF NOT EXISTS idx_exam_questions_class_level ON public.exam_questions(class_level);
CREATE INDEX IF NOT EXISTS idx_exam_questions_syllabus_topic ON public.exam_questions(syllabus_topic);
