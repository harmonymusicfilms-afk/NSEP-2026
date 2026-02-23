-- Add payment details columns to centers table
ALTER TABLE centers 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- Update comments for clarity
COMMENT ON COLUMN centers.transaction_id IS 'Transaction / UTR ID for registration fee payment';
COMMENT ON COLUMN centers.payment_screenshot_url IS 'URL to the payment screenshot uploaded by the center principal';
