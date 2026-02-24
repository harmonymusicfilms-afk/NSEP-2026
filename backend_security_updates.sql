-- ALter exam_sessions to track fraud data
ALTER TABLE public.exam_sessions 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Create function to prevent tampering with published results
CREATE OR REPLACE FUNCTION public.prevent_result_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.result_status = 'PUBLISHED' THEN
        RAISE EXCEPTION 'Cannot modify published exam results';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for exam_results
DROP TRIGGER IF EXISTS trg_prevent_result_tampering ON public.exam_results;
CREATE TRIGGER trg_prevent_result_tampering
    BEFORE UPDATE OR DELETE ON public.exam_results
    FOR EACH ROW EXECUTE FUNCTION public.prevent_result_tampering();

-- Create function to prevent certificate modification
CREATE OR REPLACE FUNCTION public.prevent_certificate_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_valid = true AND NEW.is_valid = false THEN
        -- Allow invalidating (revoking) a certificate
        RETURN NEW;
    END IF;
    
    -- Otherwise, prevent changes to core fields
    IF OLD.certificate_id_display != NEW.certificate_id_display OR
       OLD.student_id != NEW.student_id OR
       OLD.exam_result_id != NEW.exam_result_id THEN
        RAISE EXCEPTION 'Cannot modify immutable certificate details';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for certificates
DROP TRIGGER IF EXISTS trg_prevent_certificate_tampering ON public.certificates;
CREATE TRIGGER trg_prevent_certificate_tampering
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.prevent_certificate_tampering();

-- Policy for Admin Logs to ensure they are write-only for admins?
-- Actually existing policy is: "Admins can manage admin_logs" which allows update/delete.
-- We should restrict DELETE/UPDATE on admin_logs.
CREATE OR REPLACE FUNCTION public.prevent_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Admin logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_admin_logs ON public.admin_logs;
CREATE TRIGGER trg_protect_admin_logs
    BEFORE UPDATE OR DELETE ON public.admin_logs
    FOR EACH ROW EXECUTE FUNCTION public.prevent_log_modification();
