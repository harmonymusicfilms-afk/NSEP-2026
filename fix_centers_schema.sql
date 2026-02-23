-- Fix centers table schema to match frontend requirements
-- Run this in Supabase SQL Editor

ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS center_type text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS owner_aadhaar text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS village text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS block text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS id_proof_url text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS address_proof_url text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS center_photo_url text;
ALTER TABLE public.centers ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add comments for clarity
COMMENT ON COLUMN public.centers.user_id IS 'Link to the authenticated user who owns this center';
COMMENT ON COLUMN public.centers.center_type IS 'Type of center (SCHOOL, COACHING, etc.)';
COMMENT ON COLUMN public.centers.owner_aadhaar IS 'Aadhaar number of the center owner';
COMMENT ON COLUMN public.centers.village IS 'Village or town of the center';
COMMENT ON COLUMN public.centers.block IS 'Block or tehsil of the center';
COMMENT ON COLUMN public.centers.pincode IS 'Pincode of the center location';
COMMENT ON COLUMN public.centers.id_proof_url IS 'URL to the uploaded ID proof image';
COMMENT ON COLUMN public.centers.address_proof_url IS 'URL to the uploaded address proof image';
COMMENT ON COLUMN public.centers.center_photo_url IS 'URL to the uploaded center photo image';
COMMENT ON COLUMN public.centers.rejection_reason IS 'Reason provided if center application is rejected';
