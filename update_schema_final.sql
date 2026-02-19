-- Rename class_level to class in students
ALTER TABLE public.students 
RENAME COLUMN class_level TO "class";

-- Rename referred_by_center_code to referred_by_center in students
ALTER TABLE public.students 
RENAME COLUMN referred_by_center_code TO referred_by_center;

-- Rename class_level to class in exam_results
ALTER TABLE public.exam_results 
RENAME COLUMN class_level TO "class";

-- Rename class_level to class in scholarships
ALTER TABLE public.scholarships 
RENAME COLUMN class_level TO "class";

-- Add password_hash to admin_users if it doesn't exist
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS password_hash text;
