-- Center Management Schema Update
-- This script adds missing fields to the centers table and creates a center_members table

-- 1. Update centers table with all registration fields
ALTER TABLE public.centers 
ADD COLUMN IF NOT EXISTS center_type text,
ADD COLUMN IF NOT EXISTS owner_aadhaar text,
ADD COLUMN IF NOT EXISTS village text,
ADD COLUMN IF NOT EXISTS block text,
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS id_proof_url text,
ADD COLUMN IF NOT EXISTS address_proof_url text,
ADD COLUMN IF NOT EXISTS center_photo_url text,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. Create center_types lookup table
CREATE TABLE IF NOT EXISTS public.center_types (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Seed center types
INSERT INTO public.center_types (name) VALUES 
('School'),
('Coaching Center'),
('Tuition Center'),
('NGO'),
('Community Center'),
('Other')
ON CONFLICT (name) DO NOTHING;

-- 3. Create center_members table (for staff/coordinators)
CREATE TABLE IF NOT EXISTS public.center_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    center_id uuid REFERENCES public.centers(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'STAFF', -- OWNER, STAFF, COORDINATOR, VOLUNTEER
    phone text,
    email text,
    aadhaar_number text,
    photo_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.center_members ENABLE ROW LEVEL SECURITY;

-- 4. Policies for center_members
DROP POLICY IF EXISTS "Admins can manage all center members" ON public.center_members;
CREATE POLICY "Admins can manage all center members" ON public.center_members
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- 5. Policies for centers (Public can insert for registration)
-- Check if policy already exists to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'centers' AND policyname = 'Public can apply for center'
    ) THEN
        CREATE POLICY "Public can apply for center" ON public.centers
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Admins can manage all centers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'centers' AND policyname = 'Admins can manage all centers'
    ) THEN
        CREATE POLICY "Admins can manage all centers" ON public.centers
            FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
    END IF;
END $$;

-- 6. Add trigger for updated_at if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_center_members_updated_at ON public.center_members;
CREATE TRIGGER update_center_members_updated_at
    BEFORE UPDATE ON public.center_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
