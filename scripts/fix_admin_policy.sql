
-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Admins can view their own entry" ON public.admin_users;
DROP POLICY IF EXISTS "Enable read access for authenticated admins" ON public.admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.admin_users;

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read their own data
CREATE POLICY "Enable read access for authenticated admins"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow inserting into admin_users (for setup script)
-- NOTE: In production, this should be restricted, but for setup we allow it
CREATE POLICY "Enable insert for authenticated users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
