-- Syllabus Management & Automated Exam System Schema

-- 1. Syllabuses Table
CREATE TABLE IF NOT EXISTS public.syllabuses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_level integer NOT NULL,
    subject text NOT NULL DEFAULT 'General Knowledge & Academics',
    topics jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of { "title": "...", "description": "..." }
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(class_level, subject)
);

-- 2. Exam Schedules Table (For Monthly 5th Exams)
CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_date date NOT NULL,
    class_level integer, -- Optional: null means all classes
    status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'NOTIFYING', 'LIVE', 'COMPLETED', 'CANCELLED')),
    recurring boolean DEFAULT true,
    auto_generate_questions boolean DEFAULT true,
    notifications_started_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 3. Automated Notification Logs (Email & WhatsApp)
CREATE TABLE IF NOT EXISTS public.notification_dispatch_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    schedule_id uuid REFERENCES public.exam_schedules(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    channel text NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    notif_type text NOT NULL CHECK (notif_type IN ('REMINDER_5D', 'REMINDER_4D', 'REMINDER_3D', 'REMINDER_2D', 'REMINDER_1D', 'EXAM_DAY', 'URGENT')),
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    provider_ref text, -- SID from WhatsApp provider or MessageID from Email
    error_message text,
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 4. AI Generation Logs
CREATE TABLE IF NOT EXISTS public.ai_generation_reports (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_level integer NOT NULL,
    syllabus_id uuid REFERENCES public.syllabuses(id),
    questions_generated integer DEFAULT 0,
    status text NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('PROCESSING', 'SUCCESS', 'FAILED')),
    prompt_used text,
    error_log text,
    created_at timestamptz DEFAULT now()
);

-- 5. RLS Policies
ALTER TABLE public.syllabuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_dispatch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_reports ENABLE ROW LEVEL SECURITY;

-- Helper check for admin (assume exists from previous Turner logic)
-- CREATE OR REPLACE FUNCTION public.is_admin() ...

-- Admin Policies
CREATE POLICY "Admins can manage syllabuses" ON public.syllabuses FOR ALL USING (public.is_admin());
CREATE POLICY "Everyone can view syllabuses" ON public.syllabuses FOR SELECT USING (true);

CREATE POLICY "Admins can manage exam schedules" ON public.exam_schedules FOR ALL USING (public.is_admin());
CREATE POLICY "Everyone can view exam schedules" ON public.exam_schedules FOR SELECT USING (true);

CREATE POLICY "Admins can view notification logs" ON public.notification_dispatch_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can view AI reports" ON public.ai_generation_reports FOR SELECT USING (public.is_admin());

-- 6. Recurring Exam Scheduler Logic (Cron-like stored procedure)
-- This would typically be triggered by an external cron or Supabase Edge Function
-- but we define the logic here for architectural clarity.

CREATE OR REPLACE FUNCTION public.schedule_monthly_exams()
RETURNS void AS $$
DECLARE
    next_exam_date date;
BEGIN
    -- Calculate next 5th of the month
    next_exam_date := make_date(
        extract(year from current_date + interval '1 month')::int,
        extract(month from current_date + interval '1 month')::int,
        5
    );

    -- Insert if not exists
    IF NOT EXISTS (SELECT 1 FROM public.exam_schedules WHERE exam_date = next_exam_date) THEN
        INSERT INTO public.exam_schedules (exam_date, status, auto_generate_questions)
        VALUES (next_exam_date, 'SCHEDULED', true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
