-- Setup Supabase Storage for Student Photos
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for student photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-photos',
  'student-photos',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the storage bucket
-- Allow anyone to read student photos (public access)
CREATE POLICY "Public Access to Student Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

-- Allow authenticated users (admins) to upload student photos
CREATE POLICY "Admins Can Upload Student Photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to update student photos
CREATE POLICY "Admins Can Update Student Photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to delete student photos
CREATE POLICY "Admins Can Delete Student Photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-photos'
  AND auth.role() = 'authenticated'
);

-- 3. Optional: Create a function to automatically clean up old photos
CREATE OR REPLACE FUNCTION delete_old_student_photo()
RETURNS void AS $$
BEGIN
  -- Delete photos older than 1 year that are no longer linked to students
  DELETE FROM storage.objects
  WHERE bucket_id = 'student-photos'
  AND created_at < NOW() - INTERVAL '1 year'
  AND name NOT IN (
    SELECT DISTINCT photo_url
    FROM public.students
    WHERE photo_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;