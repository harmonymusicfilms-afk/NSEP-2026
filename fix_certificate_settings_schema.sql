-- Fix for "Admin Settings Page Crash" bug
-- Adds the missing 'gphdm_config' column to the certificate_settings table

ALTER TABLE public.certificate_settings ADD COLUMN IF NOT EXISTS gphdm_config jsonb NOT NULL DEFAULT '{}'::jsonb;
